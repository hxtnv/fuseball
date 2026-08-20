import WebSocket from "ws";
import { getState, setState } from "./state";
import getInitialBallPosition from "../helpers/get-initial-ball-position";
import { LobbyStatus } from "../../types/lobby";
import getInitialPositions from "../helpers/get-initial-positions";
import { log } from "../logger";
import GAME from "../const/game";
import prisma from "../prisma";
import { removeLobby } from "./remove";

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
  state.lobbiesLive[lobbyId].goals.push({
    winningTeam: team,
    losingTeam: team === 0 ? 1 : 0,
    scoredBy: state.lobbiesLive[lobbyId].ball.lastTouchedBy ?? 0, // todo: get player id
    scoredAt: GAME.TIME - state.lobbiesLive[lobbyId].timeLeft,
  });

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

export const updateStatus = async (
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
    state.lobbiesLive[lobbyId].playersMovement = {};

    const lobbyDetails = state.lobbies.find((lobby) => lobby.id === lobbyId);
    state.lobbies = state.lobbies.filter((lobby) => lobby.id !== lobbyId);

    if (lobbyDetails) {
      await prisma.matches.create({
        data: {
          name: lobbyDetails.name,
          score: lobbyDetails.score.join(":"),
          players: lobbyDetails.players.map((player) => player.id),
          goals: state.lobbiesLive[lobbyId].goals.map((goal) => ({
            winningTeam: goal.winningTeam,
            losingTeam: goal.losingTeam,
            scoredBy: goal.scoredBy,
            scoredAt: goal.scoredAt,
          })),
          team_size: lobbyDetails.teamSize,
          country_code: lobbyDetails.countryCode,
        },
      });

      // todo: update all players
      const winningTeam =
        lobbyDetails.score[0] === lobbyDetails.score[1]
          ? -1
          : lobbyDetails.score[0] > lobbyDetails.score[1]
          ? 0
          : 1;

      state.lobbiesLive[lobbyId].players
        .filter((p) => !!p.authenticated)
        .forEach(async (p) => {
          try {
            await prisma.users.update({
              where: {
                id: p.id ?? 0,
              },
              data: {
                total_wins: {
                  increment: p.team === winningTeam ? 1 : 0,
                },
                total_games: {
                  increment: 1,
                },
                total_goals: {
                  increment: state.lobbiesLive[lobbyId].goals.filter(
                    (goal) => goal.scoredBy === p.id
                  ).length,
                },
              },
            });
          } catch (e) {
            console.error("Failed to update user stats", e);
          }
        });

      log(
        `Lobby "${
          lobbyDetails.name
        }" has finished with a score of ${lobbyDetails.score.join(" : ")}`
      );

      removeLobby(lobbyId);
    }
  }

  setState(state);
};
