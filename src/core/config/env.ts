import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_GRAPHQL_API_URL: z
    .string()
    .url()
    .default("https://api.escuelajs.co/graphql/v1"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Pagaleve Mini Store"),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_GRAPHQL_API_URL: process.env.NEXT_PUBLIC_GRAPHQL_API_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
  );
}

export const env = parsed.data;
