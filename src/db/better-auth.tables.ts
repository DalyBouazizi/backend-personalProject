import { getAuthTables } from "better-auth";
import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Some versions want the builders explicitly:
export const authTables = getAuthTables({
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  uuid,
});
