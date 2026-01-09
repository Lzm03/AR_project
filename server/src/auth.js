const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const USERS_DB_PATH = path.join(__dirname, "..", "users.json");

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_DB_PATH, "utf8"));
  } catch {
    return {};
  }
}
function saveUsers(users) {
  fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
}

let users = loadUsers();
const verifyCodes = {};

// ✅ 发送验证码（控制台显示）
router.post("/send-code", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Missing email" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verifyCodes[email] = {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };

  console.log(`✅ Verification code for ${email}: ${code}`);
  res.json({ success: true });
});

// ✅ 注册
router.post("/signup", (req, res) => {
  const { email, password, code } = req.body;
  if (!email || !password || !code)
    return res.status(400).json({ error: "Missing fields" });

  if (users[email]) return res.status(400).json({ error: "Email already exists" });

  const record = verifyCodes[email];
  if (!record || record.code !== code || Date.now() > record.expiresAt)
    return res.status(400).json({ error: "Invalid code" });

  users[email] = {
    email,
    password,
    library: [],
  };
  saveUsers(users);

  req.session.user = { email };
  delete verifyCodes[email];

  res.json({ email });
});

// ✅ 登录
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users[email];
  if (!user || user.password !== password)
    return res.status(401).json({ error: "Wrong email or password" });

  req.session.user = { email };
  res.json({ email });
});

// ✅ 当前用户
router.get("/me", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: "Not logged in" });

  res.json({ email: req.session.user.email });
});

// ✅ 登出
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// ✅ Library 示例接口（每人独立）
router.get("/library", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Login required" });

  const user = users[req.session.user.email];
  res.json(user.library);
});

module.exports = router;
