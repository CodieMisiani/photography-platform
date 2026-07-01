import { randomBytes } from "node:crypto";
import { redis } from "../config/redis.js";
import type { AdminSession } from "../types/domain.js";

const SESSION_TTL_SECONDS = 8 * 60 * 60;
const keyFor = (sessionId: string) => `admin:session:${sessionId}`;

export async function createSession(email: string): Promise<string> {
  const sessionId = randomBytes(32).toString("hex");
  const payload: AdminSession = {
    email,
    createdAt: new Date().toISOString(),
  };

  await redis.set(keyFor(sessionId), JSON.stringify(payload), "EX", SESSION_TTL_SECONDS);
  return sessionId;
}

export async function getSession(sessionId: string): Promise<AdminSession | null> {
  const stored = await redis.get(keyFor(sessionId));
  if (!stored) {
    return null;
  }
  return JSON.parse(stored) as AdminSession;
}

export async function destroySession(sessionId: string): Promise<void> {
  await redis.del(keyFor(sessionId));
}
