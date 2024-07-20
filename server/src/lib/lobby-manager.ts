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

const lobbyManager = () => {
  const lobbies: Lobby[] = [];

  const getAll = () => {
    return lobbies;
  };

  const get = (id: string) => {
    return lobbies.find((lobby) => lobby.id === id);
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

    if (lobbies.find((lobby) => lobby.players.find((p) => p.id === playerId))) {
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

    lobbies.push({
      id,
      status: "warmup",
      name: lobbyName,
      teamSize: lobbySize,
      players: [
        {
          ...player,
          id: playerId,
          team: 0,
        },
      ],
      countryCode: "PL",
    });

    return {
      lobby: lobbies.find((lobby) => lobby.id === id),
      error: undefined,
    };
  };

  return {
    getAll,
    get,
    create,
  };
};

const manager = lobbyManager();
Object.freeze(manager);

export default manager;
