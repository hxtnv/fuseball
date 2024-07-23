import { LobbyPlayerLive, Ball, PositionType } from "../lobby-manager"; // Make sure to add Ball type if it doesn't exist
import PLAYER from "../const/player";
import BALL from "../const/ball";
import MAP from "../const/map";
import constrainPositionToField from "./constrain-position-to-field";

type Props = {
  player: LobbyPlayerLive;
  movement: Record<string, boolean>;
  allPlayers: LobbyPlayerLive[];
  ball: Ball; // Add ball to the Props
};

// Helper function to check collision between player and ball
const isColliding = (
  playerPosition: PositionType,
  ballPosition: PositionType
) => {
  const distance = Math.sqrt(
    Math.pow(playerPosition.x - ballPosition.x, 2) +
      Math.pow(playerPosition.y - ballPosition.y, 2)
  );

  return distance < PLAYER.SIZE / 2 + BALL.SIZE / 2;
};

const calculateNewPlayerPosition = ({
  player,
  movement,
  allPlayers,
  ball,
}: Props) => {
  const newPosition = { ...player.position };
  const newBallPosition = { ...ball.position };

  if (movement.up) {
    newPosition.y -= PLAYER.SPEED;
  }

  if (movement.down) {
    newPosition.y += PLAYER.SPEED;
  }

  if (movement.left) {
    newPosition.x -= PLAYER.SPEED;
  }

  if (movement.right) {
    newPosition.x += PLAYER.SPEED;
  }

  // Ball displacement logic
  if (isColliding(newPosition, newBallPosition)) {
    newBallPosition.x += newPosition.x - player.position.x;
    newBallPosition.y += newPosition.y - player.position.y;
  }

  const constrainedPosition = constrainPositionToField(newPosition);
  const constrainedBallPosition = constrainPositionToField(newBallPosition);

  newPosition.x = constrainedPosition.x;
  newPosition.y = constrainedPosition.y;

  newBallPosition.x = constrainedBallPosition.x;
  newBallPosition.y = constrainedBallPosition.y;

  return { newPosition, newBallPosition };
};

export default calculateNewPlayerPosition;
