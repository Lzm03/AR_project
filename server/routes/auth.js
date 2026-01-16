import express from "express";
import {
  sendCode,
  signup,
  login,
  logout,
  getUserBySession,
  getLibrary
} from "../services/auth.service.js";

import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

/* ===== send verification code ===== */
router.post("/send-code", (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    sendCode(email); // 即使 throw，也会被 catch
    return res.status(200).json({ ok: true });

  } catch (e) {
    console.error("send-code error:", e);
    return res.status(500).json({ error: e.message });
  }
});


/* ===== signup ===== */
router.post("/signup", async (req, res) => {
  const { email, password, code } = req.body;
  try {
    await signup(email, password, code);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/* ===== login ===== */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const sid = await login(email, password);

    res.cookie("sid", sid, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 2, // ✅ 2 小时
      path: "/",                 // ✅ 明确路径
    });

    res.json({ ok: true });
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

/* ===== logout ===== */
router.post("/logout", async (req, res) => {
  const sid = req.cookies?.sid;
  if (sid) await logout(sid);

  res.clearCookie("sid", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",          // ✅ 必须一致
  });

  res.json({ ok: true });
});


/* ===== me ===== */
router.get("/me", async (req, res) => {
  const sid = req.cookies?.sid;
  if (!sid) return res.status(401).end();

  const user = await getUserBySession(sid);
  if (!user) return res.status(401).end();

  res.json({ email: user.email });
});

/* ===== library ===== */
router.get("/library", requireAuth, async (req, res) => {
  const data = await getLibrary(req.user.email);
  res.json(data);
});

export default router;

