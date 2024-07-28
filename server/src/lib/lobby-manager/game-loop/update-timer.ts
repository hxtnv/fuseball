import WebSocket from "ws";
import { LobbyLive } from "../../../types/lobby";
import { updateStatus } from "../utility";

const updateTimer = (lobby: LobbyLive, wss: WebSocket.Server) => {
  if (lobby.status === "in-progress") {
    lobby.timeLeft -= 1;

    if (lobby.timeLeft <= 0) {
      updateStatus(lobby.id, {
        status: "finished",
      });
    }
  }
};

export default updateTimer;
