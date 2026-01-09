const express = require("express");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 你以后继续把 image-to-3d API 放这里
router.post("/image-to-3d", upload.single("image"), (req, res) => {
  res.json({ message: "Meshy API here (next step)" });
});

module.exports = router;
