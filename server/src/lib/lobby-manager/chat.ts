import { getClientLobby, getState, setState } from "./state";

export const chatMessage = (message: string, playerId: string) => {
  const state = getState();
  const { lobby: existingLobby } = getClientLobby(playerId);

  if (!existingLobby) {
    return;
  }

  state.lobbiesLive[existingLobby.id].chatMessages[playerId] = {
    message,
    timestamp: Date.now(),
  };

  setState(state);
};
