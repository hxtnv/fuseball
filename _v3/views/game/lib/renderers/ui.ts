import p5 from "q5";
import PLAYER from "shared/lib/const/game-player";
// import lerp from "../helpers/lerp";
// import LOBBY_STATUS from "shared/lib/const/lobby-status";
// import META from "shared/lib/const/meta";
import renderSeparation from "../helpers/render-separation";
// import { LobbyPlayerLive } from "@/context/game.context";
// import secondsToMinutesAndSeconds from "@/lib/helpers/seconds-to-minutes";
// import MAP from "../const/map";
import GAME from "shared/lib/const/game";
import GAME_PLAYER from "shared/lib/const/game-player";
// import TEAM_NAMES from "@/lib/const/team-names";
// import playerController from "../player-controller";
// import { PositionType } from "@/context/game.context";
import type { Player } from "shared/types/game";
import renderGenericBox from "../helpers/generic-box";
import type { LobbyClientSide } from "../../hooks/use-game-canvas";
import getPingColor from "@/lib/helpers/get-ping-color";
import secondsToMinutesAndSeconds from "@/lib/helpers/seconds-to-minutes";

// import secondsToMinutesAndSeconds from "@/lib/helpers/seconds-to-minutes";

class UserInterfaceGraphicsComponent {
  private p: p5;
  private state: LobbyClientSide;
  private targetPlayer?: Player;

  constructor(
    p: p5,
    state: LobbyClientSide,
    { targetPlayer }: { targetPlayer?: Player }
  ) {
    this.p = p;
    this.state = state;
    this.targetPlayer = targetPlayer;
  }

  drawNametags() {
    this.state.players.forEach((player) => {
      renderSeparation(() => {
        this.p.translate(
          player.position.x,
          player.position.y - PLAYER.SIZE / 2 - PLAYER.NAMETAG_GAP
        );

        this.p.fill(GAME.TEAM_COLORS[player.teamIndex] ?? GAME.TEAM_COLORS[0]);
        this.p.stroke(51);
        this.p.strokeWeight(4);
        this.p.textSize(16);
        this.p.textAlign(this.p.CENTER, this.p.CENTER);

        this.p.text(player.details.displayName, 0, 0);
      }, this.p);
    });
  }

  drawDebugInfo() {
    const debugLines = [
      `FPS: ${Math.floor(this.p.frameRate())}`,
      `Ping: ${this.state.ping}ms`,
      `Player position: ${Math.floor(
        this.targetPlayer?.position.x ?? 0
      )}, ${Math.floor(this.targetPlayer?.position.y ?? 0)}`,
    ];

    debugLines.reverse().forEach((line, index) => {
      this.p.text(
        line,
        this.p.width - 20 - this.p.textWidth(line),
        20 + index * 20
      );
    });
  }

  drawSpeechBubble(player: Player, text: string) {
    this.p.push();
    this.p.textSize(16);

    const bubbleWidth = this.p.textWidth(text) + 40; // 40 is padding
    const bubbleHeight = 60;

    // todo: move this into a helper function and reuse in drawNametags/drawspeechbubble
    // const lerpedPosition = {
    //   x: lerp(
    //     player.previousPosition?.x ?? 0,
    //     player.targetPosition?.x ?? 0,
    //     PLAYER.LERP_AMT
    //   ),
    //   y: lerp(
    //     player.previousPosition?.y ?? 0,
    //     player.targetPosition?.y ?? 0,
    //     PLAYER.LERP_AMT
    //   ),
    // };

    this.p.translate(
      player.position.x -
        PLAYER.SIZE / 2 -
        PLAYER.BUBBLE_POINTER_OFFSET / 2 +
        PLAYER.BUBBLE_POINTER_SIZE / 2,
      player.position.y -
        PLAYER.SIZE / 2 -
        bubbleHeight -
        PLAYER.BUBBLE_POINTER_SIZE -
        PLAYER.NAMETAG_GAP -
        12
    );

    this.p.beginShape();
    this.p.stroke(51);
    this.p.strokeWeight(4);
    this.p.fill(255);

    // Top left corner
    this.p.vertex(PLAYER.BUBBLE_CORNER_RADIUS, 0);
    this.p.quadraticVertex(0, 0, 0, PLAYER.BUBBLE_CORNER_RADIUS);

    // Bottom left corner
    this.p.vertex(0, bubbleHeight - PLAYER.BUBBLE_CORNER_RADIUS);
    this.p.quadraticVertex(
      0,
      bubbleHeight,
      PLAYER.BUBBLE_CORNER_RADIUS,
      bubbleHeight
    );

    // Pointer bottom left
    this.p.vertex(
      PLAYER.BUBBLE_POINTER_OFFSET - PLAYER.BUBBLE_POINTER_SIZE,
      bubbleHeight
    );

    // Pointer tip
    this.p.vertex(
      PLAYER.BUBBLE_POINTER_OFFSET,
      bubbleHeight + PLAYER.BUBBLE_POINTER_SIZE
    );

    // Pointer bottom right
    this.p.vertex(
      PLAYER.BUBBLE_POINTER_OFFSET + PLAYER.BUBBLE_POINTER_SIZE,
      bubbleHeight
    );

    // Bottom right corner
    this.p.vertex(bubbleWidth - PLAYER.BUBBLE_CORNER_RADIUS, bubbleHeight);
    this.p.quadraticVertex(
      bubbleWidth,
      bubbleHeight,
      bubbleWidth,
      bubbleHeight - PLAYER.BUBBLE_CORNER_RADIUS
    );

    // Top right corner
    this.p.vertex(bubbleWidth, PLAYER.BUBBLE_CORNER_RADIUS);
    this.p.quadraticVertex(
      bubbleWidth,
      0,
      bubbleWidth - PLAYER.BUBBLE_CORNER_RADIUS,
      0
    );

    this.p.vertex(PLAYER.BUBBLE_CORNER_RADIUS, 0);
    this.p.endShape(this.p.CLOSE);

    this.p.translate(bubbleWidth / 2, bubbleHeight / 2);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);

    this.p.text(text, 0, 0);

    this.p.pop();
  }

  drawChatMessages() {
    Object.keys(this.state.reactions).forEach((playerId) => {
      const messageIndex = this.state.reactions[playerId];

      if (messageIndex === undefined) {
        return;
      }

      const player = this.state.players.find(
        (player) => player.details.id === playerId
      );

      if (!player) {
        return;
      }

      this.drawSpeechBubble(
        player,
        GAME.REACTION_LIST[messageIndex] ?? GAME.REACTION_LIST[0]
      );
    });
  }

  drawLobbyInfo() {
    const statusText =
      this.state.status === "warmup"
        ? "Warmup"
        : this.state.status === "playing"
        ? "Game is live"
        : "Game is over";
    // const lobbyStatus = {
    //   text: "Warmup",
    //   color: "#fff",
    // };

    renderSeparation(() => {
      // p.translate(0, state.isMobile ? -20 : -10);

      this.p.textSize(18);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.fill(255);
      this.p.stroke(51);
      this.p.strokeWeight(4);
      this.p.text(statusText, this.p.width / 2, 40);

      const statusTextWidth = this.p.textWidth(statusText);

      const { minutes, seconds } = secondsToMinutesAndSeconds(this.state.timer);

      this.p.textSize(24);
      this.p.fill(this.state.timer <= 3 ? [255, 75, 75] : 255);
      this.p.text(`${minutes}:${seconds}`, this.p.width / 2, 66);

      // scores
      this.p.fill(255);
      this.p.textSize(40);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);

      this.p.fill(GAME.TEAM_COLORS[0]);
      this.p.text(
        this.state.teams[0]?.score ?? 0,
        this.p.width / 2 - statusTextWidth / 2 - 50,
        56
      );

      this.p.fill(GAME.TEAM_COLORS[1]);
      this.p.text(
        this.state.teams[1]?.score ?? 0,
        this.p.width / 2 + statusTextWidth / 2 + 50,
        56
      );
    }, this.p);
  }

  // const drawLogo = () => {
  //   p.push();

  //   p.textSize(22);
  //   p.fill(255);
  //   p.stroke(51);
  //   p.strokeWeight(4);
  //   p.text(
  //     META.SITE_DOMAIN,
  //     p.width - p.textWidth(META.SITE_DOMAIN) - 20,
  //     p.height - 20
  //   );

  //   p.pop();
  // };

  // const drawRoundStarter = () => {
  //   if (state.currentLobbyLive?.roundStatus !== "protected") return;

  //   const timeLeft = Math.max(
  //     0,
  //     GAME.ROUND_START_TIMEOUT - state.currentLobbyLive.timeSinceRoundStart
  //   );

  //   p.textAlign(p.CENTER, p.CENTER);
  //   p.fill(TEAM_COLORS[state.currentLobbyLive?.startingTeam]);
  //   p.stroke(51);
  //   p.strokeWeight(4);
  //   p.textSize(18);
  //   p.text(
  //     `Team ${TEAM_NAMES[state.currentLobbyLive?.startingTeam]} is starting`,
  //     MAP.FIELD_WIDTH / 2,
  //     MAP.FIELD_HEIGHT / 2 - 70
  //   );
  //   p.textSize(26);
  //   p.fill(255);
  //   p.text(timeLeft, MAP.FIELD_WIDTH / 2, MAP.FIELD_HEIGHT / 2 - 40);
  // };

  // const drawMobileControls = () => {
  //   if (!state.isMobile || !state.isHorizontal) return;

  //   const joystickSize = 160;
  //   const paddingX = 50;
  //   const paddingY = 20;

  //   const centerX = paddingX + joystickSize / 2;
  //   const centerY = p.height - paddingY - joystickSize / 2;

  //   p.touchStarted = () => {
  //     handleTouch();
  //   };

  //   p.touchMoved = () => {
  //     handleTouch();
  //   };

  //   p.touchEnded = () => {
  //     // touchX = centerX;
  //     // touchY = centerY;
  //     state.touch = { x: centerX, y: centerY };

  //     playerController(state).stopAllMovements();
  //   };

  //   const handleTouch = () => {
  //     if (p.touches.length === 0) return;

  //     const touch = p.touches[0] as PositionType;
  //     const dx = touch.x - centerX;
  //     const dy = touch.y - centerY;
  //     const distance = Math.sqrt(dx * dx + dy * dy);

  //     if (distance < joystickSize / 2) {
  //       // touchX = touch.x;
  //       // touchY = touch.y;
  //       state.touch = { x: touch.x, y: touch.y };
  //     } else {
  //       // touchX = centerX + (dx / distance) * (joystickSize / 2);
  //       // touchY = centerY + (dy / distance) * (joystickSize / 2);
  //       state.touch = {
  //         x: centerX + (dx / distance) * (joystickSize / 2),
  //         y: centerY + (dy / distance) * (joystickSize / 2),
  //       };
  //     }

  //     const tolerance = joystickSize * 0.1;

  //     // horizontal movements
  //     if (state.touch.x < centerX - tolerance) {
  //       playerController(state).move("start", "left");
  //       playerController(state).move("end", "right");
  //     } else if (state.touch.x > centerX + tolerance) {
  //       playerController(state).move("start", "right");
  //       playerController(state).move("end", "left");
  //     } else {
  //       playerController(state).move("end", "left");
  //       playerController(state).move("end", "right");
  //     }

  //     // vertical movements
  //     if (state.touch.y < centerY - tolerance) {
  //       playerController(state).move("start", "up");
  //       playerController(state).move("end", "down");
  //     } else if (state.touch.y > centerY + tolerance) {
  //       playerController(state).move("start", "down");
  //       playerController(state).move("end", "up");
  //     } else {
  //       playerController(state).move("end", "up");
  //       playerController(state).move("end", "down");
  //     }
  //   };

  //   const touchRender =
  //     state.touch.x === 0 && state.touch.y === 0
  //       ? {
  //           x: centerX,
  //           y: centerY,
  //         }
  //       : {
  //           x: state.touch.x,
  //           y: state.touch.y,
  //         };

  //   p.push();

  //   p.translate(centerX, centerY);
  //   p.noStroke();
  //   p.fill(255, 255, 255, 80);
  //   p.ellipse(0, 0, joystickSize); // outer circle

  //   p.fill(255, 255, 255);
  //   p.stroke(100);
  //   p.strokeWeight(4);
  //   p.ellipse(
  //     touchRender.x - centerX,
  //     touchRender.y - centerY,
  //     joystickSize * 0.4
  //   ); // inner circle

  //   p.pop();
  // };

  drawPlayerDetails() {
    const staminaPercentage =
      (this.targetPlayer?.stamina ?? GAME_PLAYER.STAMINA_DEFAULT) /
      GAME_PLAYER.STAMINA_DEFAULT;

    const settings = {
      width: 330,
      height: 32,
      x: 30,
      y: this.p.height - 30 - 32,
      innerWidth: staminaPercentage,
    };

    renderGenericBox(settings, this.p);

    // username
    renderSeparation(() => {
      // p.fill(
      //   GAME.TEAM_COLORS[targetPlayer?.teamIndex ?? 0] ?? GAME.TEAM_COLORS[0]
      // );
      this.p.fill(255);
      this.p.stroke(51);
      this.p.strokeWeight(3);
      this.p.textSize(18);
      this.p.textFont("Fredoka");
      this.p.textWeight("500");
      this.p.text(
        this.targetPlayer?.details.displayName ?? "",
        settings.x,
        settings.y - 10
      );
    }, this.p);

    // username
    renderSeparation(() => {
      this.p.fill(255);

      this.p.stroke(51);
      this.p.strokeWeight(3);
      this.p.textSize(18);
      this.p.textWeight("500");

      // ping
      this.p.fill(getPingColor(this.state.ping));
      this.p.textAlign(this.p.RIGHT);
      this.p.textSize(14);
      this.p.text(
        `${this.state.ping}ms`,
        settings.x + settings.width,
        settings.y - 10
      );
    }, this.p);
  }

  draw() {
    this.p.textFont("Fredoka");

    // moving elements based on players position
    renderSeparation(() => {
      this.p.translate(this.p.width / 2, this.p.height / 2);
      this.p.scale(this.state.cameraZoom);
      if (this.targetPlayer) {
        this.p.translate(
          -this.targetPlayer?.position.x,
          -this.targetPlayer?.position.y
        );
      }

      // drawRoundStarter();
      this.drawNametags();
      this.drawChatMessages();
    }, this.p);

    // fixed elements
    renderSeparation(() => {
      this.drawDebugInfo();
      this.drawPlayerDetails();
      this.drawLobbyInfo();
      // drawMobileControls();
    }, this.p);
  }
}

const createUserInterfaceGraphicsComponent = (
  p: p5,
  state: LobbyClientSide,
  { targetPlayer }: { targetPlayer?: Player }
) => {
  const component = new UserInterfaceGraphicsComponent(p, state, {
    targetPlayer,
  });

  return {
    draw: () => component.draw(),
  };
};

export default createUserInterfaceGraphicsComponent;
