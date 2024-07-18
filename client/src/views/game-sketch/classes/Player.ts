import p5 from "q5";
import PLAYER from "../lib/const/player";

export type PlayerInitialProperties = {
  position: {
    x: number;
    y: number;
  };
};

class Player {
  p5: p5;
  properties: PlayerInitialProperties;

  constructor(p5: p5, properties: PlayerInitialProperties) {
    this.p5 = p5;
    this.properties = properties;
  }

  draw() {
    this.p5.push();

    // shadow
    this.p5.noStroke();
    this.p5.fill(0, 0, 0, 35);
    this.p5.ellipse(
      this.properties.position.x,
      this.properties.position.y,
      PLAYER.SIZE + PLAYER.SIZE * 0.42
    );

    // core
    this.p5.stroke(51);
    this.p5.strokeWeight(4);
    this.p5.fill(253, 200, 118);
    this.p5.ellipse(
      this.properties.position.x,
      this.properties.position.y,
      PLAYER.SIZE
    );

    this.p5.pop();
  }
}

export default Player;
