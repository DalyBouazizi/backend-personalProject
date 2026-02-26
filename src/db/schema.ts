import { role } from "better-auth/plugins";
import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { id } from "zod/locales";

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id").primaryKey(),
  fullName: text("full_name").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userItems = pgTable("user_items", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  userId: uuid("user_id").primaryKey(),
  role: text("role").notNull(),
});
