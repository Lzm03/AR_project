import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma/client.js";

/**
 * ⚠️ 验证码仍然用内存（注册完成即失效，OK 的）
 */
const codes = new Map();

/* ===== send verification code ===== */
export function sendCode(email) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codes.set(email, code);
  console.log(`📨 [DEV] verification code for ${email}: ${code}`);
}

/* ===== signup ===== */
export async function signup(email, password, code) {
  const saved = codes.get(email);
  if (!saved || saved !== code) {
    throw new Error("Invalid verification code");
  }

  const exists = await prisma.user.findUnique({
    where: { email },
  });
  if (exists) {
    throw new Error("User already exists");
  }

  const hash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hash,
    },
  });

  codes.delete(email);
}

/* ===== login ===== */
export async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new Error("Invalid email or password");
  }

  const sid = crypto.randomUUID();

  await prisma.session.create({
    data: {
      id: sid,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000), // 7 天
    },
  });

  return sid;
}

/* ===== logout ===== */
export async function logout(sid) {
  await prisma.session.deleteMany({
    where: { id: sid },
  });
}

/* ===== get user by session ===== */
export async function getUserBySession(sid) {
  const session = await prisma.session.findFirst({
    where: {
      id: sid,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: true,
    },
  });

  return session?.user || null;
}

/* ===== library ===== */
export async function getLibrary(email) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) return [];

  return prisma.libraryItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

// auth.service.js
export async function addToLibrary(email, name) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  return prisma.libraryItem.create({
    data: {
      userId: user.id,
      name,
    },
  });
}