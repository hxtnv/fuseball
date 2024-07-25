import { randomUUID } from "crypto";
import getCountryCodeFromTimezone from "../helpers/get-country-code-from-timezone";
import getInitialPosition from "../helpers/get-initial-position";
import getInitialBallPosition from "../helpers/get-initial-ball-position";
import { getState, setState } from "./state";
import { CreateLobby, Lobby } from "../../types/lobby";

export const create = (
  { name, teamSize, player, timezone }: CreateLobby,
  playerId: string
) => {
  const state = getState();

  if (!playerId || typeof playerId !== "string") {
    return {
      lobby: undefined,
      error: "Invalid player ID. Please refresh the page and try again.",
    };
  }

  if (
    state.lobbies.find((lobby) => lobby.players.find((p) => p.id === playerId))
  ) {
    return {
      lobby: undefined,
      error: "You are already in another lobby!",
    };
  }

  if (name.replace(/\s+/g, "") === "") {
    return {
      lobby: undefined,
      error: "Lobby name cannot be empty!",
    };
  }

  if (name.replace(/\s+/g, "").length < 4) {
    return {
      lobby: undefined,
      error: "Lobby name must be at least 4 characters long!",
    };
  }

  if (isNaN(teamSize) || teamSize < 1 || typeof teamSize !== "number") {
    return {
      lobby: undefined,
      error: "Invalid team size. Please enter a number between 1 and 4.",
    };
  }

  if (typeof player?.name !== "string" || player?.name?.length < 3) {
    return {
      lobby: undefined,
      error:
        "Invalid player name! Choose a name that is at least 3 characters long.",
    };
  }

  const id = randomUUID();

  const lobbyName = name.substring(0, 40);
  const lobbySize = Math.min(teamSize, 4);
  const playerName = player.name.substring(0, 30);

  const validatedPlayer = {
    id: playerId,
    team: 0,
    emoji: player.emoji,
    name: playerName,
    position: getInitialPosition(0, 0),
  };

  const newLobby: Lobby = {
    id,
    status: "warmup",
    name: lobbyName,
    teamSize: lobbySize,
    score: [0, 0],
    players: [validatedPlayer],
    countryCode: getCountryCodeFromTimezone(timezone),
  };

  state.lobbies = [...state.lobbies, newLobby];

  state.lobbiesLive[id] = {
    id,
    status: newLobby.status,
    score: [0, 0],
    playersMovement: {
      [playerId]: {},
    },
    players: newLobby.players.map((player, index) => ({
      ...validatedPlayer,
      position: getInitialPosition(index, 0),
    })),
    ball: {
      position: getInitialBallPosition(),
    },
    chatMessages: {},
    scoredThisTurn: false,
    timeLeft: 0,
  };

  console.log(
    `New lobby named "${lobbyName}" has been created by "${playerName}" (1/${
      lobbySize * 2
    })`
  );

  setState(state);

  return {
    lobby: state.lobbies.find((lobby) => lobby.id === id),
    error: undefined,
  };
};
