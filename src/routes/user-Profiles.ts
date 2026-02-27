import { Router } from "express";
import { requireAuth } from "../auth/requireAuth.js";
import { requireRole } from "../auth/requireRole.js";
import { db } from "../db/client.js";
import { userProfiles } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  // Parse pagination params from query string (_start and _end are used by Refine simple-rest)
  const start = parseInt(req.query._start as string) || 0;
  const end = parseInt(req.query._end as string) || 10;
  const limit = end - start;

  const profiles = await db
    .select()
    .from(userProfiles)
    .limit(limit)
    .offset(start);
  //get total count for Content-Range header
  const totalResult = await db.select().from(userProfiles);
  const total = totalResult.length;
  // Set Content-Range header for Refine pagination
  res.set("Content-Range", `userProfiles ${start}-${end}/${total}`);
  res.set("Access-Control-Expose-Headers", "Content-Range");
  res.json(profiles);
});
//get single profile
router.get("/:id", requireAuth, async (req, res) => {
  const userId = req.params.id as string;
  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }
  res.json(profile);
});

//set profile
router.post("/:id", requireAuth, async (req, res) => {
  const userId = req.params.id as string;
  const { fullName, age, bio, adress } = req.body;

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));

  if (profile) {
    await db
      .update(userProfiles)
      .set({ userId, fullName, age, bio, adress })
      .where(eq(userProfiles.userId, userId));
  } else {
    await db
      .insert(userProfiles)
      .values({ userId, fullName, age, bio, adress });
  }

  res.json({ ok: true, message: "Profile updated" });
});

export default router;
