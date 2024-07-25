import { Lobby, LobbyLive } from "../../types/lobby";
import { State } from "../../types/state";

let state: State = {
  lobbies: [],
  lobbiesLive: {},
};

export const getState = () => state;

export const getAll = () => state.lobbies;

export const getAllLive = () => state.lobbiesLive;

export const get = (id: string) => {
  const lobby = state.lobbies.find((lobby) => lobby.id === id);
  const lobbyLive = state.lobbiesLive[id];

  if (!lobby || !lobbyLive) {
    return undefined;
  }

  return {
    lobby,
    lobbyLive,
  };
};

export const getClientLobby = (playerId: string) => {
  const lobby = state.lobbies.find((lobby) =>
    lobby.players.map((player) => player.id).includes(playerId)
  );
  const player = lobby?.players.find((player) => player.id === playerId);

  return {
    lobby,
    player,
  };
};

// Export state directly for manipulation in other modules
export const setState = (newState: State) => {
  state = newState;
};
