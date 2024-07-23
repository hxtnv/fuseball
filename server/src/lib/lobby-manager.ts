import { randomUUID } from "crypto";
import getCountryCodeFromTimezone from "./helpers/get-country-code-from-timezone";
import getInitialPosition from "./helpers/get-initial-position";
import calculateNewPlayerPosition from "./helpers/calculate-new-player-position";
import getInitialBallPosition from "./helpers/get-initial-ball-position";

type LobbyStatus = "warmup" | "in-progress" | "finished";

type PositionType = {
  x: number;
  y: number;
};

type ScoreType = [number, number];

export type LobbyPlayer = {
  id: string;
  name: string;
  emoji: number;
  team: number; // 0 or 1
};

export type Lobby = {
  id: string;
  status: LobbyStatus;
  name: string;
  players: LobbyPlayer[];
  teamSize: number;
  countryCode: string;
  score: ScoreType;
};

export type LobbyPlayerLive = LobbyPlayer & {
  // status: "waiting" | "playing";
  position: PositionType;
};

export type LobbyLive = {
  id: string;
  status: LobbyStatus;
  players: LobbyPlayerLive[];
  playersMovement: Record<string, Record<string, boolean>>;
  score: ScoreType;
  chatMessages: Record<string, { message: string; timestamp: number }>;
  ball: {
    position: PositionType;
  };
};

type CreateLobby = {
  name: string;
  teamSize: number;
  player: LobbyPlayer;
  timezone: string;
};

type JoinLobby = {
  id: string;
  team?: 0 | 1;
  player: LobbyPlayer;
};

type State = {
  lobbies: Lobby[];
  lobbiesLive: Record<string, LobbyLive>;
};

const getState = () => ({ lobbies: [], lobbiesLive: {} } as State);

const lobbyManager = () => {
  const state = getState();

  const getAll = () => {
    return state.lobbies;
  };

  const getAllLive = () => {
    return state.lobbiesLive;
  };

  const get = (id: string) => {
    const lobby = state.lobbies.find((lobby) => lobby.id === id);
    const lobbyLive = state.lobbiesLive[id];

    if (!lobby || !lobbyLive) {
      return undefined;
    }

    return {
      lobby,
      lobbyLive,
    };
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
    { name, teamSize, player, timezone }: CreateLobby,
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

    const newLobby: Lobby = {
      id,
      status: "warmup",
      name: lobbyName,
      teamSize: lobbySize,
      score: [0, 0],
      players: [
        {
          ...player,
          name: playerName,
          id: playerId,
          team: 0,
        },
      ],
      countryCode: getCountryCodeFromTimezone(timezone),
    };

    state.lobbies.push(newLobby);

    // todo: create a function that will handle both lobbies and lobbiesLive
    state.lobbiesLive[id] = {
      id,
      status: newLobby.status,
      score: [0, 0],
      playersMovement: {
        [playerId]: {},
      },
      players: newLobby.players.map((player, index) => ({
        ...player,
        position: getInitialPosition(index),
      })),
      ball: {
        position: getInitialBallPosition(),
      },
      chatMessages: {},
    };

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

    if (lobby.lobby.status === "finished") {
      return {
        error: "This lobby has already finished!",
        lobby: undefined,
      };
    }

    const getTeam = () => {
      // if team is either invalid or not defined, we will join the less populated team
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

      // if team is defined, we check if there are empty slots
      const teamSlots =
        lobby.lobby.teamSize -
        lobby.lobby.players.filter((player) => player.team === team).length;

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

    state.lobbiesLive[id] = {
      ...state.lobbiesLive[id],
      players: [
        ...state.lobbiesLive[id].players,
        {
          ...player,
          id: playerId,
          team: teamToJoin,
          position: getInitialPosition(state.lobbiesLive[id].players.length),
        },
      ],
      playersMovement: {
        ...state.lobbiesLive[id].playersMovement,
        [playerId]: {},
      },
    };

    console.log(
      `Player "${player.name}" has joined the lobby "${lobby.lobby.name}" (${
        lobby.lobby.players.length + 1
      }/${lobby.lobby.teamSize * 2})`
    );

    return {
      error: undefined,
      lobby: state.lobbies.find((lobby) => lobby.id === id),
    };
  };

  const removeClientFromLobbies = (playerId: string) => {
    const { lobby, player } = getClientLobby(playerId);

    if (!lobby || !player) return;

    state.lobbies = state.lobbies
      .map((lobby) => ({
        ...lobby,
        players: lobby.players.filter((player) => player.id !== playerId),
      }))
      .filter((lobby) => lobby.players.length > 0);

    // todo: remove the lobbiesLive entry too (if no players left)
    state.lobbiesLive[lobby.id].players = state.lobbiesLive[
      lobby.id
    ].players.filter((player) => player.id !== playerId);

    console.log(
      `Player "${player.name}" has left the lobby "${lobby.name}" (${
        lobby.players.length - 1
      }/${lobby.teamSize * 2})`
    );
  };

  const playerMoveStart = (direction: string, playerId: string) => {
    const { lobby: existingLobby } = getClientLobby(playerId);

    if (!existingLobby) {
      return;
    }

    state.lobbiesLive[existingLobby.id].playersMovement[playerId][direction] =
      true;
  };

  const playerMoveEnd = (direction: string, playerId: string) => {
    const { lobby: existingLobby } = getClientLobby(playerId);

    if (!existingLobby) {
      return;
    }

    state.lobbiesLive[existingLobby.id].playersMovement[playerId][direction] =
      false;

    // console.log(
    //   "playerMoveEnd",
    //   state.lobbiesLive[existingLobby.id].playersMovement[playerId]
    // );
  };

  // todo: have this function update every player in every lobby (instead of doing it in websocket-server.ts)
  const updatePlayerPosition = ({
    lobbyId,
    playerId,
  }: {
    lobbyId: string;
    playerId: string;
  }) => {
    const movement = state.lobbiesLive[lobbyId].playersMovement[playerId];
    if (!movement || !Object.values(movement).includes(true)) {
      return;
    }

    state.lobbiesLive[lobbyId].players = state.lobbiesLive[lobbyId].players.map(
      (player, index, playersLive) => {
        if (player.id === playerId) {
          const newPosition = calculateNewPlayerPosition({
            player,
            movement,
            allPlayers: playersLive,
          });

          return {
            ...player,
            position: newPosition,
          };
        }

        return player;
      }
    );
  };

  const chatMessage = (message: string, playerId: string) => {
    const { lobby: existingLobby } = getClientLobby(playerId);

    if (!existingLobby) {
      return;
    }

    state.lobbiesLive[existingLobby.id].chatMessages[playerId] = {
      message,
      timestamp: Date.now(),
    };
  };

  return {
    playerMoveStart,
    playerMoveEnd,
    updatePlayerPosition,
    getAll,
    getAllLive,
    get,
    getClientLobby,
    create,
    join,
    removeClientFromLobbies,
    chatMessage,
  };
};

const manager = lobbyManager();
Object.freeze(manager);

export default manager;
