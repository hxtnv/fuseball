import p5 from "q5";
import MAP from "../const/map";

const mapRenderer = (p: p5) => {
  const drawField = () => {
    p.stroke(255);
    p.strokeWeight(6);
    p.noFill();
    p.rect(0, 0, MAP.FIELD_WIDTH, MAP.FIELD_HEIGHT);

    p.line(MAP.FIELD_WIDTH / 2, 0, MAP.FIELD_WIDTH / 2, MAP.FIELD_HEIGHT); // center line

    p.circle(
      MAP.FIELD_WIDTH / 2,
      MAP.FIELD_HEIGHT / 2,
      MAP.FIELD_WIDTH * MAP.MIDDLE_CIRCLE_RATIO
    ); // middle circle big

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

    p.fill(255);
    p.circle(MAP.FIELD_WIDTH / 2, MAP.FIELD_HEIGHT / 2, MAP.CORNER_ARC); // middle circle small
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
