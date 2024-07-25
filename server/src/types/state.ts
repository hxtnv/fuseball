import { Lobby, LobbyLive } from "./lobby";
export type State = {
  lobbies: Lobby[];
  lobbiesLive: Record<string, LobbyLive>;
};
