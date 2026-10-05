import { existsSync } from "node:fs";
import { join } from "node:path";

const brandDir = join(process.cwd(), "public/brand");

export const brandAssets = {
  woodaxMark: existsSync(join(brandDir, "woodax-mark.svg")),
  cncMark: existsSync(join(brandDir, "cnc-mark.svg")),
};
