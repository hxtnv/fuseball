import p5 from "p5";
import Player from "./classes/Player";
import ControllablePlayer from "./classes/ControllablePlayer";

let players: Player[] = [];
let controllablePlayer: ControllablePlayer | undefined = undefined;

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);

    controllablePlayer = new ControllablePlayer(p, {
      coordinates: {
        x: p.windowWidth / 2,
        y: p.windowHeight / 2,
      },
    });

    players.push(
      new Player(p, {
        coordinates: {
          x: p.windowWidth / 2,
          y: p.windowHeight / 2,
        },
      })
    );
  };

  p.draw = () => {
    p.background(200);

    players.forEach((player) => {
      player.draw();
    });

    if (controllablePlayer) {
      controllablePlayer.update();
      controllablePlayer.draw();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

export const cleanup = () => {};

export default sketch;
