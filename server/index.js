// server/index.js
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fetch = require("node-fetch"); // v2.x for CommonJS
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Simple health check
app.get("/", (_req, res) => {
  res.send("OK: backend running. Use POST /api/image-to-3d");
});

// Log key presence without leaking it
console.log("Has MESHY_API_KEY:", !!process.env.MESHY_API_KEY);

// Create a Meshy Image-to-3D task
app.post("/api/image-to-3d", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "no file" });

    // Recommend JPG/PNG; WEBP may fail
    const mime = (req.file.mimetype || "").toLowerCase();
    if (!/jpe?g|png/.test(mime)) {
      return res.status(415).json({ error: "Please upload JPG/PNG (WEBP may be unsupported)" });
    }

    const b64 = req.file.buffer.toString("base64");
    const dataUri = `data:${mime};base64,${b64}`;

    const resp = await fetch("https://api.meshy.ai/openapi/v1/image-to-3d", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MESHY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: dataUri,
        // Minimal params; extend as needed:
        // title: "My 3D from Image",
        // enable_pbr: true,
      }),
    });

    const text = await resp.text();
    if (!resp.ok) {
      console.error("Meshy create error:", resp.status, text);
      return res.status(resp.status).json({ error: `Meshy error (${resp.status}): ${text}` });
    }

    let taskId;
    try {
      const j = JSON.parse(text);
      taskId = j.result || j.id || j.task_id || j.taskId;
    } catch (e) {}

    if (!taskId) {
      return res.status(500).json({ error: "Task created but no task id returned" });
    }

    res.json({ taskId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

// Static hosting for downloaded models
const MODELS_DIR = path.join(__dirname, "models");
if (!fs.existsSync(MODELS_DIR)) fs.mkdirSync(MODELS_DIR);
app.use("/models", express.static(MODELS_DIR));

// Poll task status; when done, download GLB/USDZ locally and return local URLs
app.get("/api/image-to-3d/:taskId", async (req, res) => {
  try {
    const url = `https://api.meshy.ai/openapi/v1/image-to-3d/${encodeURIComponent(req.params.taskId)}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${process.env.MESHY_API_KEY}` } });
    const text = await r.text();

    if (!r.ok) {
      console.error("Meshy status error:", r.status, text);
      return res.status(r.status).json({ error: `Meshy error (${r.status}): ${text}` });
    }

    const j = JSON.parse(text);

    // Normalized fields across possible variants
    const status = j.status || j.task_status;
    const progress = j.progress ?? j.task_progress ?? 0;
    const urls = j.model_urls || j.result || {};

    if (status === "SUCCEEDED" && (urls.glb || urls.usdz)) {
      const port = process.env.PORT || 3000;

      // Download GLB
      let localGlb = null;
      if (urls.glb) {
        try {
          const glbResp = await fetch(urls.glb);
          if (!glbResp.ok) throw new Error(`GLB download HTTP ${glbResp.status}`);
          const outPath = path.join(MODELS_DIR, `${req.params.taskId}.glb`);
          await streamToFile(glbResp.body, outPath);
          localGlb = `http://localhost:${port}/models/${req.params.taskId}.glb`;
        } catch (e) {
          console.error("GLB download failed:", e.message);
        }
      }

      // Download USDZ (optional)
      let localUsdz = null;
      if (urls.usdz) {
        try {
          const uResp = await fetch(urls.usdz);
          if (uResp.ok) {
            const upath = path.join(MODELS_DIR, `${req.params.taskId}.usdz`);
            await streamToFile(uResp.body, upath);
            localUsdz = `http://localhost:${port}/models/${req.params.taskId}.usdz`;
          }
        } catch (e) {
          console.error("USDZ download failed:", e.message);
        }
      }

      return res.json({ status: "SUCCEEDED", glb: localGlb, usdz: localUsdz, progress: 100 });
    }

    if (status === "FAILED") {
      const errorMsg = j.task_error?.message || j.error || "failed";
      return res.json({ status: "FAILED", error: errorMsg });
    }

    return res.json({ status, progress });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "FAILED", error: "status query error" });
  }
});

function streamToFile(readable, filePath){
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    readable.pipe(file);
    file.on("finish", resolve);
    file.on("error", reject);
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("✅ Server running at http://localhost:" + port));
