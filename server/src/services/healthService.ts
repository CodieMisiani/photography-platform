import { db } from "../db/knex.js";
import { redis } from "../config/redis.js";
import { env } from "../config/env.js";

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
    if (env.NODE_ENV === "production") {
      console.error("[health] Postgres check failed", {
        errorType: error instanceof Error ? error.name : "NonErrorThrown",
      });
    } else {
      console.error("[health] Postgres check failed", error);
    }

    return {
      ok: false,
      message:
        env.NODE_ENV === "production"
          ? "Postgres check failed"
          : error instanceof Error
            ? error.message
            : "Postgres check failed",
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
    if (env.NODE_ENV === "production") {
      console.error("[health] Redis check failed", {
        errorType: error instanceof Error ? error.name : "NonErrorThrown",
      });
    } else {
      console.error("[health] Redis check failed", error);
    }

    return {
      ok: false,
      message:
        env.NODE_ENV === "production"
          ? "Redis check failed"
          : error instanceof Error
            ? error.message
            : "Redis check failed",
    };
  }
}
