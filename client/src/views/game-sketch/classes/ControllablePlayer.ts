import p5 from "p5";
import Player from "./Player";
import type { PlayerInitialProperties } from "./Player";

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

  update() {
    if (this.keyState[this.p5.LEFT_ARROW]) {
      this.properties.coordinates.x -= 5;
    }
    if (this.keyState[this.p5.RIGHT_ARROW]) {
      this.properties.coordinates.x += 5;
    }
    if (this.keyState[this.p5.UP_ARROW]) {
      this.properties.coordinates.y -= 5;
    }
    if (this.keyState[this.p5.DOWN_ARROW]) {
      this.properties.coordinates.y += 5;
    }
  }
}

export default ControllablePlayer;
