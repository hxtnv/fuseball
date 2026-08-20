import { GAME_VERSION } from "@fuseball/shared";

const port = Number(process.env.PORT ?? 3001);

Bun.serve({
  port,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/health") {
      return Response.json({
        ok: true,
        service: "server",
        version: GAME_VERSION,
      });
    }
    return new Response("fuseball central server", { status: 200 });
  },
});

console.log(`[server] http://localhost:${port} (shared v${GAME_VERSION})`);
