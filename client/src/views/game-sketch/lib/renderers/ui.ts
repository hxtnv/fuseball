import p5 from "q5";
import type { StateType } from "../state-machine";
import PLAYER from "../const/player";
import lerp from "../helpers/lerp";
import LOBBY_STATUS from "@/lib/const/lobby-status";
import TEAM_COLORS from "@/lib/const/team-colors";
import META from "@/lib/const/meta";
import renderSeparation from "../helpers/render-separation";
import { LobbyPlayerLive } from "@/context/game.context";

const userInterfaceRenderer = (p: p5, state: StateType) => {
  const debugLines = [
    `FPS: ${Number(p.frameRate()).toFixed(0)}`,
    `Ping: ${state.ping}ms`,
    `Player position: ${state.followingPlayer?.position.x.toFixed(
      0
    )}, ${state.followingPlayer?.position.y.toFixed(0)}`,
  ];

  const drawNametag = (player: LobbyPlayerLive) => {
    p.push();

    // todo: move this into a helper function and reuse in drawNametags/drawspeechbubble
    const lerpedPosition = {
      x: lerp(
        player.previousPosition?.x ?? 0,
        player.targetPosition?.x ?? 0,
        PLAYER.LERP_AMT
      ),
      y: lerp(
        player.previousPosition?.y ?? 0,
        player.targetPosition?.y ?? 0,
        PLAYER.LERP_AMT
      ),
    };

    p.translate(
      lerpedPosition.x,
      lerpedPosition.y - PLAYER.SIZE / 2 - PLAYER.NAMETAG_GAP
    );

    p.fill(TEAM_COLORS[player.team] ?? TEAM_COLORS[0]);
    p.stroke(51);
    p.strokeWeight(4);
    p.textSize(16);
    p.textAlign(p.CENTER, p.CENTER);

    p.text(player.name, 0, 0);

    p.pop();
  };

  const drawNametags = () => {
    state.currentLobbyLive?.players.forEach(drawNametag);
  };

  const drawDebugInfo = () => {
    debugLines.reverse().forEach((line, index) => {
      p.text(line, 20, p.height - 20 - index * 20);
    });
  };

  const drawSpeechBubble = (player: LobbyPlayerLive, text: string) => {
    p.push();
    p.textSize(16);

    const bubbleWidth = p.textWidth(text) + 40;
    const bubbleHeight = 60;

    // todo: move this into a helper function and reuse in drawNametags/drawspeechbubble
    const lerpedPosition = {
      x: lerp(
        player.previousPosition?.x ?? 0,
        player.targetPosition?.x ?? 0,
        PLAYER.LERP_AMT
      ),
      y: lerp(
        player.previousPosition?.y ?? 0,
        player.targetPosition?.y ?? 0,
        PLAYER.LERP_AMT
      ),
    };

    p.translate(
      lerpedPosition.x -
        PLAYER.SIZE / 2 -
        PLAYER.BUBBLE_POINTER_OFFSET / 2 +
        PLAYER.BUBBLE_POINTER_SIZE / 2,
      lerpedPosition.y -
        PLAYER.SIZE / 2 -
        bubbleHeight -
        PLAYER.BUBBLE_POINTER_SIZE -
        PLAYER.NAMETAG_GAP -
        12
    );

    p.beginShape();
    p.stroke(51);
    p.strokeWeight(4);
    p.fill(255);

    // Top left corner
    p.vertex(PLAYER.BUBBLE_CORNER_RADIUS, 0);
    p.quadraticVertex(0, 0, 0, PLAYER.BUBBLE_CORNER_RADIUS);

    // Bottom left corner
    p.vertex(0, bubbleHeight - PLAYER.BUBBLE_CORNER_RADIUS);
    p.quadraticVertex(
      0,
      bubbleHeight,
      PLAYER.BUBBLE_CORNER_RADIUS,
      bubbleHeight
    );

    // Pointer bottom left
    p.vertex(
      PLAYER.BUBBLE_POINTER_OFFSET - PLAYER.BUBBLE_POINTER_SIZE,
      bubbleHeight
    );

    // Pointer tip
    p.vertex(
      PLAYER.BUBBLE_POINTER_OFFSET,
      bubbleHeight + PLAYER.BUBBLE_POINTER_SIZE
    );

    // Pointer bottom right
    p.vertex(
      PLAYER.BUBBLE_POINTER_OFFSET + PLAYER.BUBBLE_POINTER_SIZE,
      bubbleHeight
    );

    // Bottom right corner
    p.vertex(bubbleWidth - PLAYER.BUBBLE_CORNER_RADIUS, bubbleHeight);
    p.quadraticVertex(
      bubbleWidth,
      bubbleHeight,
      bubbleWidth,
      bubbleHeight - PLAYER.BUBBLE_CORNER_RADIUS
    );

    // Top right corner
    p.vertex(bubbleWidth, PLAYER.BUBBLE_CORNER_RADIUS);
    p.quadraticVertex(
      bubbleWidth,
      0,
      bubbleWidth - PLAYER.BUBBLE_CORNER_RADIUS,
      0
    );

    p.vertex(PLAYER.BUBBLE_CORNER_RADIUS, 0);
    p.endShape(p.CLOSE);

    p.translate(bubbleWidth / 2, bubbleHeight / 2);
    p.textAlign(p.CENTER, p.CENTER);

    p.text(text, 0, 0);

    p.pop();
  };

  const drawChatMessages = () => {
    if (!state.currentLobbyLive) return;

    Object.keys(state.currentLobbyLive.chatMessages).forEach((playerId) => {
      const message = state.currentLobbyLive?.chatMessages[playerId];

      if (!message) {
        return;
      }

      const player = state.currentLobbyLive?.players.find(
        (player) => player.id === playerId
      );

      if (!player) {
        return;
      }

      drawSpeechBubble(player, message.message);
    });
  };

  // const followPlayer = (player: LobbyPlayerLive) => {
  //   p.translate(
  //     p.width / 2 - player.position.x,
  //     p.height / 2 - player.position.y
  //   );
  // };

  const drawLobbyInfo = () => {
    if (!state.currentLobbyMeta) return;

    p.push();

    p.textSize(18);
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(255);
    p.stroke(51);
    p.strokeWeight(4);
    p.text(state.currentLobbyMeta.name, p.width / 2, 40);

    if (!state.currentLobbyLive) return;

    // const lobbyStatus = { text: "Warmup", color: "#6ae72c" };
    const lobbyStatus = LOBBY_STATUS[state.currentLobbyLive.status];
    const lobbyNameTextWidth = p.textWidth(state.currentLobbyMeta.name);

    p.textSize(24);
    p.fill(lobbyStatus.color);
    p.text(lobbyStatus.text, p.width / 2, 66);

    // scores
    p.fill(255);
    p.textSize(40);
    p.textAlign(p.CENTER, p.CENTER);

    p.fill(TEAM_COLORS[0]);
    p.text(
      state.currentLobbyLive.score[0],
      p.width / 2 - lobbyNameTextWidth / 2 - 50,
      56
    );

    p.fill(TEAM_COLORS[1]);
    p.text(
      state.currentLobbyLive.score[0],
      p.width / 2 + lobbyNameTextWidth / 2 + 50,
      56
    );

    p.pop();
  };

  const drawLogo = () => {
    p.push();

    p.textSize(22);
    p.fill(255);
    p.stroke(51);
    p.strokeWeight(4);
    p.text(
      META.SITE_DOMAIN,
      p.width - p.textWidth(META.SITE_DOMAIN) - 20,
      p.height - 20
    );

    p.pop();
  };

  const draw = () => {
    p.textFont("Itim");

    // moving elements based on players position
    renderSeparation(() => {
      p.translate(p.width / 2, p.height / 2);
      p.scale(state.cameraScale);
      p.translate(-state.cameraPosition.x, -state.cameraPosition.y);

      drawNametags();
      drawChatMessages();
    }, p);

    // fixed elements
    renderSeparation(() => {
      drawLogo();
      drawDebugInfo();
      drawLobbyInfo();
    }, p);
  };

  return { draw, drawSpeechBubble };
};

export default userInterfaceRenderer;
