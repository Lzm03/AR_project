// // server.js
// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import authRouter from "./routes/auth.js";

// export function startServer(port = 3001) {
//   const app = express();

//   app.use(express.json());
//   app.use(cookieParser());

//   app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   }));

//   app.use("/api/auth", authRouter);

//   app.listen(port, () => {
//     console.log(`🚀 API running at http://localhost:${port}`);
//   });
// }


// // server.js
// import http from "http";
// import express from "express";
// import cors from "cors";
// import path from "path";
// import { fileURLToPath } from "url";
// import cookieParser from "cookie-parser";

// /* ===== 路由 ===== */
// import authRouter from "./routes/auth.js";
// import chatRouter from "./routes/chat.js";
// import charactersRouter from "./routes/characters.js";

// /* ===== WebSocket ===== */
// import setupSpeechWS from "./ws/speech.ws.js";

// /* ===== 静态目录 ===== */
// import { PUBLIC_DIR } from "./config/paths.js";

// /* ===== ESM dirname ===== */
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export function startServer() {
//   const app = express();

//   /* ===== 基础中间件 ===== */
//   app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   }));

//   app.use(express.json());
//   app.use(cookieParser());

//   /* ===== 健康检查 ===== */
//   app.get("/", (_, res) => {
//     res.send("OK");
//   });

//   /* ===== 静态资源 ===== */
//   app.use("/public", express.static(PUBLIC_DIR));

//   /* ===== API 路由 ===== */
//   app.use("/api/auth", authRouter);
//   app.use("/api/characters", charactersRouter);
//   app.use("/api/chat", chatRouter);

//   /* ===== HTTP + WebSocket ===== */
//   const server = http.createServer(app);
//   setupSpeechWS(server);

//   /* ===== 启动 ===== */
//   const PORT = process.env.PORT || 3001;

//   server.listen(PORT, "0.0.0.0", () => {
//     console.log(`✅ Server listening on ${PORT}`);
//   });
// }



// server.js
// server.js
import http from "http";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

import chatRouter from "./routes/chat.js";
import charactersRouter from "./routes/characters.js";
import authRouter from "./routes/auth.js";
import setupSpeechWS from "./ws/speech.ws.js";
import { PUBLIC_DIR } from "./config/paths.js";
import libraryRouter from "./routes/library.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function startServer(port = 3001) {
  const app = express();

  /* ===== 基础中间件 ===== */
  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  /* ===== 🔥 关键：一定要在最前面暴露 public ===== */
  console.log("📂 Public dir:", PUBLIC_DIR);
  app.use("/public", express.static(PUBLIC_DIR));

  /* ===== API ===== */
  app.use("/api/auth", authRouter);
  app.use("/api/characters", charactersRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/library", libraryRouter);

  app.get("/", (_, res) => res.send("OK"));

  /* ===== WS ===== */
  const server = http.createServer(app);
  setupSpeechWS(server);

  server.listen(port, "0.0.0.0", () => {
    console.log(`✅ Server listening on http://localhost:${port}`);
  });
}
