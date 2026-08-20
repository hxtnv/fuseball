import { LobbyLive } from "../../../types/lobby";
import lobbyManager from "../";
import { Ball } from "../../../types/lobby";

const applyFriction = (ball: Ball, friction: number) => {
  ball.velocity.x *= friction;
  ball.velocity.y *= friction;
};

const updatePlayerPositions = (lobby: LobbyLive) => {
  lobby.players.forEach((player) => {
    lobbyManager.updatePlayerPosition({
      lobbyId: lobby.id,
      playerId: player.id,
    });
  });

  // Update ball position using its velocity
  const ball = lobby.ball;
  ball.position.x += ball.velocity.x;
  ball.position.y += ball.velocity.y;

  // Apply friction to slow down the ball
  const friction = 0.95;
  applyFriction(ball, friction);
};

export default updatePlayerPositions;
