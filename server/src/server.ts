import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { assertRequiredTablesExist } from "./services/schemaGuardService.js";

async function startServer() {
  await assertRequiredTablesExist();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`Photography Platform API listening on port ${env.PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("[server] Startup failed", {
    error,
  });
  process.exit(1);
});
