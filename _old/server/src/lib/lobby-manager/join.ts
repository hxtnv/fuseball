import { get, getClientLobby, getState, setState } from "./state";
import getInitialPosition from "../helpers/get-initial-position";
import GAME from "../const/game";
import { JoinLobby } from "../../types/lobby";
import { updateStatus } from "./utility";
import { PlayerData } from "../../types/player";
import { log } from "../logger";

export const join = ({ id, team }: JoinLobby, playerData: PlayerData) => {
  const state = getState();
  const { lobby: existingLobby } = getClientLobby(playerData.id);
  const lobby = get(id);

  if (existingLobby) {
    return {
      error: "You are already in another lobby!",
      lobby: undefined,
    };
  }

  if (!lobby) {
    return {
      error: "Lobby not found!",
      lobby: undefined,
    };
  }

  if (lobby.lobby.status === "finished") {
    return {
      error: "This lobby has already finished!",
      lobby: undefined,
    };
  }

  const getTeam = () => {
    if (team !== 0 && team !== 1) {
      const teamZeroSlots =
        lobby.lobby.teamSize -
        lobby.lobby.players.filter((player) => player.team === 0).length;
      const teamOneSlots =
        lobby.lobby.teamSize -
        lobby.lobby.players.filter((player) => player.team === 1).length;

      if (teamZeroSlots > teamOneSlots) {
        return 0;
      }

      if (teamOneSlots > teamZeroSlots) {
        return 1;
      }

      if (teamZeroSlots === 0 && teamOneSlots === 0) {
        return -1;
      }

      return Math.floor(Math.random() * 2);
    }

    const teamSlots =
      lobby.lobby.teamSize -
      lobby.lobby.players.filter((player) => player.team === team).length;

    return teamSlots > 0 ? team : -1;
  };

  const teamToJoin: number = getTeam();

  if (teamToJoin === -1) {
    return {
      error:
        typeof team === "number" ? "This team is full!" : "All teams are full!",
      lobby: undefined,
    };
  }

  state.lobbies = state.lobbies.map((lobby) =>
    lobby.id === id
      ? {
          ...lobby,
          players: [
            ...lobby.players,
            {
              ...playerData,
              team: teamToJoin,
            },
          ],
        }
      : lobby
  );

  state.lobbiesLive[id] = {
    ...state.lobbiesLive[id],
    players: [
      ...state.lobbiesLive[id].players,
      {
        ...playerData,
        team: teamToJoin,
        position: getInitialPosition(
          state.lobbiesLive[id].players.filter((p) => p.team === teamToJoin)
            .length,
          teamToJoin
        ),
      },
    ],
    playersMovement: {
      ...state.lobbiesLive[id].playersMovement,
      [playerData.id]: {},
    },
  };

  setState(state);

  if (state.lobbiesLive[id].status === "warmup") {
    updateStatus(id, {
      status: "in-progress",
      timeLeft: GAME.TIME,
    });
  }

  log(
    `Player "${playerData.name}" has joined the lobby "${lobby.lobby.name}" (${
      lobby.lobby.players.length + 1
    }/${lobby.lobby.teamSize * 2})`
  );

  return {
    error: undefined,
    lobby: state.lobbies.find((lobby) => lobby.id === id),
  };
};
