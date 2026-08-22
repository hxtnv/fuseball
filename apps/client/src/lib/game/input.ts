export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface InputController {
  attach(): void;
  dispose(): void;
  get(): InputState;
}

export const createInput = (): InputController => {
  const state: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  const apply = (e: KeyboardEvent, value: boolean): void => {
    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        state.up = value;
        break;
      case "ArrowDown":
      case "s":
      case "S":
        state.down = value;
        break;
      case "ArrowLeft":
      case "a":
      case "A":
        state.left = value;
        break;
      case "ArrowRight":
      case "d":
      case "D":
        state.right = value;
        break;
      default:
        return;
    }
    if (e.key.startsWith("Arrow")) e.preventDefault();
  };

  const onDown = (e: KeyboardEvent): void => apply(e, true);
  const onUp = (e: KeyboardEvent): void => apply(e, false);

  return {
    attach() {
      window.addEventListener("keydown", onDown);
      window.addEventListener("keyup", onUp);
    },
    dispose() {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    },
    get() {
      return state;
    },
  };
};
