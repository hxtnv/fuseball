import Player from "../../classes/player";
import type { StateType } from "../state-machine";
import p5 from "q5";

const playersRenderer = (p: p5, state: StateType) => {
  const followPlayer = (player: Player) => {
    p.translate(
      player.properties.position.x - p.width / 2,
      player.properties.position.y - p.height / 2
    );
  };

  const draw = () => {
    state.players.forEach((player) => player.draw());

    if (state.controllablePlayer) {
      state.controllablePlayer.draw();
    }
    // p.push();

    // p.pop();
  };

  return { draw, followPlayer };
};

export default playersRenderer;
