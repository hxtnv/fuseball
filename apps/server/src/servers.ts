// Registry of available game servers (regions). Configure in production via the
// GAME_SERVERS env var (a JSON array). Falls back to the local dev game server.
export interface GameServer {
  id: string;
  name: string;
  region: string;
  wsUrl: string; // clients connect their WebSocket here
  httpUrl: string; // central server queries this for the room list
}

export const gameServers: GameServer[] = (() => {
  const raw = process.env.GAME_SERVERS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as GameServer[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (err) {
      console.error("[server] invalid GAME_SERVERS env, using default:", err);
    }
  }
  return [
    {
      id: "local",
      name: "Local Dev",
      region: "localhost",
      wsUrl: process.env.GAME_WS_URL ?? "ws://localhost:3002/ws",
      httpUrl: process.env.GAME_HTTP_URL ?? "http://localhost:3002",
    },
  ];
})();

export const findServer = (id: string): GameServer | undefined =>
  gameServers.find((s) => s.id === id);

// Public view for clients (hide the internal httpUrl used for room polling).
export const publicServers = () =>
  gameServers.map(({ id, name, region, wsUrl }) => ({
    id,
    name,
    region,
    wsUrl,
  }));
