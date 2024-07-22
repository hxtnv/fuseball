import type { StateType } from "../state-machine";
import p5 from "q5";
import PLAYER from "../const/player";
import lerp from "../helpers/lerp";
import getEmoji from "@/lib/helpers/get-emoji";
import type { LobbyPlayerLive } from "@/context/game.context";

const playersRenderer = (p: p5, state: StateType) => {
  /*
  const drawPlayer = (player: LobbyPlayerLive) => {
    p.push();

    p.translate(player.position.x, player.position.y);

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

    // p.noFill();
    // p.rect(-100, -100, 200, 200);

    p.pop();
  };
  */

  const drawPlayer = (player: LobbyPlayerLive) => {
    p.push();

    // const lerpedX = lerp(
    //   player.previousPosition.x,
    //   player.targetPosition.x,
    //   0.1
    // );
    // const lerpedY = lerp(
    //   player.previousPosition.y,
    //   player.targetPosition.y,
    //   0.1
    // );

    const newPosition = {
      x: lerp(
        player.previousPosition.x,
        player.targetPosition.x,
        PLAYER.LERP_AMT
      ),
      y: lerp(
        player.previousPosition.y,
        player.targetPosition.y,
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

    // Update the actual position to the interpolated position
    player.previousPosition = newPosition;
  };

  const draw = () => {
    if (!state.currentLobbyLive) return;

    state.currentLobbyLive.players.forEach(drawPlayer);
  };

  return { draw };
};

export default playersRenderer;
