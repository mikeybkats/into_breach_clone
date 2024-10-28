import { build } from "bun";
import { config } from "../config";

/**
 * ## buildReactApp
 *
 * Builds the react app.
 */
export async function buildReactApp() {
  await build({
    entrypoints: [`${config.ROOT_DIR}/client/src/index.tsx`],
    outdir: `${config.ROOT_DIR}/client/dist`,
  });
  console.log("React build completed");
}

/**
 * ## buildIndexHtml
 *
 * Builds the index.html file for production.
 */
export async function buildIndexHtml() {
  await Bun.write(
    `${config.ROOT_DIR}/client/dist/index.html`,
    await Bun.file(`${config.ROOT_DIR}/client/public/index.html`).text()
  );
  console.log("Writing index.html");
}
