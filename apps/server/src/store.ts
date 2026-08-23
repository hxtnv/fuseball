import { generateName } from "@fuseball/auth";
import type { GoogleProfile } from "./google";

// short, shareable id for adding friends later (avoids ambiguous chars)
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const makeFriendCode = (): string =>
  Array.from(
    { length: 6 },
    () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)],
  ).join("");

// The shape the API returns to clients (never leaks internal/private fields).
export interface PublicUser {
  id: string;
  name: string;
  isAnonymous: boolean;
  friendCode: string | null;
  balance: number;
  gamesPlayed: number;
  wins: number;
  goals: number;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  description: string; // Markdown
  image: string | null;
  createdAt: string; // ISO
}

export interface UserStore {
  kind: "postgres" | "memory";
  createAnon(): Promise<PublicUser>;
  get(id: string): Promise<PublicUser | null>;
  rename(id: string, name: string): Promise<PublicUser | null>;
  recordMatch(id: string, won: boolean, goals: number): Promise<void>;
  topPlayers(limit: number): Promise<PublicUser[]>;
  listNews(limit: number): Promise<NewsItem[]>;
  // link a Google identity: migrate the anon account, or return the existing one
  linkGoogle(
    anonUserId: string | null,
    profile: GoogleProfile,
  ): Promise<PublicUser>;
}

// ---------------------------------------------------------------------------
// In-memory store — used for local dev before a DATABASE_URL is configured.
// ---------------------------------------------------------------------------
const createMemoryStore = (): UserStore => {
  const users = new Map<
    string,
    PublicUser & { googleId?: string; email?: string }
  >();
  return {
    kind: "memory",
    async createAnon() {
      const user: PublicUser = {
        id: crypto.randomUUID(),
        name: generateName(),
        isAnonymous: true,
        friendCode: makeFriendCode(),
        balance: 0,
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
    async topPlayers(limit) {
      return [...users.values()]
        .sort((a, b) => b.wins - a.wins || b.goals - a.goals)
        .slice(0, limit);
    },
    async listNews() {
      return []; // no news without a database
    },
    async linkGoogle(anonUserId, { googleId, email, name }) {
      for (const u of users.values())
        if (u.googleId === googleId || (email && u.email === email)) return u;
      const anon = anonUserId ? users.get(anonUserId) : null;
      if (anon && anon.isAnonymous) {
        anon.isAnonymous = false;
        anon.googleId = googleId;
        anon.email = email;
        return anon;
      }
      const user = {
        id: crypto.randomUUID(),
        name: name || generateName(),
        isAnonymous: false,
        friendCode: makeFriendCode(),
        balance: 0,
        gamesPlayed: 0,
        wins: 0,
        goals: 0,
        googleId,
        email,
      };
      users.set(user.id, user);
      return user;
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
    isAnonymous: boolean;
    friendCode: string | null;
    balance: number;
    gamesPlayed: number;
    wins: number;
    goals: number;
  }): PublicUser => ({
    id: u.id,
    name: u.name,
    isAnonymous: u.isAnonymous,
    friendCode: u.friendCode,
    balance: u.balance,
    gamesPlayed: u.gamesPlayed,
    wins: u.wins,
    goals: u.goals,
  });

  // create a user, retrying on the rare friend-code collision
  const createUser = async (data: {
    name: string;
    isAnonymous?: boolean;
    googleId?: string;
    email?: string;
  }) => {
    for (let i = 0; ; i++) {
      try {
        return await prisma.user.create({
          data: { ...data, friendCode: makeFriendCode() },
        });
      } catch (err) {
        if (i >= 4) throw err; // give up after a few tries
      }
    }
  };

  return {
    kind: "postgres",
    async createAnon() {
      return toPublic(
        await createUser({ name: generateName(), isAnonymous: true }),
      );
    },
    async get(id) {
      const u = await prisma.user.findUnique({ where: { id } });
      if (!u) return null;
      // backfill a friend code for accounts created before the column existed
      if (!u.friendCode) {
        const filled = await prisma.user
          .update({ where: { id }, data: { friendCode: makeFriendCode() } })
          .catch(() => u);
        return toPublic(filled);
      }
      return toPublic(u);
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
    async topPlayers(limit) {
      const rows = await prisma.user.findMany({
        orderBy: [{ wins: "desc" }, { goals: "desc" }],
        take: limit,
      });
      return rows.map(toPublic);
    },
    async listNews(limit) {
      const rows = await prisma.news.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map((n) => ({
        id: n.id,
        title: n.title,
        excerpt: n.excerpt,
        description: n.description,
        image: n.image,
        createdAt: n.createdAt.toISOString(),
      }));
    },
    async linkGoogle(anonUserId, { googleId, email, name }) {
      // returning user? (matched by google id, or an account already on that email)
      const existing = await prisma.user.findFirst({
        where: { OR: [{ googleId }, ...(email ? [{ email }] : [])] },
      });
      if (existing) {
        if (existing.googleId) return toPublic(existing);
        return toPublic(
          await prisma.user.update({
            where: { id: existing.id },
            data: { googleId, isAnonymous: false },
          }),
        );
      }
      // migrate the current anonymous account into a full one
      if (anonUserId) {
        const anon = await prisma.user.findUnique({
          where: { id: anonUserId },
        });
        if (anon && anon.isAnonymous) {
          return toPublic(
            await prisma.user.update({
              where: { id: anonUserId },
              data: { googleId, email, isAnonymous: false },
            }),
          );
        }
      }
      // no anon to migrate — create a fresh full account
      return toPublic(
        await createUser({
          name: name || generateName(),
          googleId,
          email,
          isAnonymous: false,
        }),
      );
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
