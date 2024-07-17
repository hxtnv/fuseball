import p5 from "p5";

type Point = {
  x: number;
  y: number;
};

const generateRandomPoints = (amount: number = 100): Point[] => {
  return Array.from({ length: amount }, () => ({
    x: Math.random() * 1920,
    y: Math.random() * 963,
  }));
};

let points: Point[] = generateRandomPoints();
let intervalId: number | undefined = undefined;

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);

    intervalId = setInterval(() => {
      points = generateRandomPoints();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  };

  p.draw = () => {
    p.background(200);

    p.stroke(0);
    p.strokeWeight(2);
    p.fill(0);

    points.forEach((point) => {
      p.ellipse(point.x, point.y, 20);
    });
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

export const cleanup = () => {
  clearInterval(intervalId);
};

export default sketch;
