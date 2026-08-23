import { API } from "./game/config";

// Client-side auth + central-server API. All account logic lives on the server;
// this just stores the issued token and talks to the endpoints.
export interface User {
  id: string;
  name: string;
  isAnonymous: boolean;
  friendCode: string | null;
  balance: number;
  gamesPlayed: number;
  wins: number;
  goals: number;
}

export interface GameServerInfo {
  id: string;
  name: string;
  region: string;
  flag?: string;
  wsUrl: string;
  players?: number;
  online?: boolean;
}

export interface RoomInfo {
  id: string;
  players: number;
  max: number;
  status: string;
}

const TOKEN_KEY = "fuseball.token";

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
const setToken = (t: string): void => {
  localStorage.setItem(TOKEN_KEY, t);
  window.dispatchEvent(new Event("fuseball:token"));
};

// drop the stored token; callers then re-run ensureAuth() for a fresh anon account
export const signOut = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("fuseball:token"));
};

// URL that begins the Google OAuth redirect (carries the anon token so the
// server can migrate this anonymous account into the signed-in one).
export const googleSignInUrl = (token: string): string =>
  `${API.baseUrl}/auth/google/start?token=${encodeURIComponent(token)}`;

// If we just came back from the OAuth redirect with a #token=..., store it and
// strip it from the URL so the app boots signed in.
export const consumeRedirectToken = (): void => {
  const m = window.location.hash.match(/token=([^&]+)/);
  if (!m) return;
  setToken(decodeURIComponent(m[1]!));
  history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search,
  );
};

// Load the stored account (validating its token), or create a fresh anonymous one.
export const ensureAuth = async (): Promise<{ token: string; user: User }> => {
  const existing = getToken();
  if (existing) {
    const res = await fetch(`${API.baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${existing}` },
    });
    if (res.ok) {
      const { user } = (await res.json()) as { user: User };
      return { token: existing, user };
    }
  }
  const res = await fetch(`${API.baseUrl}/auth/anon`, { method: "POST" });
  if (!res.ok) throw new Error("failed to create account");
  const { token, user } = (await res.json()) as { token: string; user: User };
  setToken(token);
  return { token, user };
};

export const renameUser = async (
  token: string,
  name: string,
): Promise<{ token: string; user: User }> => {
  const res = await fetch(`${API.baseUrl}/auth/name`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("rename failed");
  const data = (await res.json()) as { token: string; user: User };
  setToken(data.token);
  return data;
};

export const shuffleName = async (
  token: string,
): Promise<{ token: string; user: User }> => {
  const res = await fetch(`${API.baseUrl}/auth/shuffle`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("shuffle failed");
  const data = (await res.json()) as { token: string; user: User };
  setToken(data.token);
  return data;
};

export interface LeaderboardEntry {
  id: string;
  name: string;
  wins: number;
  goals: number;
  gamesPlayed: number;
}

export const fetchLeaderboard = async (
  limit = 10,
): Promise<LeaderboardEntry[]> => {
  const res = await fetch(`${API.baseUrl}/leaderboard?limit=${limit}`);
  if (!res.ok) return [];
  const { players } = (await res.json()) as { players: LeaderboardEntry[] };
  return players;
};

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  description: string; // Markdown
  image: string | null;
  createdAt: string; // ISO
}

export const fetchNews = async (limit = 10): Promise<NewsItem[]> => {
  const res = await fetch(`${API.baseUrl}/news?limit=${limit}`);
  if (!res.ok) throw new Error("news_unavailable");
  const { news } = (await res.json()) as { news: NewsItem[] };
  return news;
};

export const fetchServers = async (): Promise<GameServerInfo[]> => {
  const res = await fetch(`${API.baseUrl}/servers`);
  const { servers } = (await res.json()) as { servers: GameServerInfo[] };
  return servers;
};

export const fetchRooms = async (serverId: string): Promise<RoomInfo[]> => {
  const res = await fetch(
    `${API.baseUrl}/rooms?server=${encodeURIComponent(serverId)}`,
  );
  const { rooms } = (await res.json()) as { rooms: RoomInfo[] };
  return rooms;
};

// Build the WebSocket URL the game client connects to (token + optional room).
export const buildWsUrl = (
  wsUrl: string,
  token: string,
  roomId?: string,
): string => {
  const u = new URL(wsUrl);
  u.searchParams.set("token", token);
  if (roomId) u.searchParams.set("room", roomId);
  return u.toString();
};
