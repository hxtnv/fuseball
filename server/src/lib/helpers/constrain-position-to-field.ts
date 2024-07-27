import { PositionType, LobbyPlayerLive, Ball } from "../../types/lobby";
import { State } from "../../types/state";
import PLAYER from "../const/player";
import BALL from "../const/ball";
import MAP from "../const/map";

type Props = {
  state: State;
  player?: LobbyPlayerLive;
  ball?: Ball;
  lobbyId: string;
};

const constrainPositionToField = (position: PositionType, props?: Props) => {
  const newPosition = { ...position };
  const ball = props?.ball;
  const player = props?.player;
  const isPlayer = player !== undefined;
  const isBall = ball !== undefined;

  const objectSizeHalf = isPlayer ? PLAYER.SIZE / 2 : BALL.SIZE / 2;

  // limit movement to the map + goal zones
  const goalZoneWidth = MAP.FIELD_WIDTH * MAP.GOAL_ZONE_WIDTH_RATIO;
  const goalZoneHeight = MAP.FIELD_HEIGHT * MAP.GOAL_ZONE_HEIGHT_RATIO;

  const centerY = MAP.FIELD_HEIGHT / 2;
  const goalZoneTopY = centerY - goalZoneHeight / 2;
  const goalZoneBottomY = centerY + goalZoneHeight / 2;

  // we are in the goal zone (vertically)
  if (
    newPosition.y > goalZoneTopY - objectSizeHalf &&
    newPosition.y < goalZoneBottomY + objectSizeHalf
  ) {
    const boundsLeft = -goalZoneWidth + objectSizeHalf;
    const boundsRight = MAP.FIELD_WIDTH + goalZoneWidth - objectSizeHalf;

    // we are outside the LEFT goal zone (horizontally)
    if (newPosition.x < boundsLeft) {
      newPosition.x = boundsLeft;
      if (isBall) ball.velocity.x *= -1; // Ball bounces off the wall
    }

    // we are outside the RIGHT goal zone (horizontally)
    if (newPosition.x > boundsRight) {
      newPosition.x = boundsRight;
      if (isBall) ball.velocity.x *= -1; // Ball bounces off the wall
    }

    // we are inside of the LEFT goal zone (horizontally)
    const isInsideLeftGoalZone =
      newPosition.x >= boundsLeft && newPosition.x <= 0;

    const isInsideRightGoalZone =
      newPosition.x >= MAP.FIELD_WIDTH && newPosition.x <= boundsRight;

    if (isInsideLeftGoalZone || isInsideRightGoalZone) {
      // if we go too far up
      if (newPosition.y < goalZoneTopY + objectSizeHalf) {
        newPosition.y = goalZoneTopY + objectSizeHalf;
        if (isBall) ball.velocity.y *= -1; // Ball bounces off the wall
      }

      // if we go too far down
      if (newPosition.y > goalZoneBottomY - objectSizeHalf) {
        newPosition.y = goalZoneBottomY - objectSizeHalf;
        if (isBall) ball.velocity.y *= -1; // Ball bounces off the wall
      }
    }
  } else {
    newPosition.x = Math.max(
      objectSizeHalf,
      Math.min(MAP.FIELD_WIDTH - objectSizeHalf, newPosition.x)
    );
    newPosition.y = Math.max(
      objectSizeHalf,
      Math.min(MAP.FIELD_HEIGHT - objectSizeHalf, newPosition.y)
    );

    // Ball bounces off the main field walls
    if (isBall) {
      if (
        newPosition.x === objectSizeHalf ||
        newPosition.x === MAP.FIELD_WIDTH - objectSizeHalf
      ) {
        ball.velocity.x *= -1;
      }
      if (
        newPosition.y === objectSizeHalf ||
        newPosition.y === MAP.FIELD_HEIGHT - objectSizeHalf
      ) {
        ball.velocity.y *= -1;
      }
    }
  }

  // if it's a player (e.g., not a ball)
  if (isPlayer && props?.state) {
    const { state, lobbyId } = props;
    const lobby = state.lobbiesLive[lobbyId];

    if (lobby.roundStatus === "protected") {
      if (player.team === 0) {
        if (newPosition.x > MAP.FIELD_WIDTH / 2 - objectSizeHalf) {
          newPosition.x = MAP.FIELD_WIDTH / 2 - objectSizeHalf;
        }
      } else if (player.team === 1) {
        if (newPosition.x < MAP.FIELD_WIDTH / 2 + objectSizeHalf) {
          newPosition.x = MAP.FIELD_WIDTH / 2 + objectSizeHalf;
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

        if (distanceFromCenter < middleCircleRadius + objectSizeHalf) {
          const angle = Math.atan2(dy, dx);
          newPosition.x =
            fieldCenterX +
            Math.cos(angle) * (middleCircleRadius + objectSizeHalf);
          newPosition.y =
            fieldCenterY +
            Math.sin(angle) * (middleCircleRadius + objectSizeHalf);
        }
      }
    }
  }

  return newPosition;
};

export default constrainPositionToField;
