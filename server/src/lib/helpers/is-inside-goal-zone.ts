import { PositionType } from "../lobby-manager";
import PLAYER from "../const/player";
import MAP from "../const/map";

const isInsideGoalZone = (position: PositionType) => {
  const goalZoneWidth = MAP.FIELD_WIDTH * MAP.GOAL_ZONE_WIDTH_RATIO;
  const goalZoneHeight = MAP.FIELD_HEIGHT * MAP.GOAL_ZONE_HEIGHT_RATIO;

  const centerY = MAP.FIELD_HEIGHT / 2;
  const goalZoneTopY = centerY - goalZoneHeight / 2;
  const goalZoneBottomY = centerY + goalZoneHeight / 2;

  const isInsideX = position.x < 0 || position.x > MAP.FIELD_WIDTH;
  const isInsideY = position.y < goalZoneTopY && position.y > goalZoneBottomY;

  const isInside = isInsideX && isInsideY;

  return {
    isInside: isInsideX,
    whichTeam: isInsideX ? (position.x < 0 ? 0 : 1) : null,
  };
  /*
  const newPosition = { ...position };

  // limit movement to the map + goal zones
  const goalZoneWidth = MAP.FIELD_WIDTH * MAP.GOAL_ZONE_WIDTH_RATIO;
  const goalZoneHeight = MAP.FIELD_HEIGHT * MAP.GOAL_ZONE_HEIGHT_RATIO;

  const centerY = MAP.FIELD_HEIGHT / 2;
  const goalZoneTopY = centerY - goalZoneHeight / 2;
  const goalZoneBottomY = centerY + goalZoneHeight / 2;

  const playerSizeHalf = PLAYER.SIZE / 2;

  // we are in the goal zone (vertically)
  if (
    newPosition.y > goalZoneTopY &&
    newPosition.y < goalZoneBottomY
  ) {
    const boundsLeft = -goalZoneWidth + playerSizeHalf;
    const boundsRight = MAP.FIELD_WIDTH + goalZoneWidth - playerSizeHalf;

    // we are inside of the LEFT goal zone (horizontally)
    const isInsideLeftGoalZone =
      newPosition.x >= boundsLeft && newPosition.x <= 0;

    const isInsideRightGoalZone =
      newPosition.x >= MAP.FIELD_WIDTH && newPosition.x <= boundsRight;

    if (isInsideLeftGoalZone || isInsideRightGoalZone) {
      // if we go too far up
      if (newPosition.y < goalZoneTopY + playerSizeHalf) {
        newPosition.y = goalZoneTopY + playerSizeHalf;
      }

      // if we go too far down
      if (newPosition.y > goalZoneBottomY - playerSizeHalf) {
        newPosition.y = goalZoneBottomY - playerSizeHalf;
      }
    }
  } else {
    newPosition.x = Math.max(
      PLAYER.SIZE / 2,
      Math.min(MAP.FIELD_WIDTH - PLAYER.SIZE / 2, newPosition.x)
    );
    newPosition.y = Math.max(
      PLAYER.SIZE / 2,
      Math.min(MAP.FIELD_HEIGHT - PLAYER.SIZE / 2, newPosition.y)
    );
  }

  return newPosition;
  */
};

export default isInsideGoalZone;
