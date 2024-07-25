export type LobbyStatus = "warmup" | "in-progress" | "finished";

export type PositionType = {
  x: number;
  y: number;
};

export type ScoreType = [number, number];

export type Ball = {
  position: PositionType;
};

export type LobbyPlayer = {
  id: string;
  name: string;
  emoji: number;
  team: number; // 0 or 1
};

export type Lobby = {
  id: string;
  status: LobbyStatus;
  name: string;
  players: LobbyPlayer[];
  teamSize: number;
  countryCode: string;
  score: ScoreType;
};

export type LobbyPlayerLive = LobbyPlayer & {
  // status: "waiting" | "playing";
  position: PositionType;
};

export type LobbyLive = {
  id: string;
  status: LobbyStatus;
  players: LobbyPlayerLive[];
  playersMovement: Record<string, Record<string, boolean>>;
  score: ScoreType;
  chatMessages: Record<string, { message: string; timestamp: number }>;
  ball: Ball;
  scoredThisTurn: boolean;
  timeLeft: number;
};

export type CreateLobby = {
  name: string;
  teamSize: number;
  player: LobbyPlayer;
  timezone: string;
};

export type JoinLobby = {
  id: string;
  team?: number;
  player: LobbyPlayer;
};
