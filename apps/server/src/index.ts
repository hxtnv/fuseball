import { GAME_VERSION } from "@fuseball/shared";
import {
  bearer,
  generateName,
  sanitizeName,
  signToken,
  verifyToken,
} from "@fuseball/auth";
import { initStore, type UserStore } from "./store";
import { findServer, gameServers } from "./servers";

const port = Number(process.env.PORT ?? 3001);
const INTERNAL_SECRET =
  process.env.INTERNAL_SECRET ?? "dev-internal-secret-change-me";

let store: UserStore;

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

const server = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    const { pathname } = url;

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
});

store = await initStore();
console.log(
  `[server] http://localhost:${server.port} (v${GAME_VERSION}, store=${store.kind})`,
);
