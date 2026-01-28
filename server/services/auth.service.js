import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma/client.js";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * ⚠️ 验证码仍然用内存（注册完成即失效，OK 的）
 */
const codes = new Map();


/* ===== send verification code (Resend版本) ===== */
export async function sendCode(email) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // 保存验证码到数据库
  await prisma.verifyCode.upsert({
    where: { email },
    update: {
      code,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 分钟
    },
    create: {
      email,
      code,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    },
  });

  // Resend 发邮件
  await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: email,
    subject: "Your CHOP Reality Verification Code",
    html: `
      <div style="font-family:Arial;padding:20px;">
        <h2>Your verification code</h2>
        <p style="font-size:22px;font-weight:bold;letter-spacing:2px;">
          ${code}
        </p>
        <p>This code is valid for <b>10 minutes</b>.</p>
      </div>
    `,
  });
}

/* ===== signup ===== */
export async function signup(email, password, code) {
  const record = await prisma.verifyCode.findUnique({
    where: { email },
  });

  if (!record || record.code !== code || record.expiresAt < new Date()) {
    throw new Error("Invalid or expired verification code");
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

  // 删除验证码
  await prisma.verifyCode.delete({
    where: { email },
  });
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
