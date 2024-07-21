import React, { useState, useEffect, useContext } from "react";
import emitter from "@/lib/emitter";
import getRandomPlayerSettings from "@/lib/helpers/get-random-player-settings";

export type PlayerSettings = {
  name: string;
  emoji: number;
};

export type LobbyPlayer = {
  id: string;
  name: string;
  emoji: number;
  team: 0 | 1;
};

export type LobbyPlayerLive = LobbyPlayer & {
  // status: "waiting" | "playing";
  position: {
    x: number;
    y: number;
  };
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

type GameContextType = {
  currentLobby: Lobby | null;
  lobbies: Lobby[];
  playerSettings: PlayerSettings;
  setPlayerSettings: (playerSettings: PlayerSettings) => void;
  createLobby: ({ name, teamSize }: { name: string; teamSize: number }) => void;
  joinLobby: (id: string, team?: 0 | 1) => void;
};

const GameContext = React.createContext<GameContextType>({
  currentLobby: null,
  lobbies: [],
  playerSettings: {
    name: "",
    emoji: 0,
  },
  setPlayerSettings: () => {},
  createLobby: () => {},
  joinLobby: () => {},
});

const GameContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerSettings, setPlayerSettings] = useState<PlayerSettings>(
    JSON.parse(
      window.localStorage.getItem("fuseball:player:settings") ??
        JSON.stringify(getRandomPlayerSettings())
    )
  );

  const onConnected = () => {
    emitter.emit("ws:send", "get-lobbies");
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

  const joinLobby = (id: string, team?: 0 | 1) => {
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
    emitter.on("ws:message:lobbies", onLobbiesReceived);
    emitter.on("ws:message:create-lobby-success", onLobbySuccess);
    emitter.on("ws:message:join-lobby-success", onLobbySuccess);
    emitter.on("ws:message:user-id", onUserIdReceived);
    emitter.on("ws:connected", onConnected);

    emitter.on("game:get-current-lobby", onGetCurrentLobby);

    return () => {
      emitter.off("ws:message:lobbies", onLobbiesReceived);
      emitter.off("ws:message:create-lobby-success", onLobbySuccess);
      emitter.off("ws:message:join-lobby-success", onLobbySuccess);
      emitter.off("ws:message:user-id", onUserIdReceived);
      emitter.off("ws:connected", onConnected);

      emitter.off("game:get-current-lobby", onGetCurrentLobby);
    };
  }, [onGetCurrentLobby]);

  return (
    <GameContext.Provider
      value={{
        lobbies,
        playerSettings,
        setPlayerSettings,
        createLobby,
        currentLobby,
        joinLobby,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);

export default GameContextProvider;
