import { generateName } from "@fuseball/auth";
import type { GoogleProfile } from "./google";

// short, shareable id for adding friends later (avoids ambiguous chars)
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const makeFriendCode = (): string =>
  Array.from(
    { length: 6 },
    () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)],
  ).join("");

const dayKey = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// The shape the API returns to clients (never leaks internal/private fields).
export interface PublicUser {
  id: string;
  name: string;
  isAnonymous: boolean;
  isAdmin: boolean;
  friendCode: string | null;
  balance: number;
  gamesPlayed: number;
  wins: number;
  goals: number;
}

export interface AdminStats {
  totalUsers: number;
  signedInUsers: number;
  newToday: number;
  new7d: number;
  activeToday: number;
  active7d: number;
  mau: number;
  stickiness: number; // DAU / MAU, 0..1
  weeklyChurn: number; // 0..1
  totalGames: number;
  totalWins: number;
  totalGoals: number;
  totalSessions: number;
  totalPlaytimeSec: number;
  avgSessionSec: number;
  midMatchQuits: number;
  completionRate: number; // completed matches ÷ (completed + mid-match quits)
  quitRate: number; // mid-match quits ÷ (completed + mid-match quits)
}

export interface TimePoint {
  t: number; // epoch ms
  v: number;
}
export interface DayPoint {
  d: string; // YYYY-MM-DD
  v: number;
}
export interface RetentionPoint {
  label: string; // D1 / D7 / D30
  value: number; // 0..1
}
export interface Bucket {
  label: string;
  value: number;
}
export interface Activity {
  hourly: Bucket[]; // 24 buckets, avg players online per hour (UTC)
  weekday: Bucket[]; // 7 buckets, avg players online per weekday
}
export interface AdminCharts {
  ccu: TimePoint[]; // concurrent players, last 24h
  newUsers: DayPoint[]; // last 14 days
  dau: DayPoint[]; // last 14 days
  retention: RetentionPoint[];
  hourly: Bucket[]; // all-time average activity by hour
  weekday: Bucket[]; // all-time average activity by weekday
}

export interface SessionInput {
  userId: string;
  region: string | null;
  durationSec: number;
  quitMidMatch: boolean;
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
  recordSession(session: SessionInput): Promise<void>;
  recordCcu(online: number): Promise<void>;
  charts(tz: string): Promise<AdminCharts>;
  activity(from: Date | null, to: Date | null, tz: string): Promise<Activity>;
  topPlayers(limit: number): Promise<PublicUser[]>;
  listNews(limit: number): Promise<NewsItem[]>;
  stats(): Promise<AdminStats>;
  touch(id: string): Promise<void>; // bump lastSeen for activity metrics
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
    PublicUser & {
      googleId?: string;
      email?: string;
      createdMs: number;
      lastSeenMs: number;
    }
  >();
  const sessions: (SessionInput & { at: number })[] = [];
  const ccu: { t: number; v: number }[] = [];
  // average players-online buckets by hour + weekday (in `tz`) over a range
  const computeActivity = (
    from: Date | null,
    to: Date | null,
    tz: string,
  ): Activity => {
    const lo = from?.getTime() ?? -Infinity;
    const hi = to?.getTime() ?? Infinity;
    let hourFmt: Intl.DateTimeFormat;
    let dowFmt: Intl.DateTimeFormat;
    try {
      const o = { timeZone: tz } as const;
      hourFmt = new Intl.DateTimeFormat("en-US", {
        ...o,
        hour: "2-digit",
        hourCycle: "h23",
      });
      dowFmt = new Intl.DateTimeFormat("en-US", { ...o, weekday: "short" });
    } catch {
      hourFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        hour: "2-digit",
        hourCycle: "h23",
      });
      dowFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        weekday: "short",
      });
    }
    const hb = Array.from({ length: 24 }, () => ({ sum: 0, n: 0 }));
    const db = Array.from({ length: 7 }, () => ({ sum: 0, n: 0 }));
    for (const p of ccu) {
      if (p.t < lo || p.t >= hi) continue;
      const dt = new Date(p.t);
      const h = parseInt(hourFmt.format(dt), 10) % 24;
      const d = DOW.indexOf(dowFmt.format(dt));
      hb[h]!.sum += p.v;
      hb[h]!.n += 1;
      if (d >= 0) {
        db[d]!.sum += p.v;
        db[d]!.n += 1;
      }
    }
    return {
      hourly: hb.map((b, h) => ({
        label: String(h).padStart(2, "0"),
        value: b.n ? Math.round((b.sum / b.n) * 10) / 10 : 0,
      })),
      weekday: db.map((b, d) => ({
        label: DOW[d]!,
        value: b.n ? Math.round((b.sum / b.n) * 10) / 10 : 0,
      })),
    };
  };
  return {
    kind: "memory",
    async createAnon() {
      const now = Date.now();
      const user = {
        id: crypto.randomUUID(),
        name: generateName(),
        isAnonymous: true,
        isAdmin: false,
        friendCode: makeFriendCode(),
        balance: 0,
        gamesPlayed: 0,
        wins: 0,
        goals: 0,
        createdMs: now,
        lastSeenMs: now,
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
      u.lastSeenMs = Date.now();
    },
    async recordSession(session) {
      sessions.push({ ...session, at: Date.now() });
      const u = users.get(session.userId);
      if (u) u.lastSeenMs = Date.now();
    },
    async recordCcu(online) {
      ccu.push({ t: Date.now(), v: online });
      if (ccu.length > 2000) ccu.shift();
    },
    async charts(tz) {
      const now = Date.now();
      const day = 86_400_000;
      const newUsers = new Map<string, number>();
      for (const u of users.values())
        if (u.createdMs >= now - 14 * day) {
          const k = dayKey(u.createdMs);
          newUsers.set(k, (newUsers.get(k) ?? 0) + 1);
        }
      const dau = new Map<string, Set<string>>();
      for (const s of sessions)
        if (s.at >= now - 14 * day) {
          const k = dayKey(s.at);
          if (!dau.has(k)) dau.set(k, new Set());
          dau.get(k)!.add(s.userId);
        }
      return {
        ccu: ccu.filter((p) => p.t >= now - day),
        newUsers: [...newUsers.entries()].sort().map(([d, v]) => ({ d, v })),
        dau: [...dau.entries()].sort().map(([d, s]) => ({ d, v: s.size })),
        retention: [
          { label: "D1", value: 0 },
          { label: "D7", value: 0 },
          { label: "D30", value: 0 },
        ],
        ...computeActivity(null, null, tz),
      };
    },
    async activity(from, to, tz) {
      return computeActivity(from, to, tz);
    },
    async topPlayers(limit) {
      return [...users.values()]
        .sort((a, b) => b.wins - a.wins || b.goals - a.goals)
        .slice(0, limit);
    },
    async listNews() {
      return []; // no news without a database
    },
    async stats() {
      const now = Date.now();
      const day = 86_400_000;
      const arr = [...users.values()];
      const totalGames = arr.reduce((n, u) => n + u.gamesPlayed, 0);
      const totalPlaytimeSec = sessions.reduce((n, s) => n + s.durationSec, 0);
      const midMatchQuits = sessions.filter((s) => s.quitMidMatch).length;
      const denom = totalGames + midMatchQuits;
      const activeToday = arr.filter((u) => u.lastSeenMs >= now - day).length;
      const mau = arr.filter((u) => u.lastSeenMs >= now - 30 * day).length;
      const prior = new Set(
        sessions
          .filter((s) => s.at >= now - 14 * day && s.at < now - 7 * day)
          .map((s) => s.userId),
      );
      const retained = new Set(
        sessions
          .filter((s) => s.at >= now - 7 * day && prior.has(s.userId))
          .map((s) => s.userId),
      );
      return {
        totalUsers: arr.length,
        signedInUsers: arr.filter((u) => !u.isAnonymous).length,
        newToday: arr.filter((u) => u.createdMs >= now - day).length,
        new7d: arr.filter((u) => u.createdMs >= now - 7 * day).length,
        activeToday,
        active7d: arr.filter((u) => u.lastSeenMs >= now - 7 * day).length,
        mau,
        stickiness: mau ? activeToday / mau : 0,
        weeklyChurn: prior.size ? 1 - retained.size / prior.size : 0,
        totalGames,
        totalWins: arr.reduce((n, u) => n + u.wins, 0),
        totalGoals: arr.reduce((n, u) => n + u.goals, 0),
        totalSessions: sessions.length,
        totalPlaytimeSec,
        avgSessionSec: sessions.length
          ? Math.round(totalPlaytimeSec / sessions.length)
          : 0,
        midMatchQuits,
        completionRate: denom ? totalGames / denom : 0,
        quitRate: denom ? midMatchQuits / denom : 0,
      };
    },
    async touch(id) {
      const u = users.get(id);
      if (u) u.lastSeenMs = Date.now();
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
      const now = Date.now();
      const user = {
        id: crypto.randomUUID(),
        name: name || generateName(),
        isAnonymous: false,
        isAdmin: false,
        friendCode: makeFriendCode(),
        balance: 0,
        gamesPlayed: 0,
        wins: 0,
        goals: 0,
        googleId,
        email,
        createdMs: now,
        lastSeenMs: now,
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
    isAdmin: boolean;
    friendCode: string | null;
    balance: number;
    gamesPlayed: number;
    wins: number;
    goals: number;
  }): PublicUser => ({
    id: u.id,
    name: u.name,
    isAnonymous: u.isAnonymous,
    isAdmin: u.isAdmin,
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

  // fraction of a recent signup cohort that returned exactly N days later
  const retentionFor = async (n: number): Promise<number> => {
    const d = Math.floor(n);
    const rows = await prisma.$queryRawUnsafe<
      { cohort: number; retained: number }[]
    >(
      `WITH cohort AS (
         SELECT id, date_trunc('day', "createdAt") AS day
         FROM "User"
         WHERE "createdAt" < now() - interval '${d} days'
           AND "createdAt" >= now() - interval '${d + 14} days'
       )
       SELECT
         (SELECT count(*)::int FROM cohort) AS cohort,
         (SELECT count(DISTINCT s."userId")::int
            FROM "Session" s JOIN cohort c ON c.id = s."userId"
            WHERE date_trunc('day', s."startedAt") = c.day + interval '1 day' * ${d}) AS retained`,
    );
    const r = rows[0];
    return r && r.cohort > 0 ? r.retained / r.cohort : 0;
  };

  // average players-online buckets by hour + weekday (in `tz`) over a range
  const computeActivity = async (
    from: Date | null,
    to: Date | null,
    tz: string,
  ): Promise<Activity> => {
    const hours = await prisma.$queryRaw<{ h: number; v: number }[]>`
      SELECT extract(hour from at AT TIME ZONE ${tz})::int AS h, avg(online)::float AS v
      FROM "CcuSample"
      WHERE (${from}::timestamptz IS NULL OR at >= ${from}::timestamptz)
        AND (${to}::timestamptz IS NULL OR at < ${to}::timestamptz)
      GROUP BY h`;
    const dows = await prisma.$queryRaw<{ d: number; v: number }[]>`
      SELECT extract(dow from at AT TIME ZONE ${tz})::int AS d, avg(online)::float AS v
      FROM "CcuSample"
      WHERE (${from}::timestamptz IS NULL OR at >= ${from}::timestamptz)
        AND (${to}::timestamptz IS NULL OR at < ${to}::timestamptz)
      GROUP BY d`;
    const hMap = new Map(hours.map((x) => [Number(x.h), Number(x.v)]));
    const dMap = new Map(dows.map((x) => [Number(x.d), Number(x.v)]));
    return {
      hourly: Array.from({ length: 24 }, (_, h) => ({
        label: String(h).padStart(2, "0"),
        value: Math.round((hMap.get(h) ?? 0) * 10) / 10,
      })),
      weekday: Array.from({ length: 7 }, (_, d) => ({
        label: DOW[d]!,
        value: Math.round((dMap.get(d) ?? 0) * 10) / 10,
      })),
    };
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
            lastSeenAt: new Date(),
          },
        })
        .catch(() => undefined);
    },
    async recordSession({ userId, region, durationSec, quitMidMatch }) {
      await prisma.session
        .create({ data: { userId, region, durationSec, quitMidMatch } })
        .catch(() => undefined);
      await prisma.user
        .update({ where: { id: userId }, data: { lastSeenAt: new Date() } })
        .catch(() => undefined);
    },
    async recordCcu(online) {
      await prisma.ccuSample
        .create({ data: { online } })
        .catch(() => undefined);
    },
    async charts(tz) {
      const dayMs = 86_400_000;
      const since14 = new Date(Date.now() - 14 * dayMs);
      const since24h = new Date(Date.now() - dayMs);
      const [ccuRows, newUsersRows, dauRows, d1, d7, d30, act] =
        await Promise.all([
          prisma.ccuSample.findMany({
            where: { at: { gte: since24h } },
            orderBy: { at: "asc" },
            select: { at: true, online: true },
          }),
          prisma.$queryRaw<{ d: Date; v: number }[]>`
          SELECT date_trunc('day', "createdAt") AS d, count(*)::int AS v
          FROM "User" WHERE "createdAt" >= ${since14}
          GROUP BY d ORDER BY d`,
          prisma.$queryRaw<{ d: Date; v: number }[]>`
          SELECT date_trunc('day', "startedAt") AS d, count(DISTINCT "userId")::int AS v
          FROM "Session" WHERE "startedAt" >= ${since14}
          GROUP BY d ORDER BY d`,
          retentionFor(1),
          retentionFor(7),
          retentionFor(30),
          computeActivity(null, null, tz),
        ]);
      const toDay = (rows: { d: Date; v: number }[]) =>
        rows.map((r) => ({
          d: r.d.toISOString().slice(0, 10),
          v: Number(r.v),
        }));
      return {
        ccu: ccuRows.map((s) => ({ t: s.at.getTime(), v: s.online })),
        newUsers: toDay(newUsersRows),
        dau: toDay(dauRows),
        retention: [
          { label: "D1", value: d1 },
          { label: "D7", value: d7 },
          { label: "D30", value: d30 },
        ],
        hourly: act.hourly,
        weekday: act.weekday,
      };
    },
    async activity(from, to, tz) {
      return computeActivity(from, to, tz);
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
    async stats() {
      const day = 86_400_000;
      const today = new Date(Date.now() - day);
      const week = new Date(Date.now() - 7 * day);
      const month = new Date(Date.now() - 30 * day);
      const [
        totalUsers,
        signedInUsers,
        newToday,
        new7d,
        activeToday,
        active7d,
        mau,
        agg,
        sessionAgg,
        midMatchQuits,
        churnRows,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isAnonymous: false } }),
        prisma.user.count({ where: { createdAt: { gte: today } } }),
        prisma.user.count({ where: { createdAt: { gte: week } } }),
        prisma.user.count({ where: { lastSeenAt: { gte: today } } }),
        prisma.user.count({ where: { lastSeenAt: { gte: week } } }),
        prisma.user.count({ where: { lastSeenAt: { gte: month } } }),
        prisma.user.aggregate({
          _sum: { gamesPlayed: true, wins: true, goals: true },
        }),
        prisma.session.aggregate({
          _count: true,
          _sum: { durationSec: true },
          _avg: { durationSec: true },
        }),
        prisma.session.count({ where: { quitMidMatch: true } }),
        prisma.$queryRaw<{ prior: number; ret: number }[]>`
          WITH prior AS (
            SELECT DISTINCT "userId" FROM "Session"
            WHERE "startedAt" >= now() - interval '14 days'
              AND "startedAt" < now() - interval '7 days'
          ), ret AS (
            SELECT DISTINCT s."userId" FROM "Session" s
            JOIN prior p ON p."userId" = s."userId"
            WHERE s."startedAt" >= now() - interval '7 days'
          )
          SELECT (SELECT count(*)::int FROM prior) AS prior,
                 (SELECT count(*)::int FROM ret) AS ret`,
      ]);
      const totalGames = agg._sum.gamesPlayed ?? 0;
      const denom = totalGames + midMatchQuits;
      const churn = churnRows[0];
      return {
        totalUsers,
        signedInUsers,
        newToday,
        new7d,
        activeToday,
        active7d,
        mau,
        stickiness: mau ? activeToday / mau : 0,
        weeklyChurn: churn && churn.prior > 0 ? 1 - churn.ret / churn.prior : 0,
        totalGames,
        totalWins: agg._sum.wins ?? 0,
        totalGoals: agg._sum.goals ?? 0,
        totalSessions: sessionAgg._count,
        totalPlaytimeSec: sessionAgg._sum.durationSec ?? 0,
        avgSessionSec: Math.round(sessionAgg._avg.durationSec ?? 0),
        midMatchQuits,
        completionRate: denom ? totalGames / denom : 0,
        quitRate: denom ? midMatchQuits / denom : 0,
      };
    },
    async touch(id) {
      await prisma.user
        .update({ where: { id }, data: { lastSeenAt: new Date() } })
        .catch(() => undefined);
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
