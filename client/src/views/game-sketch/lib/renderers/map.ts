import p5 from "q5";
import MAP from "../const/map";

const mapRenderer = (p: p5) => {
  const drawCornerArcs = () => {
    p.arc(0, 0, MAP.CORNER_ARC * 2, MAP.CORNER_ARC * 2, 0, p.HALF_PI); // corner arc (top left)
    p.arc(
      MAP.FIELD_WIDTH,
      0,
      MAP.CORNER_ARC * 2,
      MAP.CORNER_ARC * 2,
      p.HALF_PI,
      p.PI
    ); // corner arc (top right)

    p.arc(
      MAP.FIELD_WIDTH,
      MAP.FIELD_HEIGHT,
      MAP.CORNER_ARC * 2,
      MAP.CORNER_ARC * 2,
      p.PI,
      p.PI + p.HALF_PI
    ); // corner arc (bottom right)
    p.arc(
      0,
      MAP.FIELD_HEIGHT,
      MAP.CORNER_ARC * 2,
      MAP.CORNER_ARC * 2,
      p.PI + p.HALF_PI,
      p.TWO_PI - 0.0001
    ); // corner arc (bottom left)
  };

  const drawMiddleCircle = () => {
    p.circle(
      MAP.FIELD_WIDTH / 2,
      MAP.FIELD_HEIGHT / 2,
      MAP.FIELD_WIDTH * MAP.MIDDLE_CIRCLE_RATIO
    ); // middle circle big

    p.push();
    p.fill(255);
    p.circle(MAP.FIELD_WIDTH / 2, MAP.FIELD_HEIGHT / 2, MAP.CORNER_ARC); // middle circle small
    p.pop();
  };

  const drawPenaltyAreas = () => {
    const height = MAP.FIELD_HEIGHT * MAP.PENALTY_AREA_HEIGHT_RATIO;
    const width = MAP.FIELD_WIDTH * MAP.PENALTY_AREA_WIDTH_RATIO;

    // left side
    p.rect(
      0,
      MAP.FIELD_HEIGHT * ((1 - MAP.PENALTY_AREA_HEIGHT_RATIO) / 2),
      width,
      height
    );

    // right side
    p.rect(
      MAP.FIELD_WIDTH - width,
      MAP.FIELD_HEIGHT * ((1 - MAP.PENALTY_AREA_HEIGHT_RATIO) / 2),
      width,
      height
    );
  };

  // this is the part where ball is supposed to go
  const drawGoalTargets = () => {
    const height = MAP.FIELD_HEIGHT * MAP.GOAL_ZONE_HEIGHT_RATIO;
    const width = MAP.FIELD_WIDTH * MAP.GOAL_ZONE_WIDTH_RATIO;

    // left side
    p.fill(0, 0, 0, 100);
    p.rect(
      -width,
      MAP.FIELD_HEIGHT * ((1 - MAP.GOAL_ZONE_HEIGHT_RATIO) / 2),
      width,
      height
    );

    // right side
    p.rect(
      MAP.FIELD_WIDTH,
      MAP.FIELD_HEIGHT * ((1 - MAP.GOAL_ZONE_HEIGHT_RATIO) / 2),
      width,
      height
    );
  };

  const drawGoalAreas = () => {
    const height = MAP.FIELD_HEIGHT * MAP.GOAL_AREA_HEIGHT_RATIO;
    const width = MAP.FIELD_WIDTH * MAP.GOAL_AREA_WIDTH_RATIO;

    // left side
    p.rect(
      0,
      MAP.FIELD_HEIGHT * ((1 - MAP.GOAL_AREA_HEIGHT_RATIO) / 2),
      width,
      height
    );

    // right side
    p.rect(
      MAP.FIELD_WIDTH - width,
      MAP.FIELD_HEIGHT * ((1 - MAP.GOAL_AREA_HEIGHT_RATIO) / 2),
      width,
      height
    );
  };

  const drawField = () => {
    p.stroke(255);
    p.strokeWeight(5);
    p.noFill();
    p.rect(0, 0, MAP.FIELD_WIDTH, MAP.FIELD_HEIGHT);

    p.line(MAP.FIELD_WIDTH / 2, 0, MAP.FIELD_WIDTH / 2, MAP.FIELD_HEIGHT); // center line

    drawCornerArcs();
    drawMiddleCircle();
    drawPenaltyAreas();
    drawGoalAreas();
    drawGoalTargets();
  };

  const drawGrid = () => {
    p.stroke(0, 0, 0, 15);
    p.strokeWeight(3);

    // vertical grid lines
    Array.from({
      length: Math.ceil(
        (MAP.FIELD_WIDTH * 2 + MAP.FIELD_WIDTH) / MAP.GRID_SPACING
      ),
    })
      .map((_, index) => -MAP.FIELD_WIDTH + index * MAP.GRID_SPACING)
      .forEach((x) => {
        p.line(x, -MAP.FIELD_HEIGHT, x, MAP.FIELD_HEIGHT * 2);
      });

    // horizontal grid lines
    Array.from({
      length: Math.ceil(
        (MAP.FIELD_HEIGHT * 2 + MAP.FIELD_HEIGHT) / MAP.GRID_SPACING
      ),
    })
      .map((_, index) => -MAP.FIELD_HEIGHT + index * MAP.GRID_SPACING)
      .forEach((y) => {
        p.line(-MAP.FIELD_WIDTH, y, MAP.FIELD_WIDTH * 2, y);
      });
  };

  const draw = () => {
    p.push();

    drawGrid();
    drawField();

    p.pop();
  };

  return { draw };
};

export default mapRenderer;
