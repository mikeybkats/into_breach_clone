import { config } from "../config";

export async function handleStaticFile(path: string) {
  // Serve static files from public
  const publicFile = Bun.file(`${config.ROOT_DIR}/client/public${path}`);
  if (await publicFile.exists()) {
    return new Response(publicFile);
  }

  return null;
}

export async function handleSourceFiles(path: string) {
  if (path.endsWith(".tsx") || path.endsWith(".ts") || path.endsWith(".js")) {
    if (config.isDev) {
      return handleDevJavaScript(path);
    } else {
      return handleProdJavaScript(path);
    }
  }
}

// In dev mode, serve TypeScript files directly from src
export async function handleDevJavaScript(path: string) {
  const srcPath = `${config.ROOT_DIR}/client${path}`;
  console.log("Transpiling and serving from src:", srcPath);

  try {
    // Transpile the TypeScript/TSX file
    const result = await Bun.build({
      entrypoints: [srcPath],
      format: "esm",
      target: "browser",
    });

    // Get the transpiled code from the first output
    const transpiledCode = await result.outputs[0].text();

    return new Response(transpiledCode, {
      headers: {
        "Content-Type": "application/javascript",
        // Add cache control to prevent caching during development
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error transpiling TypeScript:", error);
    return new Response("Error transpiling TypeScript", { status: 500 });
  }
}

export async function handleProdJavaScript(path: string) {
  // get the file name and replace the .tsx with .js
  const jsFile = path
    .split("/")
    .pop()
    ?.replace(/\.tsx?$/, ".js");

  // load the file from the dist with the same name
  const jsDistFile = Bun.file(`${config.ROOT_DIR}/client/dist/${jsFile}`);

  // return the file
  return new Response(jsDistFile, {
    headers: { "Content-Type": "application/javascript" },
  });
}
