import WebSocket from "ws";
import { LobbyLive } from "../../../types/lobby";
import lobbyManager from "../";
import { updateStatus } from "../utility";
import { broadcast } from "../../utils";

const updateTimer = (lobby: LobbyLive, wss: WebSocket.Server) => {
  if (lobby.status === "in-progress") {
    lobby.timeLeft -= 1;

    if (lobby.timeLeft <= 0) {
      updateStatus(lobby.id, {
        status: "finished",
      });

      // broadcast(wss, "lobbies", lobbyManager.getAll());
    }
  }
};

export default updateTimer;
