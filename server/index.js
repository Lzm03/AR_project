// server/index.js

const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fetch = require("node-fetch"); // v2.x for CommonJS
const fs = require("fs");
const { pipeline } = require("stream");
const { promisify } = require("util");
const pipelineAsync = promisify(pipeline);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// ==== 1) Serve FRONTEND (STATIC HOSTING) ====
const FRONTEND_DIR = path.join(__dirname, "..", "web");
console.log("Serving frontend from:", FRONTEND_DIR);

// 静态文件托管（如 index.html、css、js、assets）
app.use(express.static(FRONTEND_DIR));

// ==== 2) Serve MODELS folder (GLB / USDZ) ====
const MODELS_DIR = path.join(__dirname, "models");
if (!fs.existsSync(MODELS_DIR)) fs.mkdirSync(MODELS_DIR, { recursive: true });
app.use("/models", express.static(MODELS_DIR));

// ==== 3) Health check ====
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "backend running" });
});

// ==== Debug:是否有 Meshy Key ====
console.log("Has MESHY_API_KEY:", !!process.env.MESHY_API_KEY);

// ==== 4) Create Meshy task ====
app.post("/api/image-to-3d", upload.single("image"), async (req, res) => {
  try {
    if (!process.env.MESHY_API_KEY)
      return res.status(500).json({ error: "Missing MESHY_API_KEY" });

    if (!req.file) return res.status(400).json({ error: "no file uploaded" });

    const mime = (req.file.mimetype || "").toLowerCase();
    if (!/jpe?g|png/.test(mime)) {
      return res.status(415).json({ error: "Only JPG/PNG supported" });
    }

    const b64 = req.file.buffer.toString("base64");
    const dataUri = `data:${mime};base64,${b64}`;

    const resp = await fetch("https://api.meshy.ai/openapi/v1/image-to-3d", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MESHY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_url: dataUri }),
    });

    const text = await resp.text();
    if (!resp.ok) return res.status(resp.status).json({ error: text });

    let j = {};
    try {
      j = JSON.parse(text);
    } catch {}

    const taskId =
      j.result || j.id || j.task_id || j.taskId || null;

    if (!taskId)
      return res.status(500).json({ error: "Meshy returned no task id" });

    return res.json({ taskId });
  } catch (err) {
    console.error("Create error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

// ==== 5) Poll Meshy ====
app.get("/api/image-to-3d/:taskId", async (req, res) => {
  try {
    const url = `https://api.meshy.ai/openapi/v1/image-to-3d/${req.params.taskId}`;

    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.MESHY_API_KEY}` },
    });

    const text = await r.text();
    if (!r.ok) return res.status(r.status).json({ error: text });

    let j = {};
    try {
      j = JSON.parse(text);
    } catch {}

    const status = j.status || j.task_status;
    const urls = j.model_urls || j.result || {};

    // status not finished
    if (status !== "SUCCEEDED") {
      return res.json({ status, progress: j.progress ?? 0 });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // ---- Download GLB ----
    let glb = null;
    if (urls.glb) {
      try {
        const glbResp = await fetch(urls.glb);
        const glbPath = path.join(MODELS_DIR, `${req.params.taskId}.glb`);
        await pipelineAsync(glbResp.body, fs.createWriteStream(glbPath));
        glb = `${baseUrl}/models/${req.params.taskId}.glb`;
      } catch (e) {
        console.error("GLB download failed:", e.message);
      }
    }

    // ---- Download USDZ ----
    let usdz = null;
    if (urls.usdz) {
      try {
        const uResp = await fetch(urls.usdz);
        const uPath = path.join(MODELS_DIR, `${req.params.taskId}.usdz`);
        await pipelineAsync(uResp.body, fs.createWriteStream(uPath));
        usdz = `${baseUrl}/models/${req.params.taskId}.usdz`;
      } catch (e) {
        console.error("USDZ download failed:", e.message);
      }
    }

    return res.json({
      status: "SUCCEEDED",
      glb,
      usdz,
      progress: 100,
    });
  } catch (err) {
    console.error("Poll error:", err);
    return res.status(500).json({ status: "FAILED", error: "server error" });
  }
});

// ==== 6) SPA FALLBACK (NO PATH-TO-REGEXP) ====
app.use((req, res, next) => {
  try {
    if (req.method !== "GET") return next();

    const p = req.path || "";

    // 不拦截 API 和 models
    if (p.startsWith("/api") || p.startsWith("/models")) return next();

    // 不拦截静态资源（带扩展名）
    if (/\.[a-zA-Z0-9]{1,8}$/.test(p)) return next();

    // 返回前端首页
    const indexPath = path.join(FRONTEND_DIR, "index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }

    return next();
  } catch {
    return next();
  }
});

// ==== 7) Start server ====
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
