import type en from "../messages/en.json";
import type es from "../messages/es.json";

/**
 * Both catalogs must have the same keys. A missing key in either file
 * makes this assignment fail `pnpm typecheck`.
 */
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

export type Messages = typeof es;

export const messagesAreInSync = true satisfies Equal<typeof es, typeof en>;
