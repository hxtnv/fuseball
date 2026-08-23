import { BALL, FIELD, PLAYER } from "@fuseball/shared";
import type { Snapshot } from "@fuseball/shared";
import {
  CAMERA,
  COLORS,
  ENTITY,
  FONT_FAMILY,
  TAG,
  TAG_COLORS,
  type QualitySettings,
} from "./config";
import {
  drawFieldLines,
  drawGoalNets,
  drawGoalShadow,
  drawStripes,
  type WorldBounds,
} from "./field";
import { clamp } from "./util";

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
  state: Snapshot,
  localId: number,
): void => {
  for (const p of state.players) {
    drawEntityShadow(ctx, p.x, p.y, PLAYER.SIZE);
    drawDisc(ctx, p.x, p.y, PLAYER.SIZE, COLORS.playerBody);

    // if (p.id === localId) {
    //   // highlight ring so you can spot yourself at a glance
    //   ctx.beginPath();
    //   ctx.arc(p.x, p.y, PLAYER.SIZE / 2 + 4, 0, TWO_PI);
    //   ctx.lineWidth = 3;
    //   ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    //   ctx.stroke();
    // }
  }
};

// separate pass, drawn after every entity so a tag is never hidden behind the
// ball, a goal net, or another player's body
const drawNames = (ctx: CanvasRenderingContext2D, state: Snapshot): void => {
  for (const p of state.players)
    drawTag(
      ctx,
      p.x,
      p.y - TAG.offset,
      p.name ?? `P${p.id}`,
      TAG_COLORS[p.team],
    );
};

const drawBall = (ctx: CanvasRenderingContext2D, state: Snapshot): void => {
  const { x, y, z } = state.ball;
  const heightScale = 1 + z * 0.004; // grows a little when lofted
  drawEntityShadow(ctx, x, y, BALL.SIZE / heightScale);
  drawDisc(ctx, x, y - z, BALL.SIZE * heightScale, "rgb(255, 255, 255)");
};

export const renderConnecting = (
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
): void => {
  const { w, h, dpr } = viewport;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = COLORS.hud;
  ctx.font = `700 28px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Connecting…", w / 2, h / 2);
};

export const render = (
  ctx: CanvasRenderingContext2D,
  state: Snapshot,
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

  const me = state.players.find((p) => p.id === localId);
  const camX = me ? me.x : FIELD.WIDTH / 2;
  const camY = me ? me.y : FIELD.HEIGHT / 2;
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
  drawPlayers(ctx, state, localId);
  drawBall(ctx, state);
  drawGoalShadow(ctx); // darkens the goal recess (stripes + any player/ball inside)
  drawGoalNets(ctx); // white net on top, so the mesh stays bright
  drawNames(ctx, state); // last, so name tags sit above every entity

  ctx.restore();
};
