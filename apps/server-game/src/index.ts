import { GAME_VERSION } from "@fuseball/shared";

const port = Number(process.env.PORT ?? 3002);

const server = Bun.serve({
  port,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/health") {
      return Response.json({
        ok: true,
        service: "server-game",
        version: GAME_VERSION,
      });
    }
    if (url.pathname === "/ws") {
      if (server.upgrade(req)) return;
      return new Response("websocket upgrade failed", { status: 400 });
    }
    return new Response("fuseball game server", { status: 200 });
  },
  websocket: {
    open(ws) {
      ws.send(JSON.stringify({ type: "hello", version: GAME_VERSION }));
    },
    message(ws, message) {
      ws.send(message); // echo for the scaffold
    },
    close() {},
  },
});

console.log(
  `[server-game] ws://localhost:${server.port}/ws (shared v${GAME_VERSION})`,
);
