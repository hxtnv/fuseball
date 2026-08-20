import p5 from "q5";
import MAP from "shared/lib/const/game-map";
import renderSeparation from "../helpers/render-separation";

let logoImage: p5.Image | null = null;

class MapGraphicsComponent {
  private p: p5;
  // private logo: p5.Image;

  constructor(p: p5) {
    this.p = p;
    // this.logo = this.p.loadImage("/src/assets/test.png");
  }

  drawCornerArcs() {
    this.p.arc(0, 0, MAP.CORNER_ARC * 2, MAP.CORNER_ARC * 2, 0, this.p.HALF_PI); // corner arc (top left)
    this.p.arc(
      MAP.FIELD_WIDTH,
      0,
      MAP.CORNER_ARC * 2,
      MAP.CORNER_ARC * 2,
      this.p.HALF_PI,
      this.p.PI
    ); // corner arc (top right)

    this.p.arc(
      MAP.FIELD_WIDTH,
      MAP.FIELD_HEIGHT,
      MAP.CORNER_ARC * 2,
      MAP.CORNER_ARC * 2,
      this.p.PI,
      this.p.PI + this.p.HALF_PI
    ); // corner arc (bottom right)
    this.p.arc(
      0,
      MAP.FIELD_HEIGHT,
      MAP.CORNER_ARC * 2,
      MAP.CORNER_ARC * 2,
      this.p.PI + this.p.HALF_PI,
      this.p.TWO_PI - 0.0001
    ); // corner arc (bottom left)
  }

  drawMiddleCircle() {
    this.p.circle(
      MAP.FIELD_WIDTH / 2,
      MAP.FIELD_HEIGHT / 2,
      MAP.FIELD_WIDTH * MAP.MIDDLE_CIRCLE_RATIO
    ); // middle circle big

    this.p.push();
    this.p.fill(255);
    this.p.circle(MAP.FIELD_WIDTH / 2, MAP.FIELD_HEIGHT / 2, MAP.CORNER_ARC); // middle circle small
    this.p.pop();
  }

  drawPenaltyAreas() {
    const height = MAP.FIELD_HEIGHT * MAP.PENALTY_AREA_HEIGHT_RATIO;
    const width = MAP.FIELD_WIDTH * MAP.PENALTY_AREA_WIDTH_RATIO;

    // left side
    this.p.rect(
      0,
      MAP.FIELD_HEIGHT * ((1 - MAP.PENALTY_AREA_HEIGHT_RATIO) / 2),
      width,
      height,
      0,
      MAP.FIELD_INNER_CORNER_RADIUS,
      MAP.FIELD_INNER_CORNER_RADIUS,
      0
    );

    // right side
    this.p.rect(
      MAP.FIELD_WIDTH - width,
      MAP.FIELD_HEIGHT * ((1 - MAP.PENALTY_AREA_HEIGHT_RATIO) / 2),
      width,
      height,
      MAP.FIELD_INNER_CORNER_RADIUS,
      0,
      0,
      MAP.FIELD_INNER_CORNER_RADIUS
    );
  }

  drawGoalAreas() {
    const height = MAP.FIELD_HEIGHT * MAP.GOAL_AREA_HEIGHT_RATIO;
    const width = MAP.FIELD_WIDTH * MAP.GOAL_AREA_WIDTH_RATIO;

    // left side
    this.p.rect(
      0,
      MAP.FIELD_HEIGHT * ((1 - MAP.GOAL_AREA_HEIGHT_RATIO) / 2),
      width,
      height,
      0,
      MAP.FIELD_INNER_CORNER_RADIUS,
      MAP.FIELD_INNER_CORNER_RADIUS,
      0
    );

    // right side
    this.p.rect(
      MAP.FIELD_WIDTH - width,
      MAP.FIELD_HEIGHT * ((1 - MAP.GOAL_AREA_HEIGHT_RATIO) / 2),
      width,
      height,
      MAP.FIELD_INNER_CORNER_RADIUS,
      0,
      0,
      MAP.FIELD_INNER_CORNER_RADIUS
    );
  }

  drawField() {
    // p.shearX(0.05);
    // p.shearY(0.05);
    this.p.stroke(255);
    this.p.strokeWeight(5);
    this.p.noFill();
    this.p.rect(
      0,
      0,
      MAP.FIELD_WIDTH,
      MAP.FIELD_HEIGHT,
      MAP.FIELD_OUTER_CORNER_RADIUS
    );

    this.p.line(MAP.FIELD_WIDTH / 2, 0, MAP.FIELD_WIDTH / 2, MAP.FIELD_HEIGHT); // center line

    this.drawCornerArcs();
    this.drawMiddleCircle();
    this.drawPenaltyAreas();
    this.drawGoalAreas();
    // this.drawGoalTargets();
  }

  drawGrid() {
    this.p.stroke(0, 0, 0, 15);
    this.p.strokeWeight(3);
    // this.p.noStroke();
    this.p.fill(0, 15);

    // vertical grid lines
    // Array.from({
    //   length: Math.ceil(
    //     (MAP.FIELD_WIDTH * 2 + MAP.FIELD_WIDTH) / MAP.GRID_SPACING
    //   ),
    // })
    //   .map((_, index) => -MAP.FIELD_WIDTH + index * MAP.GRID_SPACING)
    //   .forEach((x) => {
    //     this.p.line(x, -MAP.FIELD_HEIGHT, x, MAP.FIELD_HEIGHT * 2);
    //   });

    // // horizontal grid lines
    // Array.from({
    //   length: Math.ceil(
    //     (MAP.FIELD_HEIGHT * 2 + MAP.FIELD_HEIGHT) / MAP.GRID_SPACING
    //   ),
    // })
    //   .map((_, index) => -MAP.FIELD_HEIGHT + index * MAP.GRID_SPACING)
    //   .forEach((y) => {
    //     this.p.line(-MAP.FIELD_WIDTH, y, MAP.FIELD_WIDTH * 2, y);
    //   });

    // new
    Array.from(
      {
        length: Math.ceil(
          (MAP.FIELD_WIDTH * 2 + MAP.FIELD_WIDTH) / MAP.GRID_SPACING
        ),
      },
      (_, index) => {
        // if (index % 2 !== 0) {
        //   return;
        // }

        this.p.rect(
          -MAP.FIELD_WIDTH +
            index * 2 * MAP.GRID_SPACING +
            MAP.GRID_SPACING / 2, // x
          -MAP.FIELD_HEIGHT, // y
          MAP.GRID_SPACING, // width
          MAP.FIELD_HEIGHT * 3 // height
        );
      }
    );
  }

  draw() {
    if (!logoImage) {
      logoImage = this.p.loadImage("/src/assets/test.png");
    }

    renderSeparation(() => {
      this.p.drawingContext.shadowOffsetX = 0;
      this.p.drawingContext.shadowOffsetY = 0;
      this.p.drawingContext.shadowBlur = 20;
      // p.drawingContext.shadowSpread = 10;
      this.p.drawingContext.shadowColor = "rgba(17,17,17, 0.3)";

      this.drawGrid();
      this.drawField();
    }, this.p);

    // if (logoImage) {
    //   this.p.image(logoImage, -((2000 - MAP.FIELD_WIDTH) / 2), -480, 2000, 480);
    // }
  }
}

const createMapGraphicsComponent = (p: p5) => {
  const component = new MapGraphicsComponent(p);

  return {
    draw: () => component.draw(),
  };
};

export default createMapGraphicsComponent;
