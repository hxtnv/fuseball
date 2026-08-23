export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  kick: boolean;
  sprint: boolean;
}

export interface InputController {
  attach(): void;
  dispose(): void;
  get(): InputState;
  /** analog steering from a touch joystick, components -1..1 */
  setVector(x: number, y: number): void;
  /** kick button held state from touch controls */
  setKick(down: boolean): void;
  /** sprint button held state from touch controls */
  setSprint(down: boolean): void;
}

export const createInput = (): InputController => {
  const state: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    kick: false,
    sprint: false,
  };

  // touch joystick vector + kick/sprint, merged into the boolean state on read
  const touch = { x: 0, y: 0 };
  let kickHeld = false;
  let sprintHeld = false;
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
      case " ":
      case "x":
      case "X":
        state.kick = value;
        break;
      case "Shift":
        state.sprint = value;
        break;
      default:
        return;
    }
    if (e.key.startsWith("Arrow") || e.key === " ") e.preventDefault();
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
      const kick = state.kick || kickHeld;
      const sprint = state.sprint || sprintHeld;
      if (!active && kick === state.kick && sprint === state.sprint)
        return state;
      return {
        up: state.up || (active && touch.y < -DEAD),
        down: state.down || (active && touch.y > DEAD),
        left: state.left || (active && touch.x < -DEAD),
        right: state.right || (active && touch.x > DEAD),
        kick,
        sprint,
      };
    },
    setVector(x, y) {
      touch.x = x;
      touch.y = y;
    },
    setKick(down) {
      kickHeld = down;
    },
    setSprint(down) {
      sprintHeld = down;
    },
  };
};
