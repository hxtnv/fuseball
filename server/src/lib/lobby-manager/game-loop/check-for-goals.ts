import WebSocket from "ws";
import { LobbyLive } from "../../../types/lobby";
import lobbyManager from "../";
import isInsideGoalZone from "../../helpers/is-inside-goal-zone";
import BALL from "../../const/ball";
import { broadcast } from "../../utils";

const updateChatMsgs = (lobby: LobbyLive, wss: WebSocket.Server) => {
  // check ball position to adjust score
  const { isInside, whichTeamLost, whichTeamWon } = isInsideGoalZone(
    lobby.ball.position,
    BALL.SIZE
  );

  if (isInside && typeof whichTeamWon === "number") {
    lobbyManager.registerBallHit(lobby.id, whichTeamWon, () => {
      // broadcast(wss, "lobbies", lobbyManager.getAll());

      broadcast(
        wss,
        "lobby-live-goal",
        {
          whichTeam: whichTeamWon,
        },
        lobby.players.map((player) => player.id)
      );
    });
  }
};

export default updateChatMsgs;
