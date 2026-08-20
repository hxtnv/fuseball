import p5 from "q5";
import PLAYER from "shared/lib/const/game-player";
import BALL from "shared/lib/const/game-ball";
import type { LobbyClientSide } from "@/views/game/hooks/use-game-canvas";
import { ParticleSystem } from "../helpers/particles";

/**
 * EntityGraphicsComponent - Handles rendering of game entities (players and ball)
 *
 * This component is responsible for drawing players and the ball on the canvas.
 * It uses the p5.js library for rendering and follows a component-based design.
 */
class EntityGraphicsComponent {
  private p: p5;

  constructor(p: p5) {
    this.p = p;
  }

  /**
   * Renders a player entity with appropriate styling
   */
  // Store active particle systems (static so persists across renders)
  static activeParticles: ParticleSystem[] = [];

  // Store dust trails for sprinting
  static dustParticles: ParticleSystem[] = [];
  // Store previous positions to estimate velocity
  static prevPositions: Record<string, { x: number; y: number }> = {};

  renderPlayers(state: LobbyClientSide): void {
    // Dust trail for sprinting players
    state.players.forEach((player) => {
      const prev = EntityGraphicsComponent.prevPositions[player.details.id];
      if (prev) {
        const dx = player.position.x - prev.x;
        const dy = player.position.y - prev.y;
        const speed = Math.sqrt(dx * dx + dy * dy);
        if (player.isSprinting && speed > 1.5) {
          // Place dust behind the player
          const angle = Math.atan2(dy, dx) + Math.PI;
          const dustX = player.position.x + Math.cos(angle) * PLAYER.SIZE * 0.5;
          const dustY = player.position.y + Math.sin(angle) * PLAYER.SIZE * 0.5;
          // Only spawn every few frames for density control
          if (Math.random() < 0.7) {
            EntityGraphicsComponent.dustParticles.push(
              new ParticleSystem(this.p, dustX, dustY, {
                type: "particle",
                color: [180, 150, 90],
              })
            );
          }
        }
      }
      // Update prev position
      EntityGraphicsComponent.prevPositions[player.details.id] = {
        ...player.position,
      };
    });

    // Update/draw dust
    EntityGraphicsComponent.dustParticles.forEach((ps) => {
      ps.update();
      ps.draw();
    });
    EntityGraphicsComponent.dustParticles =
      EntityGraphicsComponent.dustParticles.filter((ps) => ps.isAlive());

    // Collision detection and particle spawn
    // const ballPos = state.ball?.position;
    // if (ballPos) {
    //   state.players.forEach((player) => {
    //     const dx = player.position.x - ballPos.x;
    //     const dy = player.position.y - ballPos.y;
    //     const dist = Math.sqrt(dx * dx + dy * dy);
    //     // If close enough, spawn a particle effect at collision
    //     if (dist < PLAYER.SIZE * 2) {
    //       console.log("COLLISION DETECTED", {
    //         dist,
    //         player: player.position,
    //         ball: ballPos,
    //       });
    //       // Only spawn if not already one at this spot (avoid spam)
    //       const already = EntityGraphicsComponent.activeParticles.some(
    //         (ps) =>
    //           Math.abs(ps["particles"]?.[0]?.x - ballPos.x) < 4 &&
    //           Math.abs(ps["particles"]?.[0]?.y - ballPos.y) < 4
    //       );
    //       if (!already) {
    //         console.log("SPAWN PARTICLES", { x: ballPos.x, y: ballPos.y });
    //         EntityGraphicsComponent.activeParticles.push(
    //           new ParticleSystem(this.p, ballPos.x, ballPos.y, [253, 200, 118])
    //         );
    //       }
    //     }
    //   });
    // }

    // Draw players
    // Update/draw particles
    EntityGraphicsComponent.activeParticles.forEach((ps) => {
      ps.update();
      ps.draw();
    });
    // EntityGraphicsComponent.activeParticles =
    //   EntityGraphicsComponent.activeParticles.filter((ps) => ps.isAlive());

    state.players.forEach((player) => {
      this.p.push();

      if (player.isSprinting) {
        const already = EntityGraphicsComponent.activeParticles.some(
          (ps) =>
            Math.abs(ps["particles"]?.[0]?.x - player.position.x) < 4 &&
            Math.abs(ps["particles"]?.[0]?.y - player.position.y) < 4
        );
        if (!already) {
          console.log("SPAWN PARTICLES", {
            x: player.position.x,
            y: player.position.y,
          });
          EntityGraphicsComponent.activeParticles.push(
            new ParticleSystem(this.p, player.position.x, player.position.y, {
              type: "particle",
              color: [92, 72, 28],
            })
          );
        }
      }

      this.p.translate(player.position.x, player.position.y);
      // this.p.scale(state.cameraZoom);
      // shadow
      this.p.noStroke();
      this.p.fill(0, 0, 0, 35);
      this.p.ellipse(0, 0, PLAYER.SIZE + PLAYER.SIZE * 0.42);
      // core
      this.p.stroke(51);
      this.p.strokeWeight(4);
      this.p.fill(253, 200, 118);
      this.p.ellipse(0, 0, PLAYER.SIZE);
      this.p.pop();
    });
  }

  /**
   * Renders the ball entity with appropriate styling
   */
  renderBall(state: LobbyClientSide): void {
    this.p.push();

    this.p.translate(state.ball.position.x, state.ball.position.y);
    // this.p.scale(state.cameraZoom);

    // shadow
    this.p.noStroke();
    this.p.fill(0, 0, 0, 35);
    this.p.ellipse(0, 0, BALL.SIZE + BALL.SIZE * 0.42);

    // ball
    this.p.fill(255);
    this.p.stroke(51);
    this.p.strokeWeight(4);
    this.p.ellipse(0, 0, BALL.SIZE);

    this.p.pop();
  }

  /**
   * Renders all entities in the game state
   */
  render(state: LobbyClientSide): void {
    this.renderPlayers(state);
    this.renderBall(state);
  }
}

/**
 * Creates and returns an EntityGraphicsComponent
 * Factory function provided for backward compatibility
 */
const createEntityGraphicsComponent = (p: p5, state: LobbyClientSide) => {
  const component = new EntityGraphicsComponent(p);

  return {
    draw: () => component.render(state),
  };
};

export default createEntityGraphicsComponent;
