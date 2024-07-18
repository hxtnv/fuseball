import p5 from "q5";
import type { StateType } from "../state-machine";
import MAP from "../const/map";

const mapRenderer = (p: p5, state: StateType) => {
  const draw = () => {
    p.push();

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

    p.pop();
  };

  return { draw };
};

export default mapRenderer;
