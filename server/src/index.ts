import { config } from "./config";
import { buildReactApp, buildIndexHtml } from "./build";
import { startDevWatcher } from "./dev/watcher";
import { createServer } from "./server";

async function main() {
  if (config.isDev) {
    startDevWatcher();
  } else {
    await buildIndexHtml();
    await buildReactApp();
  }

  const server = await createServer();
  console.log(
    `Into the Breach Clone Server running at http://localhost:${server.port}`
  );
}

main().catch(console.error);
