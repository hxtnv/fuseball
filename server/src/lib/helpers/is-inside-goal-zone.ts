import { PositionType } from "../../types/lobby";
import MAP from "../const/map";

const isInsideGoalZone = (position: PositionType, size: number) => {
  // const isInside = position.x < 0 || position.x > MAP.FIELD_WIDTH;
  const isInside = position.x < 0 || position.x > MAP.FIELD_WIDTH;

  return {
    isInside: isInside,
    whichTeamLost: isInside ? (position.x < 0 ? 0 : 1) : null,
    whichTeamWon: isInside ? (position.x < 0 ? 1 : 0) : null,
  };
};

export default isInsideGoalZone;
