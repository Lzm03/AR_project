import axios from "axios";
import fs from "fs";
import path from "path";
import { PUBLIC_DIR } from "../config/paths.js";

/**
 * @param {string} text
 * @param {string} voiceId
 */
export async function synthesizeSpeech(text, voiceId) {
  if (!voiceId) {
    throw new Error("voiceId is required for TTS");
  }

  const filename = `tts_${Date.now()}.mp3`;
  const filepath = path.join(PUBLIC_DIR, filename);

  const res = await axios.post(
    "https://api-bj.minimaxi.com/v1/t2a_v2",
    {
      model: "speech-2.6-hd",
      text,
      language_boost: "Chinese,Yue",

      voice_setting: {
        voice_id: voiceId,   // ✅ 直接用 character.voiceId
        speed: 1,
        vol: 1,
        pitch: 0,
        emotion: "calm",
      },

      audio_setting: {
        format: "mp3",
        sample_rate: 32000,
        bitrate: 128000,
        channel: 1,
      },

      output_format: "hex",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const hex = res.data?.data?.audio;
  if (!hex) {
    throw new Error("No audio returned from TTS");
  }

  fs.writeFileSync(filepath, Buffer.from(hex, "hex"));
  return Buffer.from(hex, "hex").toString("base64");
}
