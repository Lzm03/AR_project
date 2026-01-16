import { Router } from "express";
import { askLLM } from "../services/llm.service.js";
import { synthesizeSpeech } from "../services/tts.service.js";
import { getCharacter } from "../services/character.service.js";

const router = Router();

router.post("/", async (req, res) => {
  const { prompt, characterId } = req.body;

  const character = await getCharacter(characterId);
  console.log("character =", character);

  if (!character) return res.status(400).json({ error: "No character" });

  const text = await askLLM(character.prompt, prompt);
  const audioUrl = await synthesizeSpeech(text, character.voiceId);

  res.json({ text, audioUrl });
});

export default router;
