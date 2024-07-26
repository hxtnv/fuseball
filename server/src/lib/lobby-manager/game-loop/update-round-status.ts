import WebSocket from "ws";
import { LobbyLive } from "../../../types/lobby";

const updateRoundStatus = (lobby: LobbyLive, wss: WebSocket.Server) => {
  lobby.timeSinceRoundStart += 1;

  if (lobby.roundStatus === "protected" && lobby.timeSinceRoundStart > 5) {
    lobby.roundStatus = "live";
  }
};

export default updateRoundStatus;
