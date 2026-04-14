import { z } from "zod";

const serverEnvSchema = z.object({
  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().min(1),
  YOXO_API_BASE_URL: z.string().url(),
  YOXO_CLIENT_ID: z.string().min(1),
  YOXO_CLIENT_SECRET: z.string().min(1),
  CRON_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_DEFAULT_SERVER: z.string().min(1).optional().default("mocha"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Configuration serveur invalide: ${details}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
