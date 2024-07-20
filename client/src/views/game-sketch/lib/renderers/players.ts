import type { StateType } from "../state-machine";
import p5 from "q5";

// @ts-ignore
const playersRenderer = (p: p5, state: StateType) => {
  const draw = () => {
    [...state.players, state.controllablePlayer].forEach((player) =>
      player?.draw()
    );
  };

  return { draw };
};

export default playersRenderer;
