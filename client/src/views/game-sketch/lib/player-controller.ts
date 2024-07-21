import type { StateType } from "./state-machine";
import emitter from "@/lib/emitter";

const KEYS_TO_DIRECTION: Record<string, string> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

const playerController = (state: StateType) => {
  const move = (type: "start" | "end", key: string) => {
    if (!state.playerId || !KEYS_TO_DIRECTION[key]) {
      return;
    }

    const direction = KEYS_TO_DIRECTION[key];

    emitter.emit("ws:send", {
      event: type === "start" ? "player-move-start" : "player-move-end",
      data: {
        id: state.playerId,
        direction,
      },
    });
  };

  const onKeyDown = (key: string) => {
    move("start", key);
  };

  const onKeyUp = (key: string) => {
    move("end", key);
  };

  return {
    onKeyDown,
    onKeyUp,
  };
};

export default playerController;
