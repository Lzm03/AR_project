require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fetch = require("node-fetch"); // v2.x for CommonJS
const fs = require("fs");
const path = require("path");
const { pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// serve static models folder
const MODELS_DIR = path.join(__dirname, "models");
if (!fs.existsSync(MODELS_DIR)) fs.mkdirSync(MODELS_DIR, { recursive: true });
app.use("/models", express.static(MODELS_DIR));

// Simple health check
app.get("/", (_req, res) => {
  res.send("OK: backend running. Use POST /api/image-to-3d");
});

// Log key presence (don't print the key itself)
console.log("Has MESHY_API_KEY:", !!process.env.MESHY_API_KEY);

// POST /api/image-to-3d
app.post("/api/image-to-3d", upload.single("image"), async (req, res) => {
  try {
    if (!process.env.MESHY_API_KEY) {
      return res.status(500).json({ error: "MESHY_API_KEY not configured" });
    }

    if (!req.file) return res.status(400).json({ error: "no file" });

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
    } catch (e) {
      console.warn("Create response not JSON:", e.message);
    }

    if (!taskId) {
      return res.status(500).json({ error: "Task created but no task id returned" });
    }

    res.json({ taskId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

// GET /api/image-to-3d/:taskId
app.get("/api/image-to-3d/:taskId", async (req, res) => {
  try {
    if (!process.env.MESHY_API_KEY) {
      return res.status(500).json({ error: "MESHY_API_KEY not configured" });
    }

    const url = `https://api.meshy.ai/openapi/v1/image-to-3d/${encodeURIComponent(req.params.taskId)}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${process.env.MESHY_API_KEY}` } });
    const text = await r.text();

    if (!r.ok) {
      console.error("Meshy status error:", r.status, text);
      return res.status(r.status).json({ error: `Meshy error (${r.status}): ${text}` });
    }

    const j = JSON.parse(text);

    const status = j.status || j.task_status;
    const progress = j.progress ?? j.task_progress ?? 0;
    const urls = j.model_urls || j.result || {};

    if (status === "SUCCEEDED" && (urls.glb || urls.usdz)) {
      // Download GLB
      let localGlb = null;
      if (urls.glb) {
        try {
          const glbResp = await fetch(urls.glb);
          if (!glbResp.ok) throw new Error(`GLB download HTTP ${glbResp.status}`);
          const outPath = path.join(MODELS_DIR, `${req.params.taskId}.glb`);
          // use pipeline for robust streaming
          await pipelineAsync(glbResp.body, fs.createWriteStream(outPath));
          // Use request host/protocol so the returned URL is externally reachable
          const externalBase = `${req.protocol}://${req.get('host')}`;
          localGlb = `${externalBase}/models/${req.params.taskId}.glb`;
        } catch (e) {
          console.error("GLB download failed:", e.message);
        }
      }

      // Download USDZ (optional)
      let localUsdz = null;
      if (urls.usdz) {
        try {
          const uResp = await fetch(urls.usdz);
          if (!uResp.ok) throw new Error(`USDZ download HTTP ${uResp.status}`);
          const upath = path.join(MODELS_DIR, `${req.params.taskId}.usdz`);
          await pipelineAsync(uResp.body, fs.createWriteStream(upath));
          const externalBase = `${req.protocol}://${req.get('host')}`;
          localUsdz = `${externalBase}/models/${req.params.taskId}.usdz`;
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

const port = parseInt(process.env.PORT, 10) || 3000;
const host = '0.0.0.0';
app.listen(port, host, () => {
  console.log(`✅ Server listening on ${host}:${port}`);
  console.log(`process.env.PORT = ${process.env.PORT}`);
  console.log("NOTE: Use the Railway-provided domain (not localhost) to access this service from the internet.");
});
