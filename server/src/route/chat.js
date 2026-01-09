const express = require("express");
const router = express.Router();
const systemTTS = require("../tts/systemTTS");

router.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    const reply = `我聽到你講：「${prompt}」。有咩我可以幫你？`;

    const audioUrl = await systemTTS(reply);

    res.json({ text: reply, audioUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
