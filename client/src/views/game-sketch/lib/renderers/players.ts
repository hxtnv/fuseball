import type { StateType } from "../state-machine";
import p5 from "q5";
import PLAYER from "../const/player";
import getEmoji from "@/lib/helpers/get-emoji";
import type { LobbyPlayerLive } from "@/context/game.context";

const playersRenderer = (p: p5, state: StateType) => {
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
  const draw = () => {
    if (!state.currentLobbyLive) return;

    state.currentLobbyLive.players.forEach(drawPlayer);
  };

  return { draw };
};

export default playersRenderer;
