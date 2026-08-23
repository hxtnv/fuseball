import { GAME_VERSION } from "@fuseball/shared";
import {
  bearer,
  generateName,
  sanitizeName,
  signToken,
  verifyToken,
} from "@fuseball/auth";
import { initStore, type NewsItem, type UserStore } from "./store";
import { findServer, gameServers } from "./servers";
import { exchangeGoogleCode, googleAuthUrl, googleConfigured } from "./google";
import type { ServerWebSocket } from "bun";

const port = Number(process.env.PORT ?? 3001);
const INTERNAL_SECRET =
  process.env.INTERNAL_SECRET ?? "dev-internal-secret-change-me";

let store: UserStore;

// news is hand-authored and changes rarely — cache it so menu loads don't hit the DB
const NEWS_TTL = 60_000;
let newsCache: { at: number; limit: number; data: NewsItem[] } | null = null;

// live presence: every open client (menu OR game) holds a /presence socket. The
// count is deduped by userId, so multiple tabs from one account count once.
interface PresenceData {
  userId: string | null;
}
const presence = new Map<ServerWebSocket<PresenceData>, string | null>();
const onlineCount = (): number => {
  const ids = new Set<string>();
  let anon = 0;
  for (const uid of presence.values())
    if (uid) ids.add(uid);
    else anon++;
  return ids.size + anon;
};
const broadcastOnline = (): void => {
  const msg = JSON.stringify({ type: "online", count: onlineCount() });
  for (const ws of presence.keys()) ws.send(msg);
};

const CORS = {
  "Access-Control-Allow-Origin": process.env.CLIENT_ORIGIN ?? "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
} as const;

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

// Resolve the authenticated user from the Authorization header, or null.
const authUser = async (req: Request) => {
  const token = bearer(req.headers.get("authorization"));
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  return store.get(payload.userId);
};

const server = Bun.serve<PresenceData>({
  port,
  async fetch(req, server) {
    const url = new URL(req.url);
    const { pathname } = url;

    // live online-count socket; the token (if any) lets us dedupe by user
    if (pathname === "/presence") {
      const token = url.searchParams.get("token");
      const payload = token ? await verifyToken(token) : null;
      if (server.upgrade(req, { data: { userId: payload?.userId ?? null } }))
        return undefined;
      return new Response("upgrade failed", { status: 400 });
    }

    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers: CORS });

    // --- health ---
    if (pathname === "/health") {
      return json({
        ok: true,
        service: "server",
        version: GAME_VERSION,
        store: store.kind,
      });
    }

    // --- auth: create an anonymous account (only the central server issues tokens) ---
    if (pathname === "/auth/anon" && req.method === "POST") {
      const user = await store.createAnon();
      const token = await signToken({ userId: user.id, name: user.name });
      return json({ token, user });
    }

    // --- auth: who am I (validates an existing token, returns fresh profile) ---
    if (pathname === "/auth/me" && req.method === "GET") {
      const user = await authUser(req);
      if (!user) return json({ error: "unauthorized" }, 401);
      void store.touch(user.id); // activity signal for analytics
      return json({ user });
    }

    // --- auth: rename (re-issues a token carrying the new name) ---
    if (pathname === "/auth/name" && req.method === "POST") {
      const user = await authUser(req);
      if (!user) return json({ error: "unauthorized" }, 401);
      const body = (await req.json().catch(() => ({}))) as { name?: string };
      const clean = sanitizeName(body.name ?? "");
      if (!clean) return json({ error: "invalid_name" }, 400);
      const updated = await store.rename(user.id, clean);
      if (!updated) return json({ error: "not_found" }, 404);
      const token = await signToken({ userId: updated.id, name: updated.name });
      return json({ token, user: updated });
    }

    // --- auth: shuffle to a fresh random name (generation stays server-side) ---
    if (pathname === "/auth/shuffle" && req.method === "POST") {
      const user = await authUser(req);
      if (!user) return json({ error: "unauthorized" }, 401);
      const updated = await store.rename(user.id, generateName());
      if (!updated) return json({ error: "not_found" }, 404);
      const token = await signToken({ userId: updated.id, name: updated.name });
      return json({ token, user: updated });
    }

    // --- auth: begin Google OAuth (anon token rides along as state to link) ---
    if (pathname === "/auth/google/start" && req.method === "GET") {
      if (!googleConfigured())
        return json({ error: "oauth_not_configured" }, 503);
      const state = url.searchParams.get("token") ?? "";
      return new Response(null, {
        status: 302,
        headers: { ...CORS, Location: googleAuthUrl(state) },
      });
    }

    // --- auth: Google OAuth callback -> link/create account, back to client ---
    if (pathname === "/auth/google/callback" && req.method === "GET") {
      const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";
      const code = url.searchParams.get("code");
      if (!code) return Response.redirect(`${clientUrl}#error=oauth`, 302);
      const profile = await exchangeGoogleCode(code);
      if (!profile) return Response.redirect(`${clientUrl}#error=oauth`, 302);
      const anon = await verifyToken(url.searchParams.get("state") ?? "");
      const user = await store.linkGoogle(anon?.userId ?? null, profile);
      const token = await signToken({ userId: user.id, name: user.name });
      return Response.redirect(
        `${clientUrl}#token=${encodeURIComponent(token)}`,
        302,
      );
    }

    // --- leaderboard: top players by wins then goals (public, no auth) ---
    if (pathname === "/leaderboard" && req.method === "GET") {
      const limit = Math.min(
        50,
        Math.max(1, Number(url.searchParams.get("limit")) || 10),
      );
      const players = await store.topPlayers(limit);
      return json({ players });
    }

    // --- news: hand-authored announcements (public, no auth) ---
    if (pathname === "/news" && req.method === "GET") {
      const limit = Math.min(
        20,
        Math.max(1, Number(url.searchParams.get("limit")) || 10),
      );
      if (
        !newsCache ||
        newsCache.limit !== limit ||
        Date.now() - newsCache.at > NEWS_TTL
      ) {
        newsCache = {
          at: Date.now(),
          limit,
          data: await store.listNews(limit),
        };
      }
      return json({ news: newsCache.data });
    }

    // --- admin: aggregate analytics (admin accounts only) ---
    if (pathname === "/admin/stats" && req.method === "GET") {
      const user = await authUser(req);
      if (!user?.isAdmin) return json({ error: "forbidden" }, 403);
      const base = await store.stats();
      let serversOnline = 0;
      await Promise.all(
        gameServers.map(async (s) => {
          try {
            await fetch(`${s.httpUrl}/health`, {
              signal: AbortSignal.timeout(1500),
            });
            serversOnline++;
          } catch {
            /* offline */
          }
        }),
      );
      const top = await store.topPlayers(10);
      return json({
        stats: {
          ...base,
          onlineNow: onlineCount(),
          serversOnline,
          serversTotal: gameServers.length,
        },
        top,
      });
    }

    // --- server picker: list game-server regions with live player counts ---
    if (pathname === "/servers" && req.method === "GET") {
      const servers = await Promise.all(
        gameServers.map(async (s) => {
          let players = 0;
          let online = false;
          try {
            const res = await fetch(`${s.httpUrl}/health`, {
              signal: AbortSignal.timeout(1500),
            });
            const h = (await res.json()) as { players?: number };
            players = h.players ?? 0;
            online = true;
          } catch {
            /* server unreachable -> online:false */
          }
          return {
            id: s.id,
            name: s.name,
            region: s.region,
            flag: s.flag,
            wsUrl: s.wsUrl,
            players,
            online,
          };
        }),
      );
      return json({ servers });
    }

    // --- room list: proxy the chosen game server's /rooms (avoids client CORS) ---
    if (pathname === "/rooms" && req.method === "GET") {
      const target = findServer(url.searchParams.get("server") ?? "");
      if (!target) return json({ error: "unknown_server", rooms: [] }, 404);
      try {
        const res = await fetch(`${target.httpUrl}/rooms`, {
          signal: AbortSignal.timeout(2500),
        });
        const data = (await res.json()) as { rooms?: unknown[] };
        return json({ rooms: data.rooms ?? [] });
      } catch {
        return json({ rooms: [], error: "unreachable" });
      }
    }

    // --- internal: game server reports finished-match results (updates stats) ---
    if (pathname === "/internal/match" && req.method === "POST") {
      if (req.headers.get("x-internal-secret") !== INTERNAL_SECRET)
        return json({ error: "forbidden" }, 403);
      const body = (await req.json().catch(() => ({}))) as {
        results?: { userId: string; won: boolean; goals?: number }[];
      };
      for (const r of body.results ?? [])
        await store.recordMatch(r.userId, r.won, r.goals ?? 0);
      return json({ ok: true });
    }

    return new Response("fuseball central server", {
      status: 200,
      headers: CORS,
    });
  },
  websocket: {
    open(ws) {
      presence.set(ws, ws.data.userId);
      ws.send(JSON.stringify({ type: "online", count: onlineCount() }));
      broadcastOnline();
    },
    close(ws) {
      presence.delete(ws);
      broadcastOnline();
    },
    message() {},
  },
});

store = await initStore();
console.log(
  `[server] http://localhost:${server.port} (v${GAME_VERSION}, store=${store.kind})`,
);
