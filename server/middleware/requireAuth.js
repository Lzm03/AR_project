import { getUserBySession } from "../services/auth.service.js";

export async function requireAuth(req, res, next) {
  const sid = req.cookies?.sid;
  if (!sid) return res.status(401).end();

  const user = await getUserBySession(sid);
  if (!user) return res.status(401).end();

  req.user = user;
  next();
}
