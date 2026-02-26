import type { Request, Response, NextFunction } from "express";
import { auth } from "./betterAuth.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const session = await auth.api.getSession({ headers: req.headers as any });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  (req as any).user = session.user; // attach for later
  next();
}
