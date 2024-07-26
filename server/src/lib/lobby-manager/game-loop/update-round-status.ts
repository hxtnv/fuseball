import WebSocket from "ws";
import { LobbyLive } from "../../../types/lobby";
import lobbyManager from "../";
import isInsideGoalZone from "../../helpers/is-inside-goal-zone";
import BALL from "../../const/ball";
import { broadcast } from "../../utils";

const updateRoundStatus = (lobby: LobbyLive, wss: WebSocket.Server) => {
  lobby.timeSinceRoundStart += 1;

  if (lobby.roundStatus === "protected" && lobby.timeSinceRoundStart > 5) {
    lobby.roundStatus = "live";
  }
};

export default updateRoundStatus;
