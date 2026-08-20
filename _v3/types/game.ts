import type { PartyType } from "shared/types/game";

export type GameContext = {
  lobbyId: string | null;
  setLobbyId: React.Dispatch<React.SetStateAction<string | null>>;
  partyId: string | null;
  setPartyId: React.Dispatch<React.SetStateAction<string | null>>;
  partyType: PartyType | null;
  setPartyType: React.Dispatch<React.SetStateAction<PartyType | null>>;
};
