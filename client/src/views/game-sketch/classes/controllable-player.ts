import p5 from "q5";
import Player from "./player";
import type { PlayerInitialProperties } from "./player";
import MAP from "../lib/const/map";
import PLAYER from "../lib/const/player";

class ControllablePlayer extends Player {
  keyState: { [key: number]: boolean };

  constructor(p5: p5, properties: PlayerInitialProperties) {
    super(p5, properties);

    this.keyState = {};

    this.p5.keyPressed = this.keyPressed.bind(this);
    this.p5.keyReleased = this.keyReleased.bind(this);
  }

  keyPressed() {
    this.keyState[this.p5.keyCode] = true;
  }

  keyReleased() {
    this.keyState[this.p5.keyCode] = false;
  }

  draw() {
    this.p5.push();
    this.p5.fill(255, 0, 0);
    super.draw();
    this.p5.pop();
  }

  update() {
    const newPosition = { ...this.properties.position };

    if (this.keyState[this.p5.LEFT_ARROW]) {
      newPosition.x -= PLAYER.SPEED;
    }
    if (this.keyState[this.p5.RIGHT_ARROW]) {
      newPosition.x += PLAYER.SPEED;
    }
    if (this.keyState[this.p5.UP_ARROW]) {
      newPosition.y -= PLAYER.SPEED;
    }
    if (this.keyState[this.p5.DOWN_ARROW]) {
      newPosition.y += PLAYER.SPEED;
    }

    this.properties.position = {
      x: Math.min(
        MAP.FIELD_WIDTH - PLAYER.SIZE / 2,
        Math.max(PLAYER.SIZE / 2, newPosition.x)
      ),
      y: Math.min(
        MAP.FIELD_HEIGHT - PLAYER.SIZE / 2,
        Math.max(PLAYER.SIZE / 2, newPosition.y)
      ),
    };
  }
}

export default ControllablePlayer;
