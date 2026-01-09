import { WebSocketServer } from "ws";
import speech from "@google-cloud/speech";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { PassThrough } from "stream";

ffmpeg.setFfmpegPath(ffmpegPath);

const wss = new WebSocketServer({ port: 3002 });

const client = new speech.SpeechClient({
  keyFilename: "/Users/liuzhiming/Desktop/AR_project/server/ar-project-483707-0885fe3f4063.json"
});

console.log("🧠 Google Streaming WS running at ws://localhost:3002");

wss.on("connection", ws => {
  console.log("🎙 client connected");

  let closed = false; // ⭐ 防止重复关闭

  const request = {
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: "zh-HK",
      enableAutomaticPunctuation: true,
    },
    interimResults: true,
  };

  const recognizeStream = client
    .streamingRecognize(request)
    .on("data", data => {
      const result = data.results?.[0];
      if (!result || closed) return;

      ws.send(JSON.stringify({
        text: result.alternatives[0].transcript,
        final: result.isFinal
      }));
    })
    .on("error", err => {
      if (!closed) {
        console.error("❌ Google STT error:", err.message);
      }
    });

  // 音频输入流
  const audioInput = new PassThrough();

  ffmpeg(audioInput)
    .inputFormat("webm")
    .audioChannels(1)
    .audioFrequency(16000)
    .audioCodec("pcm_s16le")
    .format("s16le")
    .on("start", () => {
      console.log("🎧 ffmpeg started");
    })
    .on("error", err => {
      if (!closed) {
        console.error("❌ ffmpeg error:", err.message);
      }
    })
    .pipe(recognizeStream, { end: false });

  // 接收音频（只在未关闭时写）
  ws.on("message", chunk => {
    if (closed) return;
    audioInput.write(chunk);
  });

  ws.on("close", () => {
    if (closed) return;
    closed = true;

    console.log("🔌 client disconnected");

    // ⭐ 延迟关闭，给 ffmpeg / Google 时间 flush
    setTimeout(() => {
      try {
        audioInput.end();
        recognizeStream.end();
      } catch (e) {}
    }, 200);
  });
});
