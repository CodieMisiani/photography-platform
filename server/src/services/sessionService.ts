import { randomBytes } from "node:crypto";
import { redis } from "../config/redis.js";
import type { AdminSession } from "../types/domain.js";

const SESSION_TTL_SECONDS = 8 * 60 * 60;
const keyFor = (sessionId: string) => `admin:session:${sessionId}`;

export async function createSession(email: string): Promise<{
  sessionId: string;
  csrfToken: string;
}> {
  const sessionId = randomBytes(32).toString("hex");
  const payload: AdminSession = {
    email,
    createdAt: new Date().toISOString(),
    csrfToken: randomBytes(32).toString("hex"),
  };

  const payloadString = JSON.stringify(payload);
  await redis.set(keyFor(sessionId), payloadString, "EX", SESSION_TTL_SECONDS);
  return { sessionId, csrfToken: payload.csrfToken };
}

export async function getSession(
  sessionId: string,
): Promise<AdminSession | null> {
  const stored = await redis.get(keyFor(sessionId));
  if (!stored) {
    return null;
  }
  const session = JSON.parse(stored) as Partial<AdminSession> &
    Pick<AdminSession, "email" | "createdAt">;
  if (typeof session.csrfToken === "string" && session.csrfToken.length > 0) {
    return session as AdminSession;
  }

  // Upgrade sessions created before CSRF tokens were introduced.
  const csrfToken = randomBytes(32).toString("hex");
  const upgradedSession: AdminSession = { ...session, csrfToken };
  await redis.set(
    keyFor(sessionId),
    JSON.stringify(upgradedSession),
    "EX",
    SESSION_TTL_SECONDS,
  );
  return upgradedSession;
}

export async function destroySession(sessionId: string): Promise<void> {
  await redis.del(keyFor(sessionId));
}
