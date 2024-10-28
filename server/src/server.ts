import { config } from "./config";
import { handleSourceFiles, handleStaticFile } from "./handlers/static";

export async function createServer() {
  const indexHtml = await Bun.file(
    `${config.ROOT_DIR}/client/dist/index.html`
  ).text();

  const server = Bun.serve({
    port: config.PORT,
    async fetch(req) {
      const path = new URL(req.url).pathname;
      console.log(
        "Requested path:",
        path,
        "Mode:",
        config.isDev ? "development" : "production"
      );

      // handle src files
      const srcFilesResponse = await handleSourceFiles(path);
      if (srcFilesResponse) {
        return srcFilesResponse;
      }

      // handle static files
      const staticFilesResponse = await handleStaticFile(path);
      if (staticFilesResponse) {
        return staticFilesResponse;
      }

      return new Response(indexHtml, {
        headers: { "Content-Type": "text/html" },
      });
    },
  });

  return server;
}
