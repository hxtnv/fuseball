import p5 from "q5";
import drawGenericGrid from "../helpers/generic-grid";
import GAME_MAP from "shared/lib/const/game-map";
import GAME_PLAYER from "shared/lib/const/game-player";
import Entity from "../entity";
import renderSeparation from "../helpers/render-separation";
import roadSettings from "../const/road";
import type { Lobby } from "shared/types/game";

const randomOffsets = Array.from({ length: 100 }, () => Math.random());

type DrawStreetPosition = "top" | "bottom";

const dimensions = { x: 160, y: 160 * 0.50735294117 };

const bushPositions = [
  [-131, 172],
  [-241, 342],
  [-116, 52],
  [-256, 27],
  [-221, 122],
  [-326, 202],
  [-416, 102],
  [-366, 12],
  [-491, 17],
  [-526, 147],
  [-471, 292],
  [-356, 317],
  [-331, 452],
  [-216, 502],
  [-131, 607],
  [-51, 687],
  [-191, 717],
  [-231, 627],
  [-356, 712],
  [-436, 632],
  [-366, 557],
  [-441, 482],
  [-411, 387],
  [-526, 387],
  [-581, 302],
  [-651, 197],
  [-641, 107],
  [-621, 2],
  [-696, 307],
  [-571, 502],
  [-486, 757],
  [-541, 647],
  [-1056, 27],
  [-931, 57],
  [-811, 32],
  [-751, 137],
  [-886, 172],
  [-996, 212],
  [-1011, 117],
  [-891, 307],
  [-766, 257],
  [-681, 467],
  [-671, 587],
  [-616, 727],
  [-736, 762],
  [-761, 687],
  [-826, 567],
  [-791, 462],
  [-806, 372],
  [-911, 442],
  [-1001, 382],
  [-1041, 302],
  [-1041, 497],
  [-956, 547],
  [-1026, 657],
  [-901, 667],
  [-856, 742],
  [-971, 732],
  [-951, -32],
];

// const getRandomBushes = (count: number = 50) => {
//   return Array.from({ length: count }, () => ({
//     x:
//       Math.random() * -GAME_MAP.FIELD_WIDTH -
//       GAME_MAP.FIELD_WIDTH * GAME_MAP.GOAL_AREA_WIDTH_RATIO,
//     y: Math.random() * GAME_MAP.FIELD_HEIGHT,
//     size: roadSettings.bushSize,
//   }));
// };

// const randomBushes = getRandomBushes();

class ExtrasGraphicsComponent {
  private p: p5;

  constructor(p: p5) {
    this.p = p;
  }

  drawBushes(position: DrawStreetPosition) {
    const spaceBetween = 40;

    const entity = new Entity(this.p);

    renderSeparation(() => {
      if (position === "bottom") {
        this.p.translate(
          0,
          GAME_MAP.FIELD_HEIGHT +
            roadSettings.distanceFromField / 2 +
            roadSettings.bushSize / 2
        );
      }

      for (let i = 0; i < 40; i++) {
        entity.drawBush(
          -GAME_MAP.FIELD_WIDTH + i * (spaceBetween + roadSettings.bushSize),
          -(roadSettings.distanceFromField / 2) - (randomOffsets[i] * 10 - 5),
          roadSettings.bushSize
        );
      }
    }, this.p);
  }

  drawGoalNets() {
    const height = GAME_MAP.FIELD_HEIGHT * GAME_MAP.GOAL_ZONE_HEIGHT_RATIO;
    const width = GAME_MAP.FIELD_WIDTH * GAME_MAP.GOAL_ZONE_WIDTH_RATIO;

    // goal net left
    drawGenericGrid(
      this.p,
      -width + 3,
      GAME_MAP.FIELD_HEIGHT * ((1 - GAME_MAP.GOAL_ZONE_HEIGHT_RATIO) / 2) + 3,
      width - 6,
      height - 6,
      {
        gridCountX: 6,
        gridCountY: 9,
        strokeColor: this.p.color(255, 255, 255, 180),
        strokeWeightVal: 3,
      }
    );

    // goal net right
    drawGenericGrid(
      this.p,
      GAME_MAP.FIELD_WIDTH + 3,
      GAME_MAP.FIELD_HEIGHT * ((1 - GAME_MAP.GOAL_ZONE_HEIGHT_RATIO) / 2) + 3,
      width - 6,
      height - 6,
      {
        gridCountX: 6,
        gridCountY: 9,
        strokeColor: this.p.color(255, 255, 255, 180),
        strokeWeightVal: 3,
      }
    );
  }

  // this is the part where ball is supposed to go
  drawGoalTargets() {
    const height = GAME_MAP.FIELD_HEIGHT * GAME_MAP.GOAL_ZONE_HEIGHT_RATIO;
    const width = GAME_MAP.FIELD_WIDTH * GAME_MAP.GOAL_ZONE_WIDTH_RATIO;

    // left side
    renderSeparation(() => {
      this.p.stroke(255);
      this.p.strokeWeight(5);
      this.p.fill(0, 75);
      this.p.rect(
        -width,
        GAME_MAP.FIELD_HEIGHT * ((1 - GAME_MAP.GOAL_ZONE_HEIGHT_RATIO) / 2),
        width,
        height,
        GAME_MAP.FIELD_INNER_CORNER_RADIUS,
        0,
        0,
        GAME_MAP.FIELD_INNER_CORNER_RADIUS
      );

      // right side
      this.p.rect(
        GAME_MAP.FIELD_WIDTH,
        GAME_MAP.FIELD_HEIGHT * ((1 - GAME_MAP.GOAL_ZONE_HEIGHT_RATIO) / 2),
        width,
        height,
        0,
        GAME_MAP.FIELD_INNER_CORNER_RADIUS,
        GAME_MAP.FIELD_INNER_CORNER_RADIUS,
        0
      );
    }, this.p);
  }

  drawRoad(position: DrawStreetPosition) {
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

      this.p.noStroke();
      this.p.fill(77, 91, 103);
      this.p.strokeWeight(6);
      this.p.rect(
        -GAME_MAP.FIELD_WIDTH,
        -roadSettings.distanceFromField - roadSettings.height,
        GAME_MAP.FIELD_WIDTH * 3,
        roadSettings.height,
        0
      );

      // top sidewalk
      this.p.stroke(51, 51, 51);
      this.p.fill(185, 181, 195);
      this.p.strokeWeight(4);
      this.p.rect(
        -GAME_MAP.FIELD_WIDTH,
        -roadSettings.distanceFromField -
          roadSettings.height -
          roadSettings.sidewalkHeight,
        GAME_MAP.FIELD_WIDTH * 3,
        roadSettings.sidewalkHeight,
        0
      );

      // bottom sidewalk
      this.p.rect(
        -GAME_MAP.FIELD_WIDTH,
        -roadSettings.distanceFromField,
        GAME_MAP.FIELD_WIDTH * 3,
        roadSettings.sidewalkHeight,
        0
      );

      // sidewalk gaps
      this.p.noStroke();
      this.p.stroke(162, 159, 171);
      this.p.strokeWeight(2);

      for (let i = 0; i < 60; i += 1) {
        // bottom sidewalk
        this.p.line(
          -GAME_MAP.FIELD_WIDTH + roadSettings.lineWidth * i,
          -roadSettings.distanceFromField + 3,
          -GAME_MAP.FIELD_WIDTH + roadSettings.lineWidth * i,
          -roadSettings.distanceFromField + roadSettings.sidewalkHeight - 3
        );

        // top sidewalk
        this.p.line(
          -GAME_MAP.FIELD_WIDTH + roadSettings.lineWidth * i,
          -roadSettings.distanceFromField - roadSettings.height - 3,
          -GAME_MAP.FIELD_WIDTH + roadSettings.lineWidth * i,
          -roadSettings.distanceFromField -
            roadSettings.height -
            roadSettings.sidewalkHeight +
            3
        );
      }

      // road lines
      this.p.noStroke();
      this.p.fill(255, 254, 19);
      for (let i = 0; i < 50; i += 2) {
        this.p.rect(
          -GAME_MAP.FIELD_WIDTH + roadSettings.lineWidth * i,
          -roadSettings.distanceFromField - roadSettings.height / 2,
          roadSettings.lineWidth,
          10
        );
      }
    }, this.p);
  }

  drawBenches(position: DrawStreetPosition) {
    const dimensions = { x: 120, y: 40 };
    const trashCanSize = 30;
    const lampPostSize = { x: 20, y: 40 };
    const lampPostLightSize = 100;

    if (position === "bottom") {
      this.p.translate(
        0,
        GAME_MAP.FIELD_HEIGHT +
          roadSettings.distanceFromField +
          roadSettings.sidewalkHeight / 2 +
          roadSettings.bushSize
      );
    }

    for (let i = 0; i < 160; i += 20) {
      this.p.push();

      this.p.translate(
        -GAME_MAP.FIELD_WIDTH + i * 24,
        -roadSettings.distanceFromField +
          roadSettings.sidewalkHeight / 2 +
          dimensions.y / 2
      );

      if (position === "bottom") {
        this.p.scale(1, -1);
      }

      // bench
      this.p.fill(139, 69, 19);
      this.p.stroke(51);
      this.p.strokeWeight(3);
      this.p.rect(0, 0, dimensions.x, dimensions.y, 5);

      // bench lines
      this.p.strokeWeight(2);
      this.p.stroke(112, 56, 16);
      this.p.line(2, dimensions.y / 3, dimensions.x - 2, dimensions.y / 3);
      this.p.line(
        2,
        dimensions.y - dimensions.y / 3,
        dimensions.x - 2,
        dimensions.y - dimensions.y / 3
      );

      // trash can
      this.p.stroke(51);
      this.p.strokeWeight(3);
      this.p.fill(100);
      this.p.ellipse(
        dimensions.x + trashCanSize,
        dimensions.y / 2,
        trashCanSize
      );

      // lamp post
      // light
      renderSeparation(() => {
        this.p.drawingContext.shadowOffsetX = 0;
        this.p.drawingContext.shadowOffsetY = 0;
        this.p.drawingContext.shadowBlur = 50;
        // p.drawingContext.shadowSpread = 10;
        this.p.drawingContext.shadowColor = "rgba(255, 251, 0, 0.9)";
        this.p.noStroke();
        this.p.noFill();
        this.p.fill(255, 245, 61, 60);
        this.p.ellipse(
          -lampPostSize.x,
          dimensions.y / 2 - lampPostSize.y,
          lampPostLightSize
        );
      }, this.p);

      // base
      this.p.stroke(51);
      this.p.strokeWeight(3);
      this.p.fill(150);
      this.p.ellipse(-lampPostSize.x, dimensions.y / 2, lampPostSize.x);
      this.p.rect(
        0 - lampPostSize.x - lampPostSize.x / 4,
        dimensions.y / 2 - lampPostSize.y,
        lampPostSize.x / 2,
        lampPostSize.y,
        3
      );

      this.p.pop();
    }
  }

  drawFullRoad(position: DrawStreetPosition, state: Lobby) {
    renderSeparation(() => {
      this.p.drawingContext.shadowOffsetX = 0;
      this.p.drawingContext.shadowOffsetY = 0;
      this.p.drawingContext.shadowBlur = 20;
      // p.drawingContext.shadowSpread = 10;
      this.p.drawingContext.shadowColor = "rgba(17,17,17, 0.3)";

      this.drawRoad(position);
      this.drawNpcs(position, state);
      this.drawBenches(position);
    }, this.p);

    this.drawBushes(position);
  }

  drawNpcs(position: DrawStreetPosition, state: Lobby) {
    renderSeparation(() => {
      if (position === "bottom") {
        this.p.translate(
          0,
          GAME_MAP.FIELD_HEIGHT +
            roadSettings.distanceFromField +
            roadSettings.sidewalkHeight / 2 +
            roadSettings.bushSize +
            60 // todo: this shouldnt be hardcoded but idk wat it should be
        );
      }

      state.extras.npcs.forEach((npc) => {
        const y = -roadSettings.distanceFromField - roadSettings.height / 4;

        this.p.push();
        this.p.translate(npc.position, y - dimensions.y / 2);

        // npc

        this.p.noStroke();
        this.p.fill(0, 0, 0, 35);
        this.p.ellipse(
          0,
          roadSettings.height / 2,
          GAME_PLAYER.SIZE + GAME_PLAYER.SIZE * 0.42
        );

        // core
        this.p.stroke(51);
        this.p.strokeWeight(4);
        this.p.fill(253, 200, 118);
        this.p.ellipse(0, roadSettings.height / 2, GAME_PLAYER.SIZE);

        this.p.pop();
      });
    }, this.p);
  }

  drawSideBushes(side: "left" | "right") {
    renderSeparation(() => {
      if (side === "right") {
        this.p.translate(GAME_MAP.FIELD_WIDTH, 0);
        this.p.scale(-1, 1);
      }
      bushPositions.forEach((bush) => {
        const entity = new Entity(this.p);
        entity.drawBush(bush[0], bush[1], 70);
      });
    }, this.p);
  }

  draw(state: Lobby) {
    renderSeparation(() => {
      this.p.drawingContext.shadowOffsetX = 0;
      this.p.drawingContext.shadowOffsetY = 0;
      this.p.drawingContext.shadowBlur = 20;
      // p.drawingContext.shadowSpread = 10;
      this.p.drawingContext.shadowColor = "rgba(17,17,17, 0.3)";

      this.drawGoalTargets();
    }, this.p);

    this.drawGoalNets();
    this.drawFullRoad("top", state);
    this.drawFullRoad("bottom", state);

    // this.drawSideBushes("left");
    // this.drawSideBushes("right");

    if (this.p.frameRate() < 59) {
      console.log(`Framerate dropped to: ${Math.floor(this.p.frameRate())}`);
    }
  }
}

const createExtrasGraphicsComponent = (p: p5, state: Lobby) => {
  const component = new ExtrasGraphicsComponent(p);

  return {
    draw: () => component.draw(state),
  };
};

export default createExtrasGraphicsComponent;
