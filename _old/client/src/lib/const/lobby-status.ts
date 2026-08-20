import { Lobby } from "@/context/game.context";

const LOBBY_STATUS: Record<
  Lobby["status"],
  {
    text: string;
    color: string;
  }
> = {
  warmup: {
    text: "Warmup",
    color: "#6ae72c",
  },
  "in-progress": {
    text: "In progress",
    color: "#e7a62c",
  },
  finished: {
    text: "Finished",
    color: "#f31f1f",
  },
};

export default LOBBY_STATUS;
