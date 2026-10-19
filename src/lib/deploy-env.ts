/** Vercel production only. Preview, staging and local builds are not production. */
export function isProductionDeploy(): boolean {
  return process.env.VERCEL_ENV === "production";
}
