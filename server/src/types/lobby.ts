export type LobbyStatus = "warmup" | "in-progress" | "finished";

export type PositionType = {
  x: number;
  y: number;
};

export type ScoreType = number[];

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
  scoredThisTurn: boolean; // this determines if we already accounted for a goal this turn (to prevent counting a goal every game loop tick)
  timeLeft: number;
  roundStatus: "live" | "protected"; // protected means that one team needs to start by touching the ball
  startingTeam: number; // this is the team that needs to start by touching the ball
  timeSinceRoundStart: number;
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
