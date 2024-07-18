import p5 from "q5";
import type { StateType } from "../state-machine";
import { draw as drawNametag } from "../helpers/nametag";
import PLAYER from "../const/player";
import Player from "../../classes/player";

const userInterfaceRenderer = (p: p5, state: StateType) => {
  const debugLines = [
    `Player position: ${state.controllablePlayer.properties.position.x.toFixed(
      0
    )}, ${state.controllablePlayer.properties.position.y.toFixed(0)}`,
    `FPS: ${Number(p.frameRate()).toFixed(0)}`,
  ];

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
      });
    });

    drawNametag(p, {
      text: `Player`,
      position: state.controllablePlayer.properties.position,
    });
  };

  const drawDebugInfo = () => {
    debugLines.forEach((line, index) => {
      p.text(line, 10, 20 + index * 20);
    });
  };

  const drawSpeechBubble = (player: Player, text: string) => {
    p.push();
    p.textSize(16);

    const bubbleWidth = p.textWidth(text) + 40;
    const bubbleHeight = 60;

    p.translate(
      player.properties.position.x -
        PLAYER.SIZE / 2 -
        PLAYER.BUBBLE_POINTER_OFFSET / 2 +
        PLAYER.BUBBLE_POINTER_SIZE / 2,
      player.properties.position.y -
        PLAYER.SIZE / 2 -
        bubbleHeight -
        PLAYER.BUBBLE_POINTER_SIZE -
        PLAYER.NAMETAG_GAP -
        12
    );

    p.beginShape();
    p.stroke(51);
    p.strokeWeight(4);
    p.fill(255);

    // Top left corner
    p.vertex(PLAYER.BUBBLE_CORNER_RADIUS, 0);
    p.quadraticVertex(0, 0, 0, PLAYER.BUBBLE_CORNER_RADIUS);

    // Bottom left corner
    p.vertex(0, bubbleHeight - PLAYER.BUBBLE_CORNER_RADIUS);
    p.quadraticVertex(
      0,
      bubbleHeight,
      PLAYER.BUBBLE_CORNER_RADIUS,
      bubbleHeight
    );

    // Pointer bottom left
    p.vertex(
      PLAYER.BUBBLE_POINTER_OFFSET - PLAYER.BUBBLE_POINTER_SIZE,
      bubbleHeight
    );

    // Pointer tip
    p.vertex(
      PLAYER.BUBBLE_POINTER_OFFSET,
      bubbleHeight + PLAYER.BUBBLE_POINTER_SIZE
    );

    // Pointer bottom right
    p.vertex(
      PLAYER.BUBBLE_POINTER_OFFSET + PLAYER.BUBBLE_POINTER_SIZE,
      bubbleHeight
    );

    // Bottom right corner
    p.vertex(bubbleWidth - PLAYER.BUBBLE_CORNER_RADIUS, bubbleHeight);
    p.quadraticVertex(
      bubbleWidth,
      bubbleHeight,
      bubbleWidth,
      bubbleHeight - PLAYER.BUBBLE_CORNER_RADIUS
    );

    // Top right corner
    p.vertex(bubbleWidth, PLAYER.BUBBLE_CORNER_RADIUS);
    p.quadraticVertex(
      bubbleWidth,
      0,
      bubbleWidth - PLAYER.BUBBLE_CORNER_RADIUS,
      0
    );

    p.vertex(PLAYER.BUBBLE_CORNER_RADIUS, 0);
    p.endShape(p.CLOSE);

    p.translate(bubbleWidth / 2, bubbleHeight / 2);
    p.textAlign(p.CENTER, p.CENTER);

    p.text(text, 0, 0);

    p.pop();
  };

  const draw = () => {
    p.textFont("Itim");

    drawNametags();

    fixedElements(() => {
      drawDebugInfo();
    });
  };

  return { draw, drawSpeechBubble };
};

export default userInterfaceRenderer;
