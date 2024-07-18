import p5 from "q5";

export type PlayerInitialProperties = {
  position: {
    x: number;
    y: number;
  };
  size: number;
};

class Player {
  p5: p5;
  properties: PlayerInitialProperties;

  constructor(p5: p5, properties: PlayerInitialProperties) {
    this.p5 = p5;
    this.properties = properties;
  }

  draw() {
    this.p5.ellipse(
      this.properties.position.x,
      this.properties.position.y,
      50,
      50
    );
  }
}

export default Player;
