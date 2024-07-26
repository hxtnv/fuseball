import { PositionType, LobbyPlayerLive } from "../../types/lobby";
import { State } from "../../types/state";
import PLAYER from "../const/player";
import MAP from "../const/map";

type Props = {
  state: State;
  player: LobbyPlayerLive;
  lobbyId: string;
};

const constrainPositionToField = (position: PositionType, props?: Props) => {
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
    newPosition.y > goalZoneTopY - playerSizeHalf &&
    newPosition.y < goalZoneBottomY + playerSizeHalf
  ) {
    const boundsLeft = -goalZoneWidth + playerSizeHalf;
    const boundsRight = MAP.FIELD_WIDTH + goalZoneWidth - playerSizeHalf;

    // we are outside the LEFT goal zone (horizontally)
    if (newPosition.x < boundsLeft) {
      newPosition.x = boundsLeft;
    }

    // we are outside the RIGHT goal zone (horizontally)
    if (newPosition.x > boundsRight) {
      newPosition.x = boundsRight;
    }

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

  // if its a player (e.g not a ball)
  if (props?.state && props?.player) {
    const { state, player, lobbyId } = props;
    const lobby = state.lobbiesLive[lobbyId];

    if (lobby.roundStatus === "protected") {
      if (player.team === 0) {
        if (newPosition.x > MAP.FIELD_WIDTH / 2 - PLAYER.SIZE / 2) {
          newPosition.x = MAP.FIELD_WIDTH / 2 - PLAYER.SIZE / 2;
        }
      } else if (player.team === 1) {
        if (newPosition.x < MAP.FIELD_WIDTH / 2 + PLAYER.SIZE / 2) {
          newPosition.x = MAP.FIELD_WIDTH / 2 + PLAYER.SIZE / 2;
        }
      }

      if (player.team !== lobby.startingTeam) {
        // do not allow players to move inside the middle circle
        const fieldCenterX = MAP.FIELD_WIDTH / 2;
        const fieldCenterY = MAP.FIELD_HEIGHT / 2;
        const middleCircleRadius =
          (MAP.FIELD_WIDTH * MAP.MIDDLE_CIRCLE_RATIO) / 2;

        const dx = newPosition.x - fieldCenterX;
        const dy = newPosition.y - fieldCenterY;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

        if (distanceFromCenter < middleCircleRadius + playerSizeHalf) {
          const angle = Math.atan2(dy, dx);
          newPosition.x =
            fieldCenterX +
            Math.cos(angle) * (middleCircleRadius + playerSizeHalf);
          newPosition.y =
            fieldCenterY +
            Math.sin(angle) * (middleCircleRadius + playerSizeHalf);
        }
      }
    }
  }

  return newPosition;
};

export default constrainPositionToField;
