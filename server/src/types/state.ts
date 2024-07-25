import WebSocket from "ws";
import { Lobby, LobbyLive } from "./lobby";

export type State = {
  lobbies: Lobby[];
  lobbiesLive: Record<string, LobbyLive>;
  _wss?: WebSocket.Server;
};
