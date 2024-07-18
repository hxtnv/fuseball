import p5 from "q5";
import PLAYER from "../const/player";

type Props = {
  text: string;
  position: {
    x: number;
    y: number;
  };
};

const draw = (p: p5, { text, position }: Props) => {
  p.push();

  p.fill(255);
  p.stroke(51);
  p.strokeWeight(4);
  p.textSize(16);
  p.textAlign(p.CENTER, p.CENTER);

  p.text(text, position.x, position.y - PLAYER.SIZE / 2 - PLAYER.NAMETAG_GAP);

  p.pop();
};

export { draw };
