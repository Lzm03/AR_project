import { WebSocketServer } from "ws";
import { createRecognizer } from "../services/stt.service.js";

export default function setupSpeechWS(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", ws => {
    console.log("🎙 WS connected");
    let closed = false;

    const recognizeStream = createRecognizer(ws);

    ws.on("message", chunk => {
      if (!closed) recognizeStream.write(chunk);
    });

    ws.on("close", () => {
      closed = true;
      try { recognizeStream.end(); } catch {}
    });
  });
}
