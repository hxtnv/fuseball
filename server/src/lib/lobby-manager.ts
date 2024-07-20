import { randomUUID } from "crypto";

export type LobbyPlayer = {
  id: string;
  name: string;
  emoji: number;
  team: number; // 0 or 1
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

type JoinLobby = {
  id: string;
  team?: 0 | 1;
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

  const getClientLobby = (playerId: string) => {
    const lobby = state.lobbies.find((lobby) => {
      return lobby.players.map((player) => player.id).includes(playerId);
    });
    const player = lobby?.players.find((player) => player.id === playerId);

    return {
      lobby,
      player,
    };
  };

  const create = (
    { name, teamSize, player }: CreateLobby,
    playerId: string
  ) => {
    if (!playerId || typeof playerId !== "string") {
      return {
        lobby: undefined,
        error: "Invalid player ID. Please refresh the page and try again.",
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

  const join = ({ id, team, player }: JoinLobby, playerId: string) => {
    const { lobby: existingLobby } = getClientLobby(playerId);
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

    if (lobby.status === "finished") {
      return {
        error: "This lobby has already finished!",
        lobby: undefined,
      };
    }

    const getTeam = () => {
      // if team is either invalid or not defined, we will join the less populated team
      if (team !== 0 && team !== 1) {
        const teamZeroSlots =
          lobby.teamSize -
          lobby.players.filter((player) => player.team === 0).length;
        const teamOneSlots =
          lobby.teamSize -
          lobby.players.filter((player) => player.team === 1).length;

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

      // if team is defined, we check if there are empty slots
      const teamSlots =
        lobby.teamSize -
        lobby.players.filter((player) => player.team === team).length;

      return teamSlots > 0 ? team : -1;
    };

    const teamToJoin: number = getTeam();

    if (teamToJoin === -1) {
      return {
        error:
          typeof team === "number"
            ? "This team is full!"
            : "All teams are full!",
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
                ...player,
                team: teamToJoin,
                id: playerId,
              },
            ],
          }
        : lobby
    );

    return {
      error: undefined,
      lobby: state.lobbies.find((lobby) => lobby.id === id),
    };
  };

  const removeClientFromLobbies = (playerId: string) => {
    const { lobby, player } = getClientLobby(playerId);

    if (!lobby || !player) return;

    console.log(
      `Player "${player.name}" has left the lobby "${lobby.name}" (${
        lobby.players.length - 1
      }/${lobby.teamSize * 2})`
    );

    state.lobbies = state.lobbies.map((lobby) => ({
      ...lobby,
      players: lobby.players.filter((player) => player.id !== playerId),
    }));

    state.lobbies = state.lobbies.filter((lobby) => lobby.players.length > 0);
  };

  return {
    getAll,
    get,
    getClientLobby,
    create,
    join,
    removeClientFromLobbies,
  };
};

const manager = lobbyManager();
Object.freeze(manager);

export default manager;
