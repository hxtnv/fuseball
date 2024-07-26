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
  state,
  lobbyId,
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
