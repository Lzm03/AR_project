// services/character.service.js
import { prisma } from "../prisma/client.js";

export async function createCharacter(data) {
  return prisma.character.create({
    data: {
      id: data.id,
      name: data.name,
      prompt: data.prompt,
      idleModel: data.model.idle,
      talkModel: data.model.talk,
      bgImage: data.scene.bg,
      voiceId: data.voice.voice_id,
      userId: data.userId,
    },
  });
}

export async function getCharacter(id) {
  return prisma.character.findUnique({
    where: { id },
  });
}

export async function listCharactersByUser(userId) {
  return prisma.character.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
