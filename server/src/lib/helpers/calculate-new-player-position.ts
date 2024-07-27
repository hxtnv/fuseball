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
      const collisionDirectionX = newPosition.x - otherPlayer.position.x;
      const collisionDirectionY = newPosition.y - otherPlayer.position.y;
      const collisionDistance = Math.sqrt(
        collisionDirectionX * collisionDirectionX +
          collisionDirectionY * collisionDirectionY
      );

      const overlap =
        (PLAYER.SIZE / 2 + PLAYER.SIZE / 2 - collisionDistance) / 2;

      const adjustmentX = (collisionDirectionX / collisionDistance) * overlap;
      const adjustmentY = (collisionDirectionY / collisionDistance) * overlap;

      newPosition.x += adjustmentX;
      newPosition.y += adjustmentY;

      otherPlayer.position.x -= adjustmentX;
      otherPlayer.position.y -= adjustmentY;
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
  let newPosition = { ...player.position };
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

  newPosition = handlePlayerCollisions(newPosition, player, allPlayers);

  if (isColliding(newPosition, newBallPosition, PLAYER.SIZE, BALL.SIZE)) {
    newBallPosition.x += newPosition.x - player.position.x;
    newBallPosition.y += newPosition.y - player.position.y;
  }

  const constrainedPosition = constrainPositionToField(newPosition, {
    state,
    player,
    lobbyId,
  });
  const constrainedBallPosition = constrainPositionToField(newBallPosition);

  newPosition.x = constrainedPosition.x;
  newPosition.y = constrainedPosition.y;

  newBallPosition.x = constrainedBallPosition.x;
  newBallPosition.y = constrainedBallPosition.y;

  const didBallMove =
    newBallPosition.x !== ball.position.x ||
    newBallPosition.y !== ball.position.y;

  return { newPosition, newBallPosition, didBallMove };
};

export default calculateNewPlayerPosition;
