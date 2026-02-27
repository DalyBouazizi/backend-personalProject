import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth/betterAuth.js";
import { arcjetMiddleware } from "./arcjet/aj.js";
import usersRouter from "./routes/users.js";
import meRouter from "./routes/me.js";
import userProfilesRouter from "./routes/user-Profiles.js";

const app = express();
if (!process.env.FRONTEND_URL) {
  throw new Error("FRONTEND_URL environment variable is not set");
}
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());

app.use(arcjetMiddleware);

app.all("/api/auth/*path", toNodeHandler(auth));

app.use("/api/users", usersRouter);
app.use("/api/me", meRouter);
app.use("/api/user-profiles", userProfilesRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.listen(8000, () => {
  console.log("Server is running on port http://localhost:8000");
});
