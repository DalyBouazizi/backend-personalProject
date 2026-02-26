import { Router } from "express";
import { requireAuth } from "../auth/requireAuth.js";
import { db } from "../db/client.js";
import { userProfiles, userItems, userRoles } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const profile = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id));
  const items = await db
    .select()
    .from(userItems)
    .where(eq(userItems.userId, user.id));
  const roleRow = await db
    .select()
    .from(userRoles)
    .where(eq(userRoles.userId, user.id));
  const role = roleRow[0]?.role ?? "user";

  res.json({ user, role, profile: profile[0] ?? null, items });
});

router.put("/profile", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const schema = z.object({ fullName: z.string().min(0).max(100) });
  const body = schema.parse(req.body);

  await db
    .insert(userProfiles)
    .values({ userId: user.id, fullName: body.fullName })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: { fullName: body.fullName },
    });

  res.json({ ok: true });
});

export default router;
