import { PrismaClient } from "@prisma/client";

// Supabase's connection pooler (PgBouncer) can't handle Prisma's named
// prepared statements and throws 42P05 "prepared statement already exists",
// which crashes the process. Appending pgbouncer=true disables them.
const buildDatabaseUrl = (): string | undefined => {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (!url.includes("pooler.supabase.com")) return url;
  if (url.includes("pgbouncer=true")) return url;
  return url + (url.includes("?") ? "&" : "?") + "pgbouncer=true";
};

const databaseUrl = buildDatabaseUrl();

// Reuse a single client across hot reloads / repeated imports.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    databaseUrl ? { datasources: { db: { url: databaseUrl } } } : undefined,
  );

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
