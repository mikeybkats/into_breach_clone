import { build } from "bun";
import { watch } from "fs/promises";
import { resolve } from "path";

const PORT = process.env.PORT || 3000;
const ROOT_DIR = resolve(__dirname, "../../");

// Function to build React app
async function buildReactApp() {
  await build({
    entrypoints: [`${ROOT_DIR}/client/src/index.tsx`],
    outdir: `${ROOT_DIR}/client/dist`,
  });
  console.log("React build completed");
}

console.log("Writing index.html");
await Bun.write(
  `${ROOT_DIR}/client/dist/index.html`,
  await Bun.file(`${ROOT_DIR}/client/public/index.html`).text()
);

// Build React app
await buildReactApp();

// watch for changes in the React app
if (process.env.NODE_ENV === "development") {
  const watcher = watch(resolve(ROOT_DIR, "client/src"), { recursive: true });

  for await (const event of watcher) {
    if (event.filename?.endsWith(".tsx") || event.filename?.endsWith(".ts")) {
      console.log("Rebuilding react app...");
      await buildReactApp();
    }
  }
}

// Read the index.html template from correct path
const indexHtml = await Bun.file(`${ROOT_DIR}/client/dist/index.html`).text();
// console.log("Serving index.html", JSON.stringify(indexHtml));

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const path = new URL(req.url).pathname;

    // if (path === "/") {
    //   return new Response("Hello from into the breach clone server!");
    // }

    // Serve index.html for all other routes (SPA support)
    // console.log("Serving index.html", JSON.stringify(indexHtml));
    return new Response(indexHtml, {
      headers: { "Content-Type": "text/html" },
    });
  },
});

console.log(
  `Into the Breach Clone Server running at http://localhost:${server.port}`
);
