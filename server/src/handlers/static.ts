import { config } from "../config";

export async function handleStaticFile(path: string) {
  try {
    // Serve static files from public
    let resolvedPath = `${config.ROOT_DIR}/client${path}`;
    let publicFile = Bun.file(resolvedPath);

    const extensions = [".tsx", ".ts", ".js"];
    let index = 0;

    while (!(await publicFile.exists()) && index < extensions.length) {
      const extension = extensions[index];
      const newPath = resolvedPath + extension;
      publicFile = Bun.file(newPath);
      index++;

      if (await publicFile.exists()) {
        return handleDevJavaScript(path + extension);
      }

      console.log("Static file not found:", newPath);
    }

    if (await publicFile.exists()) {
      console.log("Found static file:", resolvedPath);
      return new Response(publicFile);
    }
  } catch (error) {
    console.log("Module resolution failed, falling back to direct file check");

    // Fallback to direct file check
    const directFile = Bun.file(`${config.ROOT_DIR}/client${path}`);
    if (await directFile.exists()) {
      return new Response(directFile);
    }
  }

  console.log("Static file not found:", path);
  return null;
}

export async function handleIndexHtml() {
  let indexHtmlPath = "";
  if (config.isDev) {
    indexHtmlPath = `${config.ROOT_DIR}/client/public/index.html`;
  } else {
    indexHtmlPath = `${config.ROOT_DIR}/client/dist/index.html`;
  }

  const indexHtml = Bun.file(indexHtmlPath);

  return new Response(indexHtml, {
    headers: { "Content-Type": "text/html" },
  });
}

export async function handleJavaScriptFiles(path: string) {
  if (config.isDev) {
    return handleDevJavaScript(path);
  } else {
    return handleProdJavaScript(path);
  }
}

export async function handleSourceFiles(path: string) {
  if (path === "/" || path.endsWith("index.html")) {
    return handleIndexHtml();
  }

  if (path.endsWith(".tsx") || path.endsWith(".ts") || path.endsWith(".js")) {
    return handleJavaScriptFiles(path);
  }

  if (path.endsWith(".css")) {
    return handleCSSFiles(path);
  }
}

export async function handleCSSFiles(path: string) {
  console.log("Handling CSS files for path:", path);
  if (path.endsWith(".css")) {
    if (config.isDev) {
      return handleDevCSS(path);
    } else {
      return handleProdCSS(path);
    }
  }
}

export async function handleDevCSS(path: string) {
  // First try src directory
  const srcCssFile = Bun.file(`${config.ROOT_DIR}/client/${path}`);
  if (await srcCssFile.exists()) {
    return new Response(srcCssFile, {
      headers: {
        "Content-Type": "text/css",
        "Cache-Control": "no-cache", // Prevent caching in dev
      },
    });
  }

  console.error(`CSS file not found: ${path}`);
  return new Response("CSS file not found", { status: 404 });
}

export async function handleProdCSS(path: string) {
  const cssFile = Bun.file(`${config.ROOT_DIR}/client/dist${path}`);
  if (await cssFile.exists()) {
    return new Response(cssFile, {
      headers: {
        "Content-Type": "text/css",
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year in production
      },
    });
  }

  console.error(`Production CSS file not found: ${path}`);
  return new Response("CSS file not found", { status: 404 });
}

// In dev mode, serve TypeScript files directly from src
export async function handleDevJavaScript(filePath: string) {
  console.log("Handling dev JavaScript for path:", filePath);
  const srcPath = `${config.ROOT_DIR}/client${filePath}`;

  try {
    console.log("Building TypeScript for path:", srcPath);
    const tsconfig = Bun.file(`${config.ROOT_DIR}/client/tsconfig.json`);
    const tsconfigText = await tsconfig.text();
    const transpiler = new Bun.Transpiler({
      tsconfig: tsconfigText,
      loader: "tsx",
      target: "browser",
    });

    const fileContents = await Bun.file(srcPath).text();
    let resultText = transpiler.transformSync(fileContents);

    // Replace bare imports with paths to node_modules
    resultText = resultText.replace(
      /from ['"](.+)['"](?!\s*\.[^\s'"])/g,
      (match, module) => {
        if (module.startsWith("./") || module.startsWith("../")) {
          // Keep relative imports as-is, but ensure they have .js extension
          return match.replace(/\.tsx?(['"])$/, ".js$1");
        }
        // For node_modules, use local path
        // return `from "/node_modules/${module}/+esm"`;
        return `from "https://esm.sh/${module}"`;
      }
    );

    return new Response(resultText, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
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
