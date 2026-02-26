import type { Request, Response, NextFunction } from "express";
import { db } from "../db/client.js";
import { userRoles } from "../db/schema.js";
import { eq } from "drizzle-orm";

export function requireRole(role: "admin" | "user") {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const rows = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));
    const r = rows[0]?.role;
    if (r !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
