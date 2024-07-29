import WebSocket from "ws";
import { getState, setState } from "./state";
import getInitialBallPosition from "../helpers/get-initial-ball-position";
import { LobbyStatus } from "../../types/lobby";
import getInitialPositions from "../helpers/get-initial-positions";

export const registerBallHit = (
  lobbyId: string,
  team: number,
  callback?: () => void
) => {
  const state = getState();

  if (
    state.lobbiesLive[lobbyId].scoredThisTurn ||
    state.lobbiesLive[lobbyId].status !== "in-progress"
  ) {
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
        velocity: { x: 0, y: 0 },
      },
      scoredThisTurn: false,
      players: getInitialPositions(state.lobbiesLive[lobbyId].players),
      roundStatus: "protected",
      startingTeam: team === 0 ? 1 : 0,
      timeSinceRoundStart: 0,
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

  if (status === "in-progress") {
    state.lobbiesLive[lobbyId].roundStatus = "protected";
    state.lobbiesLive[lobbyId].timeSinceRoundStart = 0;

    state.lobbiesLive[lobbyId].players = getInitialPositions(
      state.lobbiesLive[lobbyId].players
    );
    state.lobbiesLive[lobbyId].ball = {
      position: getInitialBallPosition(),
      velocity: { x: 0, y: 0 },
    };
  }

  if (status === "finished") {
    // delete state.lobbiesLive[lobbyId];
    state.lobbies = state.lobbies.filter((lobby) => lobby.id !== lobbyId);
  }

  setState(state);
};
