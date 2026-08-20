import { FIELD } from "@fuseball/shared";
import { COLORS, FIELD_STYLE } from "./config";

const HALF_PI = Math.PI / 2;
const PI = Math.PI;
const TWO_PI = Math.PI * 2;

export interface WorldBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

// per-corner rounded rect path (avoids ctx.roundRect for old-browser support)
const roundedRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  tl: number,
  tr: number,
  br: number,
  bl: number,
): void => {
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  if (tr) ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);
  if (br) ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);
  if (bl) ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl);
  if (tl) ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
};

// mowing stripes span the whole map; a band is centred on the halfway line
export const drawStripes = (
  ctx: CanvasRenderingContext2D,
  bounds: WorldBounds,
): void => {
  const spacing = FIELD_STYLE.gridSpacing;
  const period = spacing * 2;
  const top = -FIELD.HEIGHT;
  const height = FIELD.HEIGHT * 3;
  const origin = FIELD.WIDTH / 2 - spacing / 2 - spacing; // band centred on the centre line
  const start = origin + Math.floor((bounds.left - origin) / period) * period;

  ctx.fillStyle = COLORS.stripe;
  ctx.strokeStyle = COLORS.stripeBorder;
  ctx.lineWidth = FIELD_STYLE.stripeBorderWeight;
  for (let x = start; x <= bounds.right; x += period) {
    ctx.beginPath();
    ctx.rect(x, top, spacing, height);
    ctx.fill();
    ctx.stroke();
  }
};

const drawMesh = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void => {
  const cols = 6;
  const rows = 9;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = COLORS.net;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 1; i < cols; i++) {
    const lx = x + (w * i) / cols;
    ctx.moveTo(lx, y);
    ctx.lineTo(lx, y + h);
  }
  for (let j = 1; j < rows; j++) {
    const ly = y + (h * j) / rows;
    ctx.moveTo(x, ly);
    ctx.lineTo(x + w, ly);
  }
  ctx.stroke();
  ctx.restore();
};

export const drawGoalNets = (ctx: CanvasRenderingContext2D): void => {
  const bandH = FIELD.HEIGHT * FIELD.GOAL_ZONE_HEIGHT_RATIO;
  const depth = FIELD.WIDTH * FIELD.GOAL_ZONE_WIDTH_RATIO;
  const bandTop = FIELD.HEIGHT * ((1 - FIELD.GOAL_ZONE_HEIGHT_RATIO) / 2);
  const bandBottom = bandTop + bandH;
  const r = FIELD_STYLE.innerRadius;
  const W = FIELD.WIDTH;

  drawMesh(ctx, -depth + 3, bandTop + 3, depth - 6, bandH - 6);
  drawMesh(ctx, W + 3, bandTop + 3, depth - 6, bandH - 6);

  // thick outer frame (as thick as the field lines), open on the field side
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = FIELD_STYLE.lineWeight;
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(0, bandTop);
  ctx.lineTo(-depth + r, bandTop);
  ctx.arcTo(-depth, bandTop, -depth, bandTop + r, r);
  ctx.lineTo(-depth, bandBottom - r);
  ctx.arcTo(-depth, bandBottom, -depth + r, bandBottom, r);
  ctx.lineTo(0, bandBottom);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(W, bandTop);
  ctx.lineTo(W + depth - r, bandTop);
  ctx.arcTo(W + depth, bandTop, W + depth, bandTop + r, r);
  ctx.lineTo(W + depth, bandBottom - r);
  ctx.arcTo(W + depth, bandBottom, W + depth - r, bandBottom, r);
  ctx.lineTo(W, bandBottom);
  ctx.stroke();
};

// darkens the goal recess (drawn over the field/players, beneath the white net)
export const drawGoalShadow = (ctx: CanvasRenderingContext2D): void => {
  const bandH = FIELD.HEIGHT * FIELD.GOAL_ZONE_HEIGHT_RATIO;
  const depth = FIELD.WIDTH * FIELD.GOAL_ZONE_WIDTH_RATIO;
  const bandTop = FIELD.HEIGHT * ((1 - FIELD.GOAL_ZONE_HEIGHT_RATIO) / 2);
  const r = FIELD_STYLE.innerRadius;
  ctx.fillStyle = COLORS.goalShadow;
  roundedRectPath(ctx, -depth, bandTop, depth, bandH, r, 0, 0, r);
  ctx.fill();
  roundedRectPath(ctx, FIELD.WIDTH, bandTop, depth, bandH, 0, r, r, 0);
  ctx.fill();
};

export const drawFieldLines = (ctx: CanvasRenderingContext2D): void => {
  const { cornerArc, outerRadius, innerRadius, lineWeight } = FIELD_STYLE;
  ctx.strokeStyle = COLORS.line;
  ctx.fillStyle = COLORS.line;
  ctx.lineWidth = lineWeight;

  roundedRectPath(
    ctx,
    0,
    0,
    FIELD.WIDTH,
    FIELD.HEIGHT,
    outerRadius,
    outerRadius,
    outerRadius,
    outerRadius,
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(FIELD.WIDTH / 2, 0);
  ctx.lineTo(FIELD.WIDTH / 2, FIELD.HEIGHT);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, cornerArc, 0, HALF_PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(FIELD.WIDTH, 0, cornerArc, HALF_PI, PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(FIELD.WIDTH, FIELD.HEIGHT, cornerArc, PI, PI + HALF_PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, FIELD.HEIGHT, cornerArc, PI + HALF_PI, TWO_PI);
  ctx.stroke();

  const circleRadius = (FIELD.WIDTH * FIELD.MIDDLE_CIRCLE_RATIO) / 2;
  ctx.beginPath();
  ctx.arc(FIELD.WIDTH / 2, FIELD.HEIGHT / 2, circleRadius, 0, TWO_PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(FIELD.WIDTH / 2, FIELD.HEIGHT / 2, 7, 0, TWO_PI);
  ctx.fill();

  const paH = FIELD.HEIGHT * FIELD_STYLE.penaltyAreaHeightRatio;
  const paW = FIELD.WIDTH * FIELD_STYLE.penaltyAreaWidthRatio;
  const paY = FIELD.HEIGHT * ((1 - FIELD_STYLE.penaltyAreaHeightRatio) / 2);
  roundedRectPath(ctx, 0, paY, paW, paH, 0, innerRadius, innerRadius, 0);
  ctx.stroke();
  roundedRectPath(
    ctx,
    FIELD.WIDTH - paW,
    paY,
    paW,
    paH,
    innerRadius,
    0,
    0,
    innerRadius,
  );
  ctx.stroke();

  const gaH = FIELD.HEIGHT * FIELD_STYLE.goalAreaHeightRatio;
  const gaW = FIELD.WIDTH * FIELD_STYLE.goalAreaWidthRatio;
  const gaY = FIELD.HEIGHT * ((1 - FIELD_STYLE.goalAreaHeightRatio) / 2);
  roundedRectPath(ctx, 0, gaY, gaW, gaH, 0, innerRadius, innerRadius, 0);
  ctx.stroke();
  roundedRectPath(
    ctx,
    FIELD.WIDTH - gaW,
    gaY,
    gaW,
    gaH,
    innerRadius,
    0,
    0,
    innerRadius,
  );
  ctx.stroke();
};
