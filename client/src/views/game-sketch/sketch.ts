import p5 from "q5";
import stateMachine from "./lib/state-machine";
import uiRenderer from "./lib/renderers/ui";
import mapRenderer from "./lib/renderers/map";
import playersRenderer from "./lib/renderers/players";
import playerController from "./lib/player-controller";

const sketch = (p: p5) => {
  const {
    init: initState,
    cleanup: cleanupState,
    state,
  } = Object.freeze(stateMachine());

  const lerp = (start: number, end: number, amt: number) => {
    return (1 - amt) * start + amt * end;
  };

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    initState();
  };

  p.draw = () => {
    p.background(111, 173, 78);

    // Interpolate camera position
    state.cameraPosition.x = lerp(
      state.cameraPosition.x,
      state.targetCameraPosition.x,
      0.1
    );
    state.cameraPosition.y = lerp(
      state.cameraPosition.y,
      state.targetCameraPosition.y,
      0.1
    );

    p.push();
    if (state.followingPlayer) {
      // Translate to camera position smoothly
      p.translate(
        p.width / 2 - state.cameraPosition.x,
        p.height / 2 - state.cameraPosition.y
      );
    }

    const userInterface = uiRenderer(p, state);
    const map = mapRenderer(p);
    const players = playersRenderer(p, state);

    map.draw();
    players.draw();
    userInterface.draw();

    if (state.followingPlayer) {
      userInterface.followPlayer(state.followingPlayer);
    }

    p.pop();

    // if (state.controllablePlayer) {
    //   if (p.keyIsDown(p.SHIFT)) {
    //     userInterface.drawSpeechBubble(state.controllablePlayer, "😂");
    //   }
    // }
  };

  p.keyPressed = () => {
    playerController(state).onKeyDown(p.key);
  };

  p.keyReleased = () => {
    playerController(state).onKeyUp(p.key);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.remove = () => {
    cleanupState();
  };
};

export default sketch;
