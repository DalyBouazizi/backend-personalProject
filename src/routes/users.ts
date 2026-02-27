import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/requireAuth.js";
import { requireRole } from "../auth/requireRole.js";
import { db } from "../db/client.js";
import { userRoles, userProfiles, user } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();
//list users
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  // Parse pagination params from query string (_start and _end are used by Refine simple-rest)
  const start = parseInt(req.query._start as string) || 0;
  const end = parseInt(req.query._end as string) || 10;
  const limit = end - start;

  // Get all users
  const users = await db.select().from(user).limit(limit).offset(start);

  // Get total count for Content-Range header
  const totalResult = await db.select().from(user);
  const total = totalResult.length;

  // Get roles for all users
  const allRoles = await db.select().from(userRoles);
  const rolesMap = new Map(allRoles.map((r) => [r.userId, r.role]));

  // Combine user data with roles
  const usersWithRoles = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
    role: rolesMap.get(u.id) || "user",
  }));

  // Set Content-Range header for Refine pagination
  res.set("Content-Range", `users ${start}-${end}/${total}`);
  res.set("Access-Control-Expose-Headers", "Content-Range");

  res.json(usersWithRoles);
});

//get single user
router.get("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const userId = req.params.id as string;

  const [foundUser] = await db.select().from(user).where(eq(user.id, userId));

  if (!foundUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const [roleData] = await db
    .select()
    .from(userRoles)
    .where(eq(userRoles.userId, userId));

  res.json({
    id: foundUser.id,
    name: foundUser.name,
    email: foundUser.email,
    emailVerified: foundUser.emailVerified,
    createdAt: foundUser.createdAt,
    role: roleData?.role || "user",
  });
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
