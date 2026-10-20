import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { designAbout } from "../src/content/design-about";
import { designClients } from "../src/content/design-clients";
import {
  designMedia,
  designMediaPage,
  slotIsOptionalEmpty,
} from "../src/content/design-media";
import { isDesignRouteEnabled } from "../src/content/design-publish";

function parseEnvValue(raw: string): string {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  const comment = trimmed.indexOf(" #");
  return (comment === -1 ? trimmed : trimmed.slice(0, comment)).trim();
}

function readEnvFile(file: string): Array<[string, string]> {
  if (!existsSync(file)) return [];

  const pairs: Array<[string, string]> = [];
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    pairs.push([
      trimmed.slice(0, eq).trim(),
      parseEnvValue(trimmed.slice(eq + 1)),
    ]);
  }
  return pairs;
}

function loadLocalEnv() {
  const root = process.cwd();
  const merged = new Map<string, string>([
    ...readEnvFile(resolve(root, ".env")),
    ...readEnvFile(resolve(root, ".env.local")),
  ]);

  for (const [key, value] of merged) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadLocalEnv();

if (process.env.VERCEL_ENV !== "production") {
  console.log("check-placeholders: omitido (VERCEL_ENV no es production)");
  process.exit(0);
}

const pendingSlots = designMedia.filter(
  (slot) =>
    slot.src === null &&
    !slotIsOptionalEmpty(slot.id) &&
    isDesignRouteEnabled(designMediaPage(slot.id)),
);

console.log(`Slots pendientes: ${pendingSlots.length}`);
for (const slot of pendingSlots) {
  console.log(slot.id);
}

const pendingTexts: string[] = [];

if (
  isDesignRouteEnabled("about") &&
  designAbout.placeholder &&
  designAbout.story
) {
  pendingTexts.push(`about.story: ${designAbout.story.es.join(" ")}`);
}

if (isDesignRouteEnabled("clients")) {
  for (const client of designClients) {
    if (client.placeholder) pendingTexts.push(`clients: ${client.name}`);
  }
}

console.log(`Textos pendientes: ${pendingTexts.length}`);
for (const line of pendingTexts) {
  console.log(line);
}

if (pendingSlots.length > 0 || pendingTexts.length > 0) {
  process.exit(1);
}
