import WebSocket from "ws";
import { getState, setState } from "./state";
import getInitialBallPosition from "../helpers/get-initial-ball-position";
import getInitialPosition from "../helpers/get-initial-position";
import { LobbyStatus } from "../../types/lobby";

export const registerBallHit = (
  lobbyId: string,
  team: number,
  callback?: () => void
) => {
  const state = getState();

  if (state.lobbiesLive[lobbyId].scoredThisTurn) {
    return;
  }

  state.lobbiesLive[lobbyId].scoredThisTurn = true;
  state.lobbiesLive[lobbyId].score[team]++;
  state.lobbies = state.lobbies.map((lobby) =>
    lobby.id === lobbyId
      ? { ...lobby, score: lobby.score.map((s, i) => (i === team ? s + 1 : s)) }
      : lobby
  );

  const timeout = setTimeout(() => {
    if (!state.lobbiesLive[lobbyId]) {
      return;
    }

    state.lobbiesLive[lobbyId] = {
      ...state.lobbiesLive[lobbyId],
      ball: {
        ...state.lobbiesLive[lobbyId].ball,
        position: getInitialBallPosition(),
      },
      scoredThisTurn: false,
      players: state.lobbiesLive[lobbyId].players.map((player, index) => ({
        ...player,
        position: getInitialPosition(index, player.team),
      })),
    };
  }, 2500);

  if (callback) {
    callback();
  }

  setState(state);
};

export const updateStatus = (
  lobbyId: string,
  {
    status,
    timeLeft,
  }: {
    status: LobbyStatus;
    timeLeft?: number;
  },
  wss?: WebSocket.Server
) => {
  const state = getState();

  if (!state.lobbiesLive[lobbyId]) {
    return;
  }

  state.lobbiesLive[lobbyId].status = status;
  state.lobbiesLive[lobbyId].timeLeft =
    timeLeft ?? state.lobbiesLive[lobbyId].timeLeft;

  state.lobbies = state.lobbies.map((lobby) =>
    lobby.id === lobbyId
      ? {
          ...lobby,
          status,
        }
      : lobby
  );

  if (status === "finished") {
    delete state.lobbiesLive[lobbyId];
    state.lobbies = state.lobbies.filter((lobby) => lobby.id !== lobbyId);
  }

  setState(state);
};
