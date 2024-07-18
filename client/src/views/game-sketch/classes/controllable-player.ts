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

    this.p5.translate(
      this.p5.width / 2 - this.properties.position.x,
      this.p5.height / 2 - this.properties.position.y
    );

    // overwrite color
    this.p5.fill(255, 0, 0);
    super.draw();

    // name tag
    this.p5.fill(0);
    this.p5.textSize(16);
    this.p5.textStyle(this.p5.BOLD);

    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    this.p5.text(
      "Player",
      this.properties.position.x,
      this.properties.position.y - this.properties.size / 2 - 15
    );

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
