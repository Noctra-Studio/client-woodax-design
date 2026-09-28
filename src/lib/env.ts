import { prettifyError, z, type ZodType } from "zod";

/**
 * Validated environment variables.
 *
 * `clientEnv` only exposes `NEXT_PUBLIC_*` values and is safe to import anywhere.
 * `serverEnv` is read on the server during module initialization. Accessing it in
 * the browser throws, so secrets never have to be bundled for client code.
 * Missing or blank required variables throw and fail `next build`.
 */

type PublicEnvKey = `NEXT_PUBLIC_${string}`;

type ServerEnvShape<T extends Record<string, ZodType>> = {
  [K in keyof T]: K extends PublicEnvKey ? never : T[K];
};

function emptyAsUndefined(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function required(invalid: string) {
  return (issue: { input?: unknown }) =>
    issue.input === undefined ? "Required" : invalid;
}

function defineClientSchema<T extends Record<PublicEnvKey, ZodType>>(shape: T) {
  for (const key of Object.keys(shape)) {
    if (!key.startsWith("NEXT_PUBLIC_")) {
      throw new Error(
        `Client environment variable "${key}" must be prefixed with NEXT_PUBLIC_.`,
      );
    }
  }

  return z.object(shape);
}

function defineServerSchema<T extends Record<string, ZodType>>(
  shape: T & ServerEnvShape<T>,
) {
  for (const key of Object.keys(shape)) {
    if (key.startsWith("NEXT_PUBLIC_")) {
      throw new Error(
        `Server environment variable "${key}" must not be prefixed with NEXT_PUBLIC_.`,
      );
    }
  }

  return z.object(shape);
}

const contactFromEmail = z.preprocess(
  emptyAsUndefined,
  z.string({ error: "Required" }).refine((value) => {
    const named = /^(.*) <([^<>]+)>$/.exec(value);
    if (named) {
      const displayName = named[1]?.trim() ?? "";
      const address = named[2] ?? "";
      return displayName.length > 0 && z.email().safeParse(address).success;
    }

    return z.email().safeParse(value).success;
  }, 'Expected an email address or "Name <email@domain>"'),
);

const clientSchema = defineClientSchema({
  NEXT_PUBLIC_APP_ENV: z.preprocess(
    emptyAsUndefined,
    z.enum(["development", "staging", "production"], {
      error: required("Expected development, staging, or production"),
    }),
  ),
  NEXT_PUBLIC_DESIGN_URL: z.preprocess(
    emptyAsUndefined,
    z.url({ error: required("Must be a valid URL") }),
  ),
  NEXT_PUBLIC_CNC_URL: z.preprocess(
    emptyAsUndefined,
    z.url({ error: required("Must be a valid URL") }),
  ),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.preprocess(
    emptyAsUndefined,
    z
      .string({ error: "Required" })
      .regex(
        /^\d{8,15}$/,
        "International format without + or spaces, for example 5214421234567",
      ),
  ),
});

const serverSchema = defineServerSchema({
  RESEND_API_KEY: z.preprocess(
    emptyAsUndefined,
    z.string({ error: "Required" }).min(1, "Required"),
  ),
  CONTACT_TO_EMAIL: z.preprocess(
    emptyAsUndefined,
    z.email({ error: required("Must be a valid email address") }),
  ),
  CONTACT_FROM_EMAIL: contactFromEmail,
});

type ClientEnv = z.infer<typeof clientSchema>;
type ServerEnv = z.infer<typeof serverSchema>;

function readClientInput(): { [K in keyof ClientEnv]: string | undefined } {
  return {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_DESIGN_URL: process.env.NEXT_PUBLIC_DESIGN_URL,
    NEXT_PUBLIC_CNC_URL: process.env.NEXT_PUBLIC_CNC_URL,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  };
}

function readServerInput(): { [K in keyof ServerEnv]: string | undefined } {
  return {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
  };
}

function formatFailure(error: z.ZodError): string {
  return prettifyError(error);
}

function inaccessibleServerEnv(): ServerEnv {
  return new Proxy({} as ServerEnv, {
    get() {
      throw new Error(
        "Server environment variables cannot be read from the client.",
      );
    },
  });
}

function loadEnv(): { clientEnv: ClientEnv; serverEnv: ServerEnv } {
  const clientParsed = clientSchema.safeParse(readClientInput());
  const serverParsed =
    typeof window === "undefined"
      ? serverSchema.safeParse(readServerInput())
      : null;

  if (!clientParsed.success || (serverParsed && !serverParsed.success)) {
    const details = [
      clientParsed.success ? null : formatFailure(clientParsed.error),
      serverParsed && !serverParsed.success
        ? formatFailure(serverParsed.error)
        : null,
    ]
      .filter((detail) => detail !== null)
      .join("\n");

    throw new Error(
      `Invalid environment variables. Set every required variable before building.\n${details}`,
    );
  }

  return {
    clientEnv: clientParsed.data,
    serverEnv: serverParsed ? serverParsed.data : inaccessibleServerEnv(),
  };
}

const env = loadEnv();

export const clientEnv = env.clientEnv;
export const serverEnv = env.serverEnv;
