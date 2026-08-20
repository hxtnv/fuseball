import WebSocket from "ws";
import { State } from "../../types/state";
import didLobbiesChange from "../helpers/did-lobbies-change";
import { broadcast } from "../utils";
import { removeClientFromLobbies } from "./remove";
import type { PlayerData } from "../../types/player";
import { WebSocketClient } from "../../types/ws";

const createState = () =>
  ({
    lobbies: [],
    lobbiesLive: {},
    clients: {},
    _wss: undefined,
  } as State);

const state = createState();

export const getState = () => ({ ...state });

export const getAll = () => state.lobbies;

export const getAllLive = () => state.lobbiesLive;

export const setWss = (wss: WebSocket.Server) => {
  state._wss = wss;
};

export const addClient = (client: PlayerData) => {
  if (typeof client.id === "undefined") return;

  state.clients[client.id] = client;

  if (state._wss) {
    broadcast(state._wss, "players-online", Object.keys(state.clients).length);
  }
};

export const removeClient = (client: PlayerData) => {
  if (typeof client.id === "undefined") return;

  let isActiveInOtherTab = false;
  for (const wsClient of state._wss?.clients ?? new Set()) {
    if ((wsClient as WebSocketClient).playerData?.id === client.id) {
      isActiveInOtherTab = true;
      break;
    }
  }

  if (!isActiveInOtherTab) {
    delete state.clients[client.id];

    removeClientFromLobbies(client);

    if (state._wss) {
      broadcast(
        state._wss,
        "players-online",
        Object.keys(state.clients).length
      );
    }
  }
};

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

export const getClientLobby = (playerId: number) => {
  const lobby = state.lobbies.find((lobby) =>
    lobby.players.map((player) => player.id).includes(playerId)
  );
  const player = lobby?.players.find((player) => player.id === playerId);

  return {
    lobby,
    player,
  };
};

export const setState = (newState: State) => {
  if (didLobbiesChange(state.lobbies, newState.lobbies)) {
    if (state._wss) {
      broadcast(state._wss, "lobbies", newState.lobbies);
    }
  }

  Object.assign(state, newState);
};
