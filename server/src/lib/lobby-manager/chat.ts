import { getClientLobby, getState, setState } from "./state";
import getInitialBallPosition from "../helpers/get-initial-ball-position";
import { PlayerData } from "../../types/player";

export const chatMessage = (message: string, playerData: PlayerData) => {
  const state = getState();
  const { lobby: existingLobby } = getClientLobby(playerData.id);

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

  console.log(
    `Player "${playerData.name}" has sent a chat message in lobby "${existingLobby.name}" saying "${message}"`
  );

  state.lobbiesLive[existingLobby.id].chatMessages[playerData.id] = {
    message,
    timestamp: Date.now(),
  };

  setState(state);
};
