import p5 from "q5";
import type { StateType } from "../state-machine";
import { draw as drawNametag } from "../helpers/nametag";

const userInterfaceRenderer = (p: p5, state: StateType) => {
  const fixedElements = (drawCall: () => void) => {
    p.push();
    p.translate(
      state.controllablePlayer.properties.position.x - p.width / 2,
      state.controllablePlayer.properties.position.y - p.height / 2
    );
    drawCall();
    p.pop();
  };
  const drawNametags = () => {
    state.players.forEach((player, key) => {
      drawNametag(p, {
        text: `Player #${key}`,
        position: player.properties.position,
        playerSize: player.properties.size,
      });
    });

    drawNametag(p, {
      text: `Player`,
      position: state.controllablePlayer.properties.position,
      playerSize: state.controllablePlayer.properties.size,
    });
  };

  const drawDebugInfo = () => {
    p.text(
      `Player position: ${state.controllablePlayer.properties.position.x.toFixed(
        0
      )}, ${state.controllablePlayer.properties.position.y.toFixed(0)}`,
      10,
      20
    );
    p.text(`FPS: ${Number(p.frameRate()).toFixed(0)}`, 10, 40);
  };

  const draw = () => {
    p.textFont("Itim");

    fixedElements(() => {
      drawDebugInfo();
    });

    drawNametags();
  };

  return { draw };
};

export default userInterfaceRenderer;
