import { db } from "../db/knex.js";
import { redis } from "../config/redis.js";

export async function checkHealth() {
  const postgres = await checkPostgres();
  const redisStatus = await checkRedis();
  const ok = postgres.ok && redisStatus.ok;

  return {
    ok,
    services: {
      postgres,
      redis: redisStatus,
    },
  };
}

async function checkPostgres() {
  try {
    await db.raw("select 1");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Postgres check failed",
    };
  }
}

async function checkRedis() {
  try {
    if (redis.status === "wait" || redis.status === "end") {
      await redis.connect();
    }
    const response = await redis.ping();
    return { ok: response === "PONG" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Redis check failed",
    };
  }
}
