import React, { useState, useEffect, useContext } from "react";
import emitter from "@/lib/emitter";

type GameContextType = {
  view: "lobby" | "game";
  setView: (view: "lobby" | "game") => void;
  lobbies: Lobby[];
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

const GameContext = React.createContext<GameContextType>({
  view: "lobby",
  setView: () => {},
  lobbies: [],
});

const GameContextProvider = ({ children }: { children: React.ReactNode }) => {
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
      id: "1",
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
    emitter.on("ws:message:lobbies", onLobbiesReceived);

    emitter.emit("ws:send", "lobbies");

    return () => {
      emitter.off("ws:message:lobbies", onLobbiesReceived);
    };
  }, [onLobbiesReceived]);

  return (
    <GameContext.Provider value={{ view, setView, lobbies }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);

export default GameContextProvider;
