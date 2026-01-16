import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import {
  createCharacter,
  getCharacter,
  listCharactersByUser
} from "../services/character.service.js";
import { PUBLIC_DIR } from "../config/paths.js";
import { prisma } from "../prisma/client.js";
import { getUserBySession } from "../services/auth.service.js";


const router = express.Router();
const upload = multer({ dest: "tmp/" });

router.post(
  "/",
  upload.fields([
    { name: "idle", maxCount: 1 },
    { name: "talk", maxCount: 1 },
    { name: "bg", maxCount: 1 },
  ]),
  async (req, res) => {
    const sid = req.cookies?.sid;
    if (!sid) return res.status(401).end();

    const user = await getUserBySession(sid);
    if (!user) return res.status(401).end();

    const { name, prompt, voice_id } = req.body;
    if (!name || !prompt || !voice_id) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (!req.files?.idle || !req.files?.talk || !req.files?.bg) {
      return res.status(400).json({ error: "Missing files" });
    }

    const id = crypto.randomUUID();
    const baseDir = path.join(PUBLIC_DIR, "characters", id);
    fs.mkdirSync(baseDir, { recursive: true });

    const move = (file, filename) => {
      const target = path.join(baseDir, filename);
      fs.renameSync(file.path, target);
      return `/public/characters/${id}/${filename}`;
    };

    // 1️⃣ 写 Character 表
    const character = await createCharacter({
      id,
      name,
      prompt,
      model: {
        idle: move(req.files.idle[0], "idle.glb"),
        talk: move(req.files.talk[0], "talk.glb"),
      },
      scene: {
        bg: move(req.files.bg[0], "bg.jpg"),
      },
      voice: {
        voice_id,
      },
      userId: user.id,
    });

    // 2️⃣ 写 LibraryItem 表
    await prisma.libraryItem.create({
      data: {
        userId: user.id,
        characterId: character.id,
      },
    });

    res.json(character);
  }
);

/* 获取单个角色 */
router.get("/:id", async (req, res) => {
  const c = await getCharacter(req.params.id);
  if (!c) return res.status(404).end();

  const isSystem = c.userId === "SYSTEM_USER";

  res.json({
    id: c.id,
    name: c.name,
    prompt: c.prompt,

    model: {
      idle: isSystem ? "/models/idle.glb" : c.idleModel,
      talk: isSystem ? "/models/talk.glb" : c.talkModel,
    },

    scene: {
      bg: isSystem ? "/bg/confucius.png" : c.bgImage,
    },

    voice: {
      voice_id: c.voiceId,
    },

    createdAt: c.createdAt,
  });
});




/* 角色列表（Library 用） */
router.get("/", async (req, res) => {
  const sid = req.cookies?.sid;
  if (!sid) return res.status(401).end();

  const user = await getUserBySession(sid);
  if (!user) return res.status(401).end();

  const list = await listCharactersByUser(user.id);
  res.json(list);
});


export default router;
