import { PositionType } from "../../types/lobby";
import MAP from "../const/map";
import BALL from "../const/ball";

const isInsideGoalZone = (position: PositionType, size: number) => {
  const goalZoneHeight = MAP.FIELD_HEIGHT * MAP.GOAL_ZONE_HEIGHT_RATIO;

  const ballSizeHalf = BALL.SIZE / 2;

  const centerY = MAP.FIELD_HEIGHT / 2;
  const goalZoneTopY = centerY - goalZoneHeight / 2;
  const goalZoneBottomY = centerY + goalZoneHeight / 2;

  const isInsideX = position.x < 0 || position.x > MAP.FIELD_WIDTH;
  const isInsideY =
    position.y > goalZoneTopY - ballSizeHalf &&
    position.y < goalZoneBottomY + ballSizeHalf;

  const isInside = isInsideX && isInsideY;

  return {
    isInside: isInside,
    whichTeamLost: isInside ? (position.x < 0 ? 0 : 1) : null,
    whichTeamWon: isInside ? (position.x < 0 ? 1 : 0) : null,
  };
};

export default isInsideGoalZone;
