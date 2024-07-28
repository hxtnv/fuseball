import WebSocket from "ws";
import { LobbyLive } from "../../../types/lobby";
import GAME from "../../const/game";

const updateRoundStatus = (lobby: LobbyLive, wss: WebSocket.Server) => {
  lobby.timeSinceRoundStart += 1;

  if (
    lobby.roundStatus === "protected" &&
    lobby.timeSinceRoundStart > GAME.ROUND_START_TIMEOUT
  ) {
    lobby.roundStatus = "live";
  }
};

export default updateRoundStatus;
