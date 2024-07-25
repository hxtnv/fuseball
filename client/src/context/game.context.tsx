import React, { useState, useEffect, useContext } from "react";
import emitter from "@/lib/emitter";
import getRandomPlayerSettings from "@/lib/helpers/get-random-player-settings";
import { useWebSocket } from "./websocket.context";

export type PlayerSettings = {
  name: string;
  emoji: number;
};

export type PositionType = {
  x: number;
  y: number;
};

export type ScoreType = number[];

export type LobbyPlayer = {
  id: string;
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
  chatMessages: Record<string, { message: string; timestamp: number }>;
  score: ScoreType;
  timeLeft: 0;
  ball: {
    position: PositionType;
  };
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
  playerSettings: PlayerSettings;
  setPlayerSettings: (playerSettings: PlayerSettings) => void;
  createLobby: ({ name, teamSize }: { name: string; teamSize: number }) => void;
  joinLobby: (id: string, team?: number) => void;
  playersOnline: number;
  leaveLobby: () => void;
  playerId: string | null;
};

const GameContext = React.createContext<GameContextType>({
  currentLobby: null,
  setCurrentLobby: () => {},
  lobbies: [],
  playerSettings: {
    name: "",
    emoji: 0,
  },
  setPlayerSettings: () => {},
  createLobby: () => {},
  joinLobby: () => {},
  playersOnline: 0,
  leaveLobby: () => {},
  playerId: null,
});

const GameContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { status } = useWebSocket();
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playersOnline, setPlayersOnline] = useState<number>(0);
  const [playerSettings, setPlayerSettings] = useState<PlayerSettings>(
    JSON.parse(
      window.localStorage.getItem("fuseball:player:settings") ??
        JSON.stringify(getRandomPlayerSettings())
    )
  );

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
        player: playerSettings,
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
        player: playerSettings,
      },
    });
  };

  const onUserIdReceived = ({ data: userId }: { data: string }) => {
    setPlayerId(userId);
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
      playerId,
    });
  };

  useEffect(() => {
    window.localStorage.setItem(
      "fuseball:player:settings",
      JSON.stringify(playerSettings)
    );
  }, [playerSettings]);

  useEffect(() => {
    emitter.on("ws:message:players-online", onPlayersOnline);
    emitter.on("ws:message:lobbies", onLobbiesReceived);
    emitter.on("ws:message:create-lobby-success", onLobbySuccess);
    emitter.on("ws:message:join-lobby-success", onLobbySuccess);
    emitter.on("ws:message:user-id", onUserIdReceived);
    emitter.on("ws:connected", onConnected);

    emitter.on("game:get-current-lobby", onGetCurrentLobby);

    return () => {
      emitter.off("ws:message:players-online", onPlayersOnline);
      emitter.off("ws:message:lobbies", onLobbiesReceived);
      emitter.off("ws:message:create-lobby-success", onLobbySuccess);
      emitter.off("ws:message:join-lobby-success", onLobbySuccess);
      emitter.off("ws:message:user-id", onUserIdReceived);
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
        playerSettings,
        setPlayerSettings,
        createLobby,
        currentLobby,
        setCurrentLobby,
        joinLobby,
        playersOnline,
        leaveLobby,
        playerId,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);

export default GameContextProvider;
