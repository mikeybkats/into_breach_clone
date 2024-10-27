import { build } from "bun";
import { watch } from "fs/promises";
import { resolve } from "path";

const PORT = process.env.PORT || 3000;
const ROOT_DIR = resolve(__dirname, "../../");

const isDev = process.env.NODE_ENV === "development";

// Function to build production React app
async function buildReactApp() {
  await build({
    entrypoints: [`${ROOT_DIR}/client/src/index.tsx`],
    outdir: `${ROOT_DIR}/client/dist`,
  });
  console.log("React build completed");
}

async function buildIndexHtml() {
  await Bun.write(
    `${ROOT_DIR}/client/dist/index.html`,
    await Bun.file(`${ROOT_DIR}/client/public/index.html`).text()
  );
  console.log("Writing index.html");
}

if (!isDev) {
  // Build React app
  await buildReactApp();
  await buildIndexHtml();
}

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

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const path = new URL(req.url).pathname;

    console.log(
      "Requested path:",
      path,
      "Mode:",
      isDev ? "development" : "production"
    );

    if (path.endsWith(".tsx") || path.endsWith(".ts")) {
      if (isDev) {
        console.log("In dev mode, serving TypeScript from src");
        // In dev mode, serve TypeScript files directly from src
        const srcPath = `${ROOT_DIR}/client/src${path}`;
        console.log("Serving TypeScript from:", srcPath);
        const file = Bun.file(srcPath);
        return new Response(file, {
          headers: { "Content-Type": "application/javascript" },
        });
      } else {
        console.log("In production mode, serving JavaScript from dist");
        // replace the .tsx with .js
        const jsPath = path
          .split("/")
          .pop()
          ?.replace(/\.tsx?$/, ".js");
        console.log("modified path:", jsPath);

        // load the file from the dist with the same name
        const jsDistFile = Bun.file(`${ROOT_DIR}/client/dist/${jsPath}`);

        // return the file
        return new Response(jsDistFile, {
          headers: { "Content-Type": "application/javascript" },
        });
      }
    }

    // Handle regular JS files
    if (path.endsWith(".js")) {
      const filePath = isDev
        ? `${ROOT_DIR}/client/src${path}`
        : `${ROOT_DIR}/client/dist${path}`;
      console.log("Serving JavaScript from:", filePath);

      const file = Bun.file(filePath);
      return new Response(file, {
        headers: { "Content-Type": "application/javascript" },
      });
    }

    // Serve index.html for all other routes (SPA support)

    return new Response(indexHtml, {
      headers: { "Content-Type": "text/html" },
    });
  },
});

console.log(
  `Into the Breach Clone Server running at http://localhost:${server.port}`
);
