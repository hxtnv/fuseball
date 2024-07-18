import p5 from "q5";
import Player from "./player";
import type { PlayerInitialProperties } from "./player";

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
    if (this.keyState[this.p5.LEFT_ARROW]) {
      this.properties.position.x -= 5;
    }
    if (this.keyState[this.p5.RIGHT_ARROW]) {
      this.properties.position.x += 5;
    }
    if (this.keyState[this.p5.UP_ARROW]) {
      this.properties.position.y -= 5;
    }
    if (this.keyState[this.p5.DOWN_ARROW]) {
      this.properties.position.y += 5;
    }
  }
}

export default ControllablePlayer;
