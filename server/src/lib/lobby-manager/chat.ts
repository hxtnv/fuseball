import { getClientLobby, getState, setState } from "./state";
import getInitialBallPosition from "../helpers/get-initial-ball-position";

export const chatMessage = (message: string, playerId: string) => {
  const state = getState();
  const { lobby: existingLobby } = getClientLobby(playerId);

  if (!existingLobby) {
    return;
  }

  // todo: remove this
  if (message === "/resetball") {
    state.lobbiesLive[existingLobby.id].ball = {
      position: getInitialBallPosition(),
      velocity: { x: 0, y: 0 },
    };

    return;
  }

  state.lobbiesLive[existingLobby.id].chatMessages[playerId] = {
    message,
    timestamp: Date.now(),
  };

  setState(state);
};
