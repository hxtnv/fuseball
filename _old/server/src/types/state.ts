import WebSocket from "ws";
import { Lobby, LobbyLive } from "./lobby";
import type { PlayerData } from "./player";

export type State = {
  lobbies: Lobby[];
  lobbiesLive: Record<string, LobbyLive>;
  clients: Record<string, PlayerData>;
  _wss?: WebSocket.Server;
};
