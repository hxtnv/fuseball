import { randomUUID } from "crypto";
import getCountryCodeFromTimezone from "../helpers/get-country-code-from-timezone";
import getInitialPosition from "../helpers/get-initial-position";
import getInitialBallPosition from "../helpers/get-initial-ball-position";
import { getState, setState } from "./state";
import { CreateLobby, Lobby } from "../../types/lobby";
import { PlayerData } from "../../types/player";
import { log } from "../logger";

export const create = (
  { name, teamSize, timezone }: CreateLobby,
  playerData: PlayerData
) => {
  const state = getState();

  if (
    state.lobbies.find((lobby) =>
      lobby.players.find((p) => p.id === playerData.id)
    )
  ) {
    return {
      lobby: undefined,
      error: "You are already in another lobby!",
    };
  }

  if (typeof name !== "string") {
    return {
      lobby: undefined,
      error:
        "Invalid lobby name. Please enter a name that is at least 4 characters long.",
    };
  }

  if (name?.replace(/\s+/g, "") === "") {
    return {
      lobby: undefined,
      error: "Lobby name cannot be empty!",
    };
  }

  if (name?.replace(/\s+/g, "").length < 4) {
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

  const id = randomUUID();

  const lobbyName = name.substring(0, 40);
  const lobbySize = Math.min(teamSize, 4);

  const validatedPlayer = {
    ...playerData,
    position: getInitialPosition(0, 0),
    team: 0,
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
      [playerData.id]: {},
    },
    players: newLobby.players.map((player, index) => ({
      ...validatedPlayer,
      position: getInitialPosition(index, 0),
    })),
    ball: {
      position: getInitialBallPosition(),
      velocity: { x: 0, y: 0 },
    },
    chatMessages: {},
    scoredThisTurn: false,
    timeLeft: 0,
    roundStatus: "live",
    startingTeam: 0,
    timeSinceRoundStart: 0,
    goals: [],
  };

  log(
    `New lobby named "${lobbyName}" has been created by "${
      playerData.name
    }" from timezone "${timezone}" (1/${lobbySize * 2})`
  );

  setState(state);

  return {
    lobby: state.lobbies.find((lobby) => lobby.id === id),
    error: undefined,
  };
};
