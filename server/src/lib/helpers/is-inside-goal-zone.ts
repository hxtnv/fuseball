import { PositionType } from "../lobby-manager";
import MAP from "../const/map";

const isInsideGoalZone = (position: PositionType, size: number) => {
  // const isInside = position.x < 0 || position.x > MAP.FIELD_WIDTH;
  const isInside =
    position.x < size / 4 || position.x > MAP.FIELD_WIDTH - size / 4;

  return {
    isInside: isInside,
    whichTeam: isInside ? (position.x < 0 ? 0 : 1) : null,
  };
};

export default isInsideGoalZone;
