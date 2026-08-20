import { BALL, FIELD, PLAYER } from "@fuseball/shared";
import type { GameState } from "@fuseball/shared";
import {
  CAMERA,
  COLORS,
  ENTITY,
  FONT_FAMILY,
  TAG,
  TAG_COLORS,
  TEAM_NAMES,
  type QualitySettings,
} from "./config";
import {
  drawFieldLines,
  drawGoalNets,
  drawGoalShadow,
  drawStripes,
  type WorldBounds,
} from "./field";
import { clamp, lerp } from "./util";

interface Viewport {
  w: number;
  h: number;
  dpr: number;
}

const TWO_PI = Math.PI * 2;

// hard, flat shadow: a slightly larger translucent disc behind the entity (v3 style)
const drawEntityShadow = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void => {
  ctx.fillStyle = COLORS.entityShadow;
  ctx.beginPath();
  ctx.arc(x, y, (size * ENTITY.shadowRatio) / 2, 0, TWO_PI);
  ctx.fill();
};

const drawDisc = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  diameter: number,
  fill: string,
): void => {
  ctx.beginPath();
  ctx.arc(x, y, diameter / 2, 0, TWO_PI);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = ENTITY.outlineWeight;
  ctx.strokeStyle = COLORS.outline;
  ctx.stroke();
};

// name tag above a player — its colour is how teams are distinguished
const drawTag = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  color: string,
): void => {
  ctx.font = TAG.font;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.lineJoin = "round";
  ctx.lineWidth = TAG.outlineWeight;
  ctx.strokeStyle = TAG.outline;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
};

const drawPlayers = (
  ctx: CanvasRenderingContext2D,
  prev: GameState,
  curr: GameState,
  alpha: number,
): void => {
  curr.players.forEach((cp, i) => {
    const pp = prev.players[i] ?? cp;
    const x = lerp(pp.x, cp.x, alpha);
    const y = lerp(pp.y, cp.y, alpha);
    drawEntityShadow(ctx, x, y, PLAYER.SIZE);
    drawDisc(ctx, x, y, PLAYER.SIZE, COLORS.playerBody);
    drawTag(ctx, x, y - TAG.offset, `P${cp.id}`, TAG_COLORS[cp.team]);
  });
};

const drawBall = (
  ctx: CanvasRenderingContext2D,
  prev: GameState,
  curr: GameState,
  alpha: number,
): void => {
  const bx = lerp(prev.ball.x, curr.ball.x, alpha);
  const by = lerp(prev.ball.y, curr.ball.y, alpha);
  const bz = lerp(prev.ball.z, curr.ball.z, alpha);
  const heightScale = 1 + bz * 0.004; // grows a little when lofted
  drawEntityShadow(ctx, bx, by, BALL.SIZE / heightScale);
  drawDisc(ctx, bx, by - bz, BALL.SIZE * heightScale, "rgb(255, 255, 255)");
};

const drawHud = (
  ctx: CanvasRenderingContext2D,
  state: GameState,
  w: number,
  h: number,
  fps: number,
  quality: QualitySettings,
  localId: number,
): void => {
  const cx = w / 2;

  ctx.textBaseline = "top";
  ctx.font = `800 34px ${FONT_FAMILY}`;
  ctx.textAlign = "right";
  ctx.fillStyle = TAG_COLORS[0];
  ctx.fillText(String(state.score[0]), cx - 70, 16);
  ctx.textAlign = "left";
  ctx.fillStyle = TAG_COLORS[1];
  ctx.fillText(String(state.score[1]), cx + 70, 16);

  let status: string;
  if (state.status === "live" || state.status === "celebrating") {
    const t = Math.max(0, state.timeRemaining);
    status = `${Math.floor(t / 60)}:${Math.floor(t % 60)
      .toString()
      .padStart(2, "0")}`;
  } else if (state.status === "protected") status = "Kickoff";
  else if (state.status === "finished") status = "Full time";
  else status = "Warmup";

  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.hud;
  ctx.font = `700 20px ${FONT_FAMILY}`;
  ctx.fillText(status, cx, 22);

  if (state.status === "celebrating") {
    const team = state.lastScoringTeam ?? 0;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.font = `900 72px ${FONT_FAMILY}`;
    ctx.fillText("GOAL!", cx, h / 2 - 44);
    ctx.font = `800 28px ${FONT_FAMILY}`;
    ctx.fillStyle = TAG_COLORS[team];
    ctx.fillText(`${TEAM_NAMES[team]} team scores`, cx, h / 2 + 6);
    ctx.font = `800 44px ${FONT_FAMILY}`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${state.score[0]} - ${state.score[1]}`, cx, h / 2 + 52);
  }

  const me = state.players.find((p) => p.id === localId);
  ctx.font = "500 12px ui-monospace, monospace";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillText(`FPS: ${Math.round(fps)} · ${quality.name} (Q)`, w - 12, 12);
  if (me)
    ctx.fillText(`Pos: ${Math.round(me.x)}, ${Math.round(me.y)}`, w - 12, 28);
};

export const render = (
  ctx: CanvasRenderingContext2D,
  prev: GameState,
  curr: GameState,
  alpha: number,
  viewport: Viewport,
  quality: QualitySettings,
  localId: number,
  fps: number,
): void => {
  const { w, h, dpr } = viewport;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // the entire map is grass
  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(0, 0, w, h);

  const localCurr = curr.players.find((p) => p.id === localId);
  const localPrev = prev.players.find((p) => p.id === localId);
  const camX = localCurr
    ? lerp(localPrev?.x ?? localCurr.x, localCurr.x, alpha)
    : FIELD.WIDTH / 2;
  const camY = localCurr
    ? lerp(localPrev?.y ?? localCurr.y, localCurr.y, alpha)
    : FIELD.HEIGHT / 2;
  const scale = clamp(
    h / CAMERA.viewWorldHeight,
    CAMERA.minScale,
    CAMERA.maxScale,
  );

  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(scale, scale);
  ctx.translate(-camX, -camY);

  const halfW = w / 2 / scale;
  const halfH = h / 2 / scale;
  const bounds: WorldBounds = {
    left: camX - halfW,
    right: camX + halfW,
    top: camY - halfH,
    bottom: camY + halfH,
  };

  drawStripes(ctx, bounds);
  drawFieldLines(ctx);
  drawPlayers(ctx, prev, curr, alpha);
  drawBall(ctx, prev, curr, alpha);
  drawGoalShadow(ctx); // darkens the goal recess (stripes + any player/ball inside)
  drawGoalNets(ctx); // white net on top, so the mesh stays bright

  ctx.restore();

  drawHud(ctx, curr, w, h, fps, quality, localId);
};
