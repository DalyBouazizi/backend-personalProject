import "dotenv/config";
import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import type { Request, Response, NextFunction } from "express";

if (!process.env.ARCJET_KEY) throw new Error("Missing ARCJET_KEY");

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }), // start with DRY_RUN if you’re scared of blocking
    detectBot({ mode: "DRY_RUN", allow: ["CATEGORY:SEARCH_ENGINE"] }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export async function arcjetMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const decision = await aj.protect(req, { requested: 1 });

  if (decision.isDenied()) {
    return res.status(429).json({ error: "Too many requests" });
  }
  next();
}
