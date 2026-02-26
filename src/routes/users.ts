import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/requireAuth.js";
import { requireRole } from "../auth/requireRole.js";
import { db } from "../db/client.js";
import { userRoles, userProfiles } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();
//list users
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const roles = await db.select().from(userRoles);
  res.json(roles);
});

//set  role
router.put(
  "/:userId/role",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const schema = z.object({ role: z.enum(["admin", "user"]) });
    const body = schema.parse(req.body);
    const userId = req.params.userId as string;
    await db
      .insert(userRoles)
      .values({ userId, role: body.role })
      .onConflictDoUpdate({
        target: userRoles.userId,
        set: { role: body.role },
      });
    res.json({ ok: true, message: "Role updated" });
  },
);

router.delete(
  "/:userId",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const userId = req.params.userId as string;
    await db.delete(userRoles).where(eq(userRoles.userId, userId));
    await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
    res.json({ ok: true, message: "User deleted" });
  },
);

export default router;
