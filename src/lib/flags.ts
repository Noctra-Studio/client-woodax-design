import { clientEnv } from "./env";

export function isDesignFull(): boolean {
  return clientEnv.NEXT_PUBLIC_DESIGN_MODE === "full";
}

export function isIndexingAllowed(): boolean {
  return (
    clientEnv.NEXT_PUBLIC_APP_ENV === "production" &&
    clientEnv.NEXT_PUBLIC_ALLOW_INDEXING === "true"
  );
}
