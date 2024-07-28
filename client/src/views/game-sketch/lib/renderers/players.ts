import type { StateType } from "../state-machine";
import p5 from "q5";
import PLAYER from "../const/player";
import lerp from "../helpers/lerp";
import getEmoji from "@/lib/helpers/get-emoji";
import type { LobbyPlayerLive } from "@/context/game.context";
import BALL from "../const/ball";

const playersRenderer = (p: p5, state: StateType) => {
  const drawPlayer = (player: LobbyPlayerLive, deltaTime: number) => {
    p.push();

    const lerpAmt = 1 - Math.pow(1 - PLAYER.LERP_AMT, deltaTime / 16.67); // Normalize to 60fps

    const newPosition = {
      x: lerp(
        player.previousPosition?.x ?? player.position.x,
        player.targetPosition?.x ?? player.position.x,
        lerpAmt
      ),
      y: lerp(
        player.previousPosition?.y ?? player.position.y,
        player.targetPosition?.y ?? player.position.y,
        lerpAmt
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

    // Update previousPosition to the last drawn position for next frame interpolation
    player.previousPosition = newPosition;
  };

  const drawBall = () => {
    if (!state.currentLobbyLive) return;

    p.push();

    p.translate(
      state.currentLobbyLive.ball.position.x,
      state.currentLobbyLive.ball.position.y
    );

    // shadow
    p.noStroke();
    p.fill(0, 0, 0, 35);
    p.ellipse(0, 0, BALL.SIZE + BALL.SIZE * 0.42);

    p.fill(255);
    p.stroke(51);
    p.strokeWeight(4);

    p.ellipse(0, 0, BALL.SIZE);

    p.pop();
  };

  const draw = (deltaTime: number) => {
    if (!state.currentLobbyLive) return;

    state.currentLobbyLive.players.forEach((player) =>
      drawPlayer(player, deltaTime)
    );

    drawBall();
  };

  return { draw };
};

export default playersRenderer;
