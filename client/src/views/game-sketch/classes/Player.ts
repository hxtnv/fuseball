import p5 from "q5";
import PLAYER from "../lib/const/player";
import getEmoji from "@/lib/helpers/get-emoji";

export type PlayerInitialProperties = {
  id: string;
  name: string;
  emoji: number;
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

    this.p5.translate(this.properties.position.x, this.properties.position.y);

    // shadow
    this.p5.noStroke();
    this.p5.fill(0, 0, 0, 35);
    this.p5.ellipse(0, 0, PLAYER.SIZE + PLAYER.SIZE * 0.42);

    // core
    this.p5.stroke(51);
    this.p5.strokeWeight(4);
    this.p5.fill(253, 200, 118);
    this.p5.ellipse(0, 0, PLAYER.SIZE);

    this.p5.textSize(14);
    this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
    this.p5.fill(255);
    this.p5.text(getEmoji(this.properties.emoji), 0, 0);

    // this.p5.noFill();
    // this.p5.rect(-100, -100, 200, 200);

    this.p5.pop();
  }
}

export default Player;
