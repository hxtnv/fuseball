import { useState } from "react";
import { GameContext } from "./game-context";
import type { PartyType } from "shared/types/game";

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [partyId, setPartyId] = useState<string | null>(null);
  const [partyType, setPartyType] = useState<PartyType | null>(null);

  return (
    <GameContext.Provider
      value={{
        lobbyId,
        setLobbyId,
        partyId,
        setPartyId,
        partyType,
        setPartyType,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
