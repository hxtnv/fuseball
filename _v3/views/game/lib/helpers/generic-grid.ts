import p5 from "q5";

const drawGenericGrid = (
  p: p5,
  x: number,
  y: number,
  w: number,
  h: number,
  {
    gridCountX,
    gridCountY,
    strokeColor = "#333",
    strokeWeightVal = 1,
  }: {
    gridCountX: number;
    gridCountY: number;
    strokeColor?: string;
    strokeWeightVal?: number;
  }
) => {
  p.push();
  p.stroke(strokeColor);
  p.strokeWeight(strokeWeightVal);

  const cellW = w / gridCountX;
  const cellH = h / gridCountY;

  // vertical lines
  for (let i = 0; i <= gridCountX; i++) {
    const xi = x + i * cellW;
    p.line(xi, y, xi, y + h);
  }

  // horizontal lines
  for (let j = 0; j <= gridCountY; j++) {
    const yj = y + j * cellH;
    p.line(x, yj, x + w, yj);
  }

  p.pop();
};

export default drawGenericGrid;
