import p5 from "q5";
import stateMachine from "./lib/state-machine";
import uiRenderer from "./lib/renderers/ui";
import mapRenderer from "./lib/renderers/map";
import playersRenderer from "./lib/renderers/players";

const sketch = (p: p5) => {
  const {
    init: initState,
    cleanup: cleanupState,
    state,
  } = Object.freeze(stateMachine(p));

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);

    initState();
  };

  p.draw = () => {
    p.background(111, 173, 78);

    const userInterface = uiRenderer(p, state);
    const map = mapRenderer(p);
    const players = playersRenderer(p, state);

    if (state.controllablePlayer) {
      state.controllablePlayer.update();
    }

    if (state.followingPlayer) {
      userInterface.followPlayer(state.followingPlayer);
    }

    map.draw();
    players.draw();
    userInterface.draw();

    // if (state.controllablePlayer) {
    //   if (p.keyIsDown(p.SHIFT)) {
    //     userInterface.drawSpeechBubble(state.controllablePlayer, "😂");
    //   }
    // }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.remove = () => {
    cleanupState();
  };
};

export default sketch;
