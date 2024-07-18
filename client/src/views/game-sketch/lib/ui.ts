import p5 from "q5";
import type { StateType } from "../lib/state-machine";

const userInterface = (p: p5, state: StateType) => {
  const draw = () => {
    // p.push();
    // p.translate(
    //   p.width / 2 - state.controllablePlayer.properties.position.x,
    //   p.height / 2 - state.controllablePlayer.properties.position.y
    // );
    p.push();
    p.translate(
      state.controllablePlayer.properties.position.x - p.width / 2,
      state.controllablePlayer.properties.position.y - p.height / 2
    );
    p.text(
      `Player position: ${state.controllablePlayer.properties.position.x}, ${state.controllablePlayer.properties.position.y}`,
      10,
      20
    );
    p.text(`FPS: ${Number(p.frameRate()).toFixed(0)}`, 10, 40);
    p.pop();

    // name tags
    state.players.forEach((player, key) => {
      p.textAlign(p.CENTER);
      p.text(
        `Player #${key}`,
        player.properties.position.x,
        player.properties.position.y - player.properties.size / 2 - 15
      );
    });

    // controllable player name tag
    p.push();
    p.fill(0);
    p.textSize(16);
    p.textStyle(p.BOLD);

    p.textAlign(p.CENTER);
    p.text(
      "Player",
      state.controllablePlayer.properties.position.x,
      state.controllablePlayer.properties.position.y -
        state.controllablePlayer.properties.size / 2 -
        15
    );
    p.pop();
  };

  return { draw };
};

export default userInterface;
