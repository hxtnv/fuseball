import p5 from "q5";
import stateMachine from "./lib/state-machine";
import uiRenderer from "./lib/renderers/ui";
import mapRenderer from "./lib/renderers/map";
import playersRenderer from "./lib/renderers/players";
import playerController from "./lib/player-controller";
import lerp from "./lib/helpers/lerp";
import renderSeparation from "./lib/helpers/render-separation";
import PLAYER from "./lib/const/player";

const sketch = (p: p5) => {
  const {
    init: initState,
    cleanup: cleanupState,
    state,
  } = Object.freeze(stateMachine());
  let lastTimestamp = 0;

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    initState();
  };

  p.draw = () => {
    const map = mapRenderer(p);
    const players = playersRenderer(p, state);
    const userInterface = uiRenderer(p, state);

    p.background(111, 173, 78);

    renderSeparation(() => {
      state.cameraScale = lerp(
        state.cameraScale,
        state.targetCameraScale,
        PLAYER.LERP_AMT
      );

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

      p.translate(p.width / 2, p.height / 2);
      p.scale(state.cameraScale);
      p.translate(-state.cameraPosition.x, -state.cameraPosition.y);

      map.draw();

      const timestamp = performance.now();
      const deltaTime = lastTimestamp ? timestamp - lastTimestamp : 16.67; // Approximate initial value to 60fps
      lastTimestamp = timestamp;

      players.draw(deltaTime);
    }, p);

    userInterface.draw();
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
