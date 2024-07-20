import { randomUUID } from "crypto";

export type LobbyPlayer = {
  id: string;
  name: string;
  emoji: number;
  team: 0 | 1;
};

export type Lobby = {
  id: string;
  status: "warmup" | "in-progress" | "finished";
  name: string;
  players: LobbyPlayer[];
  teamSize: number;
  countryCode: string;
  score?: string;
};

type CreateLobby = {
  name: string;
  teamSize: number;
  player: LobbyPlayer;
};

type State = {
  lobbies: Lobby[];
};

const getState = () => ({ lobbies: [] } as State);

const lobbyManager = () => {
  const state = getState();

  const getAll = () => {
    return state.lobbies;
  };

  const get = (id: string) => {
    return state.lobbies.find((lobby) => lobby.id === id);
  };

  const create = (
    { name, teamSize, player }: CreateLobby,
    playerId: string
  ) => {
    if (!playerId) {
      return {
        lobby: undefined,
        error: "Player is not defined. Please refresh the page and try again.",
      };
    }

    if (
      state.lobbies.find((lobby) =>
        lobby.players.find((p) => p.id === playerId)
      )
    ) {
      return {
        lobby: undefined,
        error: "You are already in another lobby!",
      };
    }

    // if name is only whitespaces
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

    const id = randomUUID();

    const lobbyName = name.substring(0, 40);
    const lobbySize = Math.min(teamSize, 4);
    const playerName = player.name.substring(0, 30);

    state.lobbies.push({
      id,
      status: "warmup",
      name: lobbyName,
      teamSize: lobbySize,
      players: [
        {
          ...player,
          name: playerName,
          id: playerId,
          team: 0,
        },
      ],
      countryCode: "PL",
    });

    console.log(
      `New lobby named "${lobbyName}" has been created by "${playerName}" (1/${
        lobbySize * 2
      })`
    );

    return {
      lobby: state.lobbies.find((lobby) => lobby.id === id),
      error: undefined,
    };
  };

  const removeClientLobbies = (clientId: string) => {
    const lobby = state.lobbies.find((lobby) => {
      return lobby.players.map((player) => player.id).includes(clientId);
    });
    const player = lobby?.players.find((player) => player.id === clientId);

    if (!lobby) return;

    console.log(
      `Player "${player?.name}" has left the lobby "${lobby.name}" (${
        lobby.players.length - 1
      }/${lobby.teamSize * 2})`
    );

    state.lobbies = state.lobbies.map((lobby) => ({
      ...lobby,
      players: lobby.players.filter((player) => player.id !== clientId),
    }));

    state.lobbies = state.lobbies.filter((lobby) => lobby.players.length > 0);
  };

  return {
    getAll,
    get,
    create,
    removeClientLobbies,
  };
};

const manager = lobbyManager();
Object.freeze(manager);

export default manager;
