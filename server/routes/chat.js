// import { Router } from "express";
// import { askLLM } from "../services/llm.service.js";
// import { synthesizeSpeech } from "../services/tts.service.js";
// import { getCharacter } from "../services/character.service.js";

// const router = Router();

// router.post("/", async (req, res) => {
//   const { prompt, characterId } = req.body;

//   const character = await getCharacter(characterId);
//   console.log("character =", character);

//   if (!character) return res.status(400).json({ error: "No character" });

//   const text = await askLLM(character.prompt, prompt);
//   const audioBase64 = await synthesizeSpeech(text, character.voiceId);

//   res.json({
//   text,
//   audioBase64
// });
// });

// export default router;

import { Router } from "express";
import { askLLM } from "../services/llm.service.js";
import { synthesizeSpeech } from "../services/tts.service.js";
import { getCharacter } from "../services/character.service.js";

const router = Router();

router.post("/", async (req, res) => {
  const { prompt, characterId } = req.body;

  const character = await getCharacter(characterId);
  if (!character) return res.status(400).json({ error: "No character" });

  // 设置流式响应头
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders?.();


  let fullText = "";

  // ⬇️ 流式 LLM 输出
  await askLLM(
    character.prompt,
    prompt,
    (token) => {
      fullText += token;
      res.write(`data: ${token}\n\n`);
    }
  );

  // ⬇️ 生成语音
  const audioBase64 = await synthesizeSpeech(fullText, character.voiceId);

  // ⬇️ 完成事件
  res.write(`event: done\n`);
  res.write(`data: ${JSON.stringify({ text: fullText, audioBase64 })}\n\n`);

  res.end();  // 完成 SSE
});

export default router;
