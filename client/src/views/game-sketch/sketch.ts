import p5 from "q5";
import stateMachine from "./lib/state-machine";
import ui from "./lib/ui";

const sketch = (p: p5) => {
  const { init: initState, cleanup: cleanupState, state } = stateMachine(p);

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);

    initState();
  };

  p.draw = () => {
    p.background(200);

    const userInterface = ui(p, state);

    if (state.controllablePlayer) {
      state.controllablePlayer.update();
      state.controllablePlayer.draw();

      // p.push();
      p.translate(
        p.width / 2 - state.controllablePlayer.properties.position.x,
        p.height / 2 - state.controllablePlayer.properties.position.y
      );
    }

    state.players.forEach((player) => {
      player.draw();
    });

    // p.pop();

    userInterface.draw();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

export default sketch;
