import p5 from "p5";

export type PlayerInitialProperties = {
  coordinates: {
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
    this.p5.ellipse(
      this.properties.coordinates.x,
      this.properties.coordinates.y,
      50,
      50
    );
  }
}

export default Player;
