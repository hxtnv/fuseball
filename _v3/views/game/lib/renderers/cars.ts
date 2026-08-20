import p5 from "q5";
import type { Lobby } from "shared/types/game";
import roadSettings from "../const/road";
import renderSeparation from "../helpers/render-separation";
import GAME_MAP from "shared/lib/const/game-map";
// import GAME_PLAYER from "shared/lib/const/game-player";

// Car types with different colors and dimensions
const carTypes = [
  { color: [255, 0, 0] }, // Red car
  { color: [255, 0, 255] }, // Purple car
  { color: [0, 0, 255] }, // Blue car
  { color: [0, 255, 0] }, // Green car
  { color: [0, 255, 255] }, // Cyan car
  { color: [255, 165, 0] }, // Orange car
];

let carImage: p5.Image | null = null;
const dimensions = { x: 160, y: 160 * 0.50735294117 };

export class CarsGraphicsComponent {
  private p: p5;

  constructor(p: p5) {
    this.p = p;

    if (!carImage) {
      carImage = p.loadImage("/src/assets/car.png");
    }
  }

  /**
   * Draws all cars on the road
   */
  drawCars(state: Lobby, position: "top" | "bottom") {
    renderSeparation(() => {
      if (position === "bottom") {
        this.p.translate(
          0,
          GAME_MAP.FIELD_HEIGHT +
            roadSettings.distanceFromField +
            roadSettings.height +
            roadSettings.sidewalkHeight +
            roadSettings.sidewalkHeight +
            roadSettings.bushSize
        );
      }

      state.extras.cars.forEach((car) => {
        this.p.push();
        const carTypeDetails = carTypes[car.type] ?? carTypes[0];

        const y =
          car.direction === "right"
            ? -roadSettings.distanceFromField - roadSettings.height / 4
            : -roadSettings.distanceFromField -
              roadSettings.height +
              roadSettings.height / 4;

        this.p.translate(car.position, y - dimensions.y / 2);

        if (car.direction === "right") {
          this.p.scale(-1, 1);
        }

        // car image
        this.p.stroke(50);
        this.p.strokeWeight(3);
        this.p.fill(carTypeDetails.color);
        // this.p.rect(0, 0, dimensions.x, dimensions.y, 5);
        this.p.image(carImage, 0, 0, dimensions.x, dimensions.y);

        this.p.pop();
      });
    }, this.p);
  }

  // drawNpcs(state: Lobby) {
  //   renderSeparation(() => {
  //     state.extras.npcs.forEach((npc) => {
  //       const y =
  //         npc.direction === "right"
  //           ? -roadSettings.distanceFromField - roadSettings.height / 4
  //           : -roadSettings.distanceFromField -
  //             roadSettings.height +
  //             roadSettings.height / 4;

  //       this.p.push();
  //       this.p.translate(npc.position, y - dimensions.y / 2);

  //       // npc

  //       this.p.noStroke();
  //       this.p.fill(0, 0, 0, 35);
  //       this.p.ellipse(
  //         0,
  //         roadSettings.height / 2,
  //         GAME_PLAYER.SIZE + GAME_PLAYER.SIZE * 0.42
  //       );

  //       // core
  //       this.p.stroke(51);
  //       this.p.strokeWeight(4);
  //       this.p.fill(253, 200, 118);
  //       this.p.ellipse(0, roadSettings.height / 2, GAME_PLAYER.SIZE);

  //       this.p.pop();
  //     });
  //   }, this.p);
  // }

  draw(state: Lobby) {
    this.drawCars(state, "top");
    this.drawCars(state, "bottom");

    // this.drawNpcs(state);
  }
}

const createCarsGraphicsComponent = (p: p5, state: Lobby) => {
  const component = new CarsGraphicsComponent(p);

  return {
    draw: () => component.draw(state),
  };
};

export default createCarsGraphicsComponent;
