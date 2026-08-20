import { createContext } from "react";
import type { GameContext as GameContextType } from "@/types/game";

export const GameContext = createContext<GameContextType>({
  lobbyId: null,
  setLobbyId: () => {},
  partyId: null,
  setPartyId: () => {},
  partyType: null,
  setPartyType: () => {},
});
