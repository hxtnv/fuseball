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
  view: "lobby" | "game";
  setView: (view: "lobby" | "game") => void;
  lobbies: Lobby[];
  playerSettings: PlayerSettings;
  setPlayerSettings: (playerSettings: PlayerSettings) => void;
};

const GameContext = React.createContext<GameContextType>({
  view: "lobby",
  setView: () => {},
  lobbies: [],
  playerSettings: {
    name: "",
    emoji: 0,
  },
  setPlayerSettings: () => {},
});

const GameContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [playerSettings, setPlayerSettings] = useState<PlayerSettings>(
    JSON.parse(
      window.localStorage.getItem("fuseball:player:settings") ??
        JSON.stringify(getRandomPlayerSettings())
    )
  );
  const [view, setView] = useState<GameContextType["view"]>("lobby");
  const [lobbies, setLobbies] = useState<Lobby[]>([]);

  const onConnected = () => {
    emitter.emit("ws:send", "get-lobbies");
  };

  const onLobbiesReceived = ({ data: lobbyList }: { data: Lobby[] }) => {
    setLobbies(lobbyList.sort((a, b) => b.players.length - a.players.length));
  };

  useEffect(() => {
    window.localStorage.setItem(
      "fuseball:player:settings",
      JSON.stringify(playerSettings)
    );
  }, [playerSettings]);

  useEffect(() => {
    emitter.on("ws:message:lobbies", onLobbiesReceived);
    emitter.on("ws:connected", onConnected);

    return () => {
      emitter.off("ws:message:lobbies", onLobbiesReceived);
      emitter.off("ws:connected", onConnected);
    };
  }, []);

  return (
    <GameContext.Provider
      value={{ view, setView, lobbies, playerSettings, setPlayerSettings }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);

export default GameContextProvider;
