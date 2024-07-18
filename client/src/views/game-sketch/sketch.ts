import p5 from "q5";
import stateMachine from "./lib/state-machine";
import uiRenderer from "./lib/renderers/ui";
import mapRenderer from "./lib/renderers/map";

const sketch = (p: p5) => {
  const { init: initState, cleanup: cleanupState, state } = stateMachine(p);

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);

    initState();
  };

  p.draw = () => {
    p.background(111, 173, 78);

    const userInterface = uiRenderer(p, state);
    const map = mapRenderer(p);
    // const sprites = spritesDrawer(p, state);

    if (state.controllablePlayer) {
      state.controllablePlayer.update();
      // state.controllablePlayer.draw();

      p.translate(
        p.width / 2 - state.controllablePlayer.properties.position.x,
        p.height / 2 - state.controllablePlayer.properties.position.y
      );
    }

    map.draw();

    state.players.forEach((player) => player.draw());
    if (state.controllablePlayer) {
      state.controllablePlayer.draw();
    }

    userInterface.draw();
    if (p.keyIsDown(p.SHIFT)) {
      userInterface.drawSpeechBubble(state.controllablePlayer, "😂");
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.remove = () => {
    cleanupState();
  };
};

export default sketch;
