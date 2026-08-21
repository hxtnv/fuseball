import { generateName } from "@fuseball/auth";

// The shape the API returns to clients (never leaks internal/private fields).
export interface PublicUser {
  id: string;
  name: string;
  gamesPlayed: number;
  wins: number;
  goals: number;
}

export interface UserStore {
  kind: "postgres" | "memory";
  createAnon(): Promise<PublicUser>;
  get(id: string): Promise<PublicUser | null>;
  rename(id: string, name: string): Promise<PublicUser | null>;
  recordMatch(id: string, won: boolean, goals: number): Promise<void>;
}

// ---------------------------------------------------------------------------
// In-memory store — used for local dev before a DATABASE_URL is configured.
// ---------------------------------------------------------------------------
const createMemoryStore = (): UserStore => {
  const users = new Map<string, PublicUser>();
  return {
    kind: "memory",
    async createAnon() {
      const user: PublicUser = {
        id: crypto.randomUUID(),
        name: generateName(),
        gamesPlayed: 0,
        wins: 0,
        goals: 0,
      };
      users.set(user.id, user);
      return user;
    },
    async get(id) {
      return users.get(id) ?? null;
    },
    async rename(id, name) {
      const u = users.get(id);
      if (!u) return null;
      u.name = name;
      return u;
    },
    async recordMatch(id, won, goals) {
      const u = users.get(id);
      if (!u) return;
      u.gamesPlayed += 1;
      if (won) u.wins += 1;
      u.goals += goals;
    },
  };
};

// ---------------------------------------------------------------------------
// Postgres (Prisma) store — used when DATABASE_URL is set and the client is
// generated. Imported dynamically so a missing generated client can't crash boot.
// ---------------------------------------------------------------------------
const createPrismaStore = async (): Promise<UserStore> => {
  const { getPrisma } = await import("@fuseball/db");
  const prisma = getPrisma();
  await prisma.$queryRaw`SELECT 1`; // verify connectivity before committing to it

  const toPublic = (u: {
    id: string;
    name: string;
    gamesPlayed: number;
    wins: number;
    goals: number;
  }): PublicUser => ({
    id: u.id,
    name: u.name,
    gamesPlayed: u.gamesPlayed,
    wins: u.wins,
    goals: u.goals,
  });

  return {
    kind: "postgres",
    async createAnon() {
      return toPublic(
        await prisma.user.create({
          data: { name: generateName(), isAnonymous: true },
        }),
      );
    },
    async get(id) {
      const u = await prisma.user.findUnique({ where: { id } });
      return u ? toPublic(u) : null;
    },
    async rename(id, name) {
      try {
        return toPublic(
          await prisma.user.update({ where: { id }, data: { name } }),
        );
      } catch {
        return null;
      }
    },
    async recordMatch(id, won, goals) {
      await prisma.user
        .update({
          where: { id },
          data: {
            gamesPlayed: { increment: 1 },
            wins: { increment: won ? 1 : 0 },
            goals: { increment: goals },
          },
        })
        .catch(() => undefined);
    },
  };
};

export const initStore = async (): Promise<UserStore> => {
  if (process.env.DATABASE_URL) {
    try {
      return await createPrismaStore();
    } catch (err) {
      console.error(
        "[server] Postgres unavailable, using in-memory store instead:",
        err instanceof Error ? err.message : err,
      );
    }
  } else {
    console.warn(
      "[server] DATABASE_URL not set — using in-memory store (accounts reset on restart).",
    );
  }
  return createMemoryStore();
};
