import p5 from "q5";

type Props = {
  text: string;
  position: {
    x: number;
    y: number;
  };
  playerSize: number;
};

const draw = (p: p5, { text, position, playerSize }: Props) => {
  p.push();
  p.fill(255);
  p.stroke(51);
  p.strokeWeight(4);
  p.textSize(16);
  p.textAlign(p.CENTER);
  p.text(text, position.x, position.y - playerSize / 2 - 15);
  p.pop();
};

export { draw };
