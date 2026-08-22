// Registry of available game servers (regions). Configure in production via the
// GAME_SERVERS env var (a JSON array). Falls back to the local dev game server.
export interface GameServer {
  id: string;
  name: string;
  region: string;
  flag?: string; // ISO 3166-1 alpha-2 country code, for the picker flag
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
  // Dev fallback: labelled regions that all point at the single local game
  // server so the picker UI is populated locally. Prod sets GAME_SERVERS.
  const wsUrl = process.env.GAME_WS_URL ?? "ws://localhost:3002/ws";
  const httpUrl = process.env.GAME_HTTP_URL ?? "http://localhost:3002";
  return [
    {
      id: "eu-west",
      name: "Europe West",
      region: "Frankfurt",
      flag: "de",
      wsUrl,
      httpUrl,
    },
    {
      id: "eu-north",
      name: "Europe North",
      region: "Stockholm",
      flag: "se",
      wsUrl,
      httpUrl,
    },
    {
      id: "us-east",
      name: "US East",
      region: "New York",
      flag: "us",
      wsUrl,
      httpUrl,
    },
    {
      id: "us-west",
      name: "US West",
      region: "Los Angeles",
      flag: "us",
      wsUrl,
      httpUrl,
    },
    {
      id: "asia",
      name: "Asia",
      region: "Singapore",
      flag: "sg",
      wsUrl,
      httpUrl,
    },
    { id: "local", name: "Local Dev", region: "Localhost", wsUrl, httpUrl },
  ];
})();

export const findServer = (id: string): GameServer | undefined =>
  gameServers.find((s) => s.id === id);

// Public view for clients (hide the internal httpUrl used for room polling).
export const publicServers = () =>
  gameServers.map(({ id, name, region, flag, wsUrl }) => ({
    id,
    name,
    region,
    flag,
    wsUrl,
  }));
