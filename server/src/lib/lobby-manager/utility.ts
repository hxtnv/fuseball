import WebSocket from "ws";
import { getState, setState } from "./state";
import getInitialBallPosition from "../helpers/get-initial-ball-position";
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
    state.lobbiesLive[lobbyId].ball.position = getInitialBallPosition();

    state.lobbiesLive[lobbyId].scoredThisTurn = false;
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

  setState(state);
};
