import { PING_COLORS } from "@/lib/const/game-server";

const getPingColor = (ping: number = -2): string => {
  if (ping === -2) {
    return PING_COLORS[1].color;
  } else if (ping === -1) {
    return PING_COLORS[2].color;
  }

  for (const { color, max } of PING_COLORS) {
    if (ping <= max) return color;
  }

  return PING_COLORS[2].color;
};

export default getPingColor;
