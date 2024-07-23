import type { StateType } from "./state-machine";
import emitter from "@/lib/emitter";

const KEYS_TO_DIRECTION: Record<string, string> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",

  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

const playerController = (state: StateType) => {
  const move = (type: "start" | "end", direction: string) => {
    if (!state.playerId || state.chatInputFocus) {
      return;
    }

    emitter.emit("ws:send", {
      event: type === "start" ? "player-move-start" : "player-move-end",
      data: {
        direction,
      },
    });
  };

  const onKeyDown = (key: string) => {
    if (KEYS_TO_DIRECTION[key]) {
      move("start", KEYS_TO_DIRECTION[key]);
    }
  };

  const onKeyUp = (key: string) => {
    if (KEYS_TO_DIRECTION[key]) {
      move("end", KEYS_TO_DIRECTION[key]);
    }
  };

  return {
    onKeyDown,
    onKeyUp,
  };
};

export default playerController;
