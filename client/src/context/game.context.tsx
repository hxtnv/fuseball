import React, { useState, useEffect, useContext } from "react";
import emitter from "@/lib/emitter";
import { useWebSocket } from "./websocket.context";

export type PositionType = {
  x: number;
  y: number;
};

export type ScoreType = number[];

export type LobbyPlayer = {
  id: number;
  name: string;
  emoji: number;
  team: number;
};

export type LobbyPlayerLive = LobbyPlayer & {
  // status: "waiting" | "playing";
  position: PositionType;
  targetPosition: PositionType;
  previousPosition: PositionType;
};

export type Lobby = {
  id: string;
  status: "warmup" | "in-progress" | "finished";
  name: string;
  players: LobbyPlayer[];
  teamSize: number;
  countryCode: string;
  score: ScoreType;
};

export type LobbyLive = {
  id: string;
  status: "warmup" | "in-progress" | "finished";
  name: string;
  players: LobbyPlayerLive[];
  chatMessages: Record<number, { message: string; timestamp: number }>;
  score: ScoreType;
  timeLeft: 0;
  ball: {
    position: PositionType;
  };
  timeSinceRoundStart: number;
  roundStatus: "protected" | "live";
  startingTeam: number;
};

export type LobbyMeta = {
  id: string;
  name: string;
  teamSize: number;
  countryCode: string;
};

type GameContextType = {
  currentLobby: Lobby | null;
  setCurrentLobby: (lobby: Lobby | null) => void;
  lobbies: Lobby[];
  createLobby: ({ name, teamSize }: { name: string; teamSize: number }) => void;
  joinLobby: (id: string, team?: number) => void;
  playersOnline: number;
  leaveLobby: () => void;
};

const GameContext = React.createContext<GameContextType>({
  currentLobby: null,
  setCurrentLobby: () => {},
  lobbies: [],
  createLobby: () => {},
  joinLobby: () => {},
  playersOnline: 0,
  leaveLobby: () => {},
});

const GameContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { status, playerData } = useWebSocket();
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null);
  const [playersOnline, setPlayersOnline] = useState<number>(0);

  const onConnected = () => {
    emitter.emit("ws:send", "get-lobbies");
  };

  const leaveLobby = () => {
    emitter.emit("ws:send", {
      event: "leave-lobby",
    });

    setCurrentLobby(null);
  };

  const createLobby = ({
    name,
    teamSize,
  }: {
    name: string;
    teamSize: number;
  }) => {
    emitter.emit("ws:send", {
      event: "create-lobby",
      data: {
        name,
        teamSize,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });
  };

  const joinLobby = (id: string, team?: number) => {
    emitter.emit("ws:send", {
      event: "join-lobby",
      data: {
        id,
        team,
      },
    });
  };

  const onLobbiesReceived = ({ data: lobbyList }: { data: Lobby[] }) => {
    setLobbies(lobbyList.sort((a, b) => b.players.length - a.players.length));
  };

  const onLobbySuccess = ({ data: lobby }: { data: Lobby }) => {
    setCurrentLobby(lobby);
  };

  const onPlayersOnline = ({ data: playersOnline }: { data: number }) => {
    setPlayersOnline(playersOnline);
  };

  const onGetCurrentLobby = () => {
    emitter.emit("game:current-lobby-meta", {
      data: {
        ...currentLobby,
        players: undefined,
        score: undefined,
        status: undefined,
      },
      playerData,
    });
  };

  useEffect(() => {
    emitter.on("ws:message:players-online", onPlayersOnline);
    emitter.on("ws:message:lobbies", onLobbiesReceived);
    emitter.on("ws:message:create-lobby-success", onLobbySuccess);
    emitter.on("ws:message:join-lobby-success", onLobbySuccess);
    emitter.on("ws:connected", onConnected);

    emitter.on("game:get-current-lobby", onGetCurrentLobby);

    return () => {
      emitter.off("ws:message:players-online", onPlayersOnline);
      emitter.off("ws:message:lobbies", onLobbiesReceived);
      emitter.off("ws:message:create-lobby-success", onLobbySuccess);
      emitter.off("ws:message:join-lobby-success", onLobbySuccess);
      emitter.off("ws:connected", onConnected);

      emitter.off("game:get-current-lobby", onGetCurrentLobby);
    };
  }, [onGetCurrentLobby]);

  useEffect(() => {
    if (status !== "connected" && currentLobby) {
      emitter.emit("game:disconnected");
      setCurrentLobby(null);
    }
  }, [currentLobby, status]);

  return (
    <GameContext.Provider
      value={{
        lobbies,
        createLobby,
        currentLobby,
        setCurrentLobby,
        joinLobby,
        playersOnline,
        leaveLobby,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);

export default GameContextProvider;
