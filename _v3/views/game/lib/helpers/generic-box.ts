import p5 from "q5";
import renderSeparation from "./render-separation";

type Options = {
  width: number;
  height: number;
  x: number;
  y: number;
  innerWidth?: number;
};

const renderGenericBox = (
  { width, height, x, y, innerWidth = 100 }: Options,
  p: p5
) => {
  const shadowOffset = 6;
  const cornerRadius = 2;
  const innerShadowHeight = 8;

  // shadow
  renderSeparation(() => {
    p.translate(x, y);
    p.noStroke();
    p.fill(0, 0, 0, 64);
    p.rect(shadowOffset, shadowOffset, width, height, cornerRadius);

    // background layer
    p.stroke(17, 17, 17);
    p.strokeWeight(2);
    p.fill(0, 0, 0, 120);
    p.rect(0, 0, width, height, cornerRadius);

    // inner layer
    p.noStroke();
    p.fill(53, 220, 247);
    p.rect(1, 1, Math.min(width * innerWidth, width - 2), height - 2, 0);

    // inner shadow
    p.noStroke();
    p.fill(0, 0, 0, 64);
    p.rect(
      1,
      1 + (height - innerShadowHeight),
      Math.min(width * innerWidth, width - 2),
      innerShadowHeight,
      0
    );
  }, p);
};

export default renderGenericBox;
