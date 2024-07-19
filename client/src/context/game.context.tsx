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
};

export type Lobby = {
  id: string;
  status: "warmup" | "in-progress" | "finished";
  name: string;
  players: LobbyPlayer[];
  maxPlayers: number;
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
    ) as PlayerSettings
  );
  const [view, setView] = useState<GameContextType["view"]>("lobby");
  const [lobbies, setLobbies] = useState<Lobby[]>([
    {
      id: "1",
      status: "warmup",
      name: "Deutsche Fußball",
      players: [
        {
          id: "1",
          name: "Player 1",
          emoji: 0,
        },
      ],
      maxPlayers: 4,
      countryCode: "DE",
    },
    {
      id: "2",
      status: "warmup",
      name: "POLSKA PRZEJMUJE TEN SERWER",
      players: [
        {
          id: "1",
          name: "Player 1",
          emoji: 5,
        },
        {
          id: "1",
          name: "Player 1",
          emoji: 7,
        },
      ],
      maxPlayers: 4,
      countryCode: "PL",
    },
  ]);

  const onLobbiesReceived = (lobbyList: Lobby[]) => {
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

    emitter.emit("ws:send", "lobbies");

    return () => {
      emitter.off("ws:message:lobbies", onLobbiesReceived);
    };
  }, [onLobbiesReceived]);

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
