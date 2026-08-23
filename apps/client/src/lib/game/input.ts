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
  /** analog steering from a touch joystick, components -1..1 */
  setVector(x: number, y: number): void;
}

export const createInput = (): InputController => {
  const state: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  // touch joystick vector, merged into the boolean state on read
  const touch = { x: 0, y: 0 };
  const DEAD = 0.3;

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
      const active = Math.abs(touch.x) > DEAD || Math.abs(touch.y) > DEAD;
      if (!active) return state;
      return {
        up: state.up || touch.y < -DEAD,
        down: state.down || touch.y > DEAD,
        left: state.left || touch.x < -DEAD,
        right: state.right || touch.x > DEAD,
      };
    },
    setVector(x, y) {
      touch.x = x;
      touch.y = y;
    },
  };
};
