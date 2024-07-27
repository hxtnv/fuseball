import { LobbyPlayerLive, Ball, PositionType } from "../../types/lobby";
import { State } from "../../types/state";
import PLAYER from "../const/player";
import BALL from "../const/ball";
import constrainPositionToField from "./constrain-position-to-field";

type Props = {
  player: LobbyPlayerLive;
  movement: Record<string, boolean>;
  allPlayers: LobbyPlayerLive[];
  ball: Ball;
  state: State;
  lobbyId: string;
};

const isColliding = (
  position1: PositionType,
  position2: PositionType,
  size1: number,
  size2: number
) => {
  const distance = Math.sqrt(
    Math.pow(position1.x - position2.x, 2) +
      Math.pow(position1.y - position2.y, 2)
  );

  return distance < size1 / 2 + size2 / 2;
};

const handleCollision = (
  position1: PositionType,
  position2: PositionType,
  size1: number,
  size2: number
) => {
  const collisionDirectionX = position1.x - position2.x;
  const collisionDirectionY = position1.y - position2.y;
  const collisionDistance = Math.sqrt(
    collisionDirectionX * collisionDirectionX +
      collisionDirectionY * collisionDirectionY
  );

  if (collisionDistance === 0) {
    return { adjustedPos1: position1, adjustedPos2: position2 };
  }

  const overlap = (size1 / 2 + size2 / 2 - collisionDistance) / 2;

  const adjustmentX = (collisionDirectionX / collisionDistance) * overlap;
  const adjustmentY = (collisionDirectionY / collisionDistance) * overlap;

  position1.x += adjustmentX;
  position1.y += adjustmentY;

  position2.x -= adjustmentX;
  position2.y -= adjustmentY;

  return { adjustedPos1: position1, adjustedPos2: position2 };
};

const handlePlayerCollisions = (
  newPosition: PositionType,
  player: LobbyPlayerLive,
  allPlayers: LobbyPlayerLive[]
) => {
  allPlayers.forEach((otherPlayer) => {
    if (
      otherPlayer.id !== player.id &&
      isColliding(newPosition, otherPlayer.position, PLAYER.SIZE, PLAYER.SIZE)
    ) {
      const result = handleCollision(
        newPosition,
        otherPlayer.position,
        PLAYER.SIZE,
        PLAYER.SIZE
      );
      newPosition = result.adjustedPos1;
      otherPlayer.position = result.adjustedPos2;
    }
  });

  return newPosition;
};

const calculateNewPlayerPosition = ({
  player,
  movement,
  allPlayers,
  ball,
  state,
  lobbyId,
}: Props) => {
  const prevPosition = { ...player.position };

  let newPosition = { ...player.position };

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

  newPosition = handlePlayerCollisions(newPosition, player, allPlayers);

  // Calculate player velocity
  const playerVelocity = {
    x: newPosition.x - prevPosition.x,
    y: newPosition.y - prevPosition.y,
  };

  // Ball displacement logic with added force based on player velocity
  if (isColliding(newPosition, ball.position, PLAYER.SIZE, BALL.SIZE)) {
    const kickDirectionX = ball.position.x - player.position.x;
    const kickDirectionY = ball.position.y - player.position.y;

    const kickDistance = Math.sqrt(
      kickDirectionX * kickDirectionX + kickDirectionY * kickDirectionY
    );

    // Normalize the direction
    const normalizedDirectionX = kickDirectionX / kickDistance;
    const normalizedDirectionY = kickDirectionY / kickDistance;

    // Add a velocity to the ball in the direction of the kick
    const kickStrength = Math.sqrt(
      playerVelocity.x * playerVelocity.x + playerVelocity.y * playerVelocity.y
    ); // use player velocity magnitude as the strength
    ball.velocity.x = normalizedDirectionX * kickStrength;
    ball.velocity.y = normalizedDirectionY * kickStrength;
  }

  const constrainedPosition = constrainPositionToField(newPosition, {
    state,
    player,
    lobbyId,
  });

  const constrainedBallPosition = constrainPositionToField(ball.position, {
    state,
    ball,
    lobbyId,
  });

  newPosition.x = constrainedPosition.x;
  newPosition.y = constrainedPosition.y;

  ball.position.x = constrainedBallPosition.x;
  ball.position.y = constrainedBallPosition.y;

  const didBallMove =
    ball.position.x !== ball.position.x || ball.position.y !== ball.position.y;

  return { newPosition, newBallPosition: ball.position, didBallMove };
};

export default calculateNewPlayerPosition;
