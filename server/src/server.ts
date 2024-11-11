import { config } from "./config";
import { handleSourceFiles, handleStaticFile } from "./handlers/static";

export async function createServer() {
  const server = Bun.serve({
    port: config.PORT,
    async fetch(req) {
      const url = new URL(req.url);

      console.log(
        "Requested path:",
        url.pathname,
        "Mode:",
        config.isDev ? "development" : "production"
      );

      // handle src files
      const srcFilesResponse = await handleSourceFiles(url.pathname);
      if (srcFilesResponse) {
        return srcFilesResponse;
      }

      // handle static files
      const staticFilesResponse = await handleStaticFile(url.pathname);
      if (staticFilesResponse) {
        return staticFilesResponse;
      }

      return new Response("Not found", { status: 404 });
    },
  });

  return server;
}
