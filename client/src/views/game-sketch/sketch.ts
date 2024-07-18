import p5 from "q5";
import stateMachine from "./lib/state-machine";

const sketch = (p: p5) => {
  const { _state, players, controllablePlayer } = stateMachine(p);

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);

    _state.init();
  };

  p.draw = () => {
    p.background(200);

    if (controllablePlayer) {
      controllablePlayer.update();
      controllablePlayer.draw();

      p.text(
        `Player position: ${controllablePlayer.properties.position.x}, ${controllablePlayer.properties.position.y}`,
        10,
        20
      );

      p.translate(
        p.width / 2 - controllablePlayer.properties.position.x,
        p.height / 2 - controllablePlayer.properties.position.y
      );
    }

    players.forEach((player) => {
      player.draw();
    });
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  return {
    cleanup: _state.cleanup,
  };
};

export default sketch;
