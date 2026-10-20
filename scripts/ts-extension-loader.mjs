import { resolve as pathResolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = pathResolve(fileURLToPath(new URL(".", import.meta.url)), "..");

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const file = pathResolve(root, "src", `${specifier.slice(2)}.ts`);
    return nextResolve(pathToFileURL(file).href, context);
  }

  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    !/\.[a-z]+$/i.test(specifier)
  ) {
    return nextResolve(`${specifier}.ts`, context);
  }

  return nextResolve(specifier, context);
}
