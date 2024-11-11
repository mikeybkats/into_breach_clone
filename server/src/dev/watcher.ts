import { watch } from "fs/promises";
import { resolve } from "path";
import { config } from "../config";
import { buildReactApp } from "../build";

/**
 * ## startDevWatcher
 *
 * If the environment is development, this function will start a file watcher
 * that will rebuild the react app whenever a file in the `client/src` directory
 * is modified.
 */
export function startDevWatcher() {
  if (!config.isDev) return;

  (async () => {
    console.log("Starting file watcher...");
    const watcher = watch(resolve(config.ROOT_DIR, "client/src"), {
      recursive: true,
    });

    for await (const event of watcher) {
      console.log("File event:", event);
      if (
        event.filename?.endsWith(".tsx") ||
        event.filename?.endsWith(".ts") ||
        event.filename?.endsWith(".css")
      ) {
        console.log("Rebuilding react app...");
        await buildReactApp();
      }
    }
  })();
}
