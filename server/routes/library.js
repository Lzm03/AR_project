import express from "express";
import { prisma } from "../prisma/client.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

/**
 * GET /api/library
 * 返回当前用户的 Library（带 Character）
 */
router.get("/", requireAuth, async (req, res) => {
  const items = await prisma.libraryItem.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      character: true, // ⭐ 关键：拿到 Character
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 🔁 转成前端需要的结构
  const result = items.map(item => ({
    id: item.character.id,
    name: item.character.name,

    model: {
      idle: item.character.idleModel,
      talk: item.character.talkModel,
    },

    scene: {
      bg: item.character.bgImage,
    },

    createdAt: item.createdAt,
  }));

  res.json(result);
});

export default router;
