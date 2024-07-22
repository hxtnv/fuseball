import p5 from "q5";

import stateMachine from "./lib/state-machine";

import uiRenderer from "./lib/renderers/ui";
import mapRenderer from "./lib/renderers/map";
import playersRenderer from "./lib/renderers/players";
import playerController from "./lib/player-controller";

import lerp from "./lib/helpers/lerp";
import PLAYER from "./lib/const/player";

const sketch = (p: p5) => {
  const {
    init: initState,
    cleanup: cleanupState,
    state,
  } = Object.freeze(stateMachine());

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);

    initState();
  };

  p.draw = () => {
    p.background(111, 173, 78);

    // interpolate camera position
    state.cameraPosition = {
      x: lerp(
        state.cameraPosition.x,
        state.targetCameraPosition.x,
        PLAYER.LERP_AMT
      ),
      y: lerp(
        state.cameraPosition.y,
        state.targetCameraPosition.y,
        PLAYER.LERP_AMT
      ),
    };

    p.translate(
      p.width / 2 - state.cameraPosition.x,
      p.height / 2 - state.cameraPosition.y
    );

    const userInterface = uiRenderer(p, state);
    const map = mapRenderer(p);
    const players = playersRenderer(p, state);

    map.draw();
    players.draw();
    userInterface.draw();

    // if (state.followingPlayer) {
    //   userInterface.followPlayer(state.followingPlayer);
    // }

    // if (state.followingPlayer) {
    //   if (p.keyIsDown(p.SHIFT)) {
    //     userInterface.drawSpeechBubble(state.followingPlayer, "😂");
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
