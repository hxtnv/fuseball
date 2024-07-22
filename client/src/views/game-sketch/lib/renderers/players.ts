import type { StateType } from "../state-machine";
import p5 from "q5";
import PLAYER from "../const/player";
import lerp from "../helpers/lerp";
import getEmoji from "@/lib/helpers/get-emoji";
import type { LobbyPlayerLive } from "@/context/game.context";

const playersRenderer = (p: p5, state: StateType) => {
  const drawPlayer = (player: LobbyPlayerLive) => {
    p.push();

    const newPosition = {
      x: lerp(
        player.previousPosition?.x ?? 0,
        player.targetPosition?.x ?? 0,
        PLAYER.LERP_AMT
      ),
      y: lerp(
        player.previousPosition?.y ?? 0,
        player.targetPosition?.y ?? 0,
        PLAYER.LERP_AMT
      ),
    };

    p.translate(newPosition.x, newPosition.y);

    // shadow
    p.noStroke();
    p.fill(0, 0, 0, 35);
    p.ellipse(0, 0, PLAYER.SIZE + PLAYER.SIZE * 0.42);

    // core
    p.stroke(51);
    p.strokeWeight(4);
    p.fill(253, 200, 118);
    p.ellipse(0, 0, PLAYER.SIZE);

    p.textSize(14);
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(255);
    p.text(getEmoji(player.emoji), 0, 0);

    p.pop();

    player.previousPosition = newPosition;
  };

  const draw = () => {
    if (!state.currentLobbyLive) return;

    state.currentLobbyLive.players.forEach(drawPlayer);
  };

  return { draw };
};

export default playersRenderer;
