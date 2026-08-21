import { PrismaClient } from "@prisma/client";

// Lazily construct a single PrismaClient. Constructed on first use so importing
// this package never throws when the client hasn't been generated yet — the
// central server's store layer catches that and falls back to an in-memory store.
let client: PrismaClient | null = null;

export const getPrisma = (): PrismaClient => {
  if (!client) client = new PrismaClient();
  return client;
};

export type { User } from "@prisma/client";
