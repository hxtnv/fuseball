import p5 from "q5";

class Entity {
  private p: p5;

  constructor(p: p5) {
    this.p = p;
  }

  getBushPoints(scale: number) {
    return [
      0,
      0,
      0,
      0,
      scale / 5.5,
      scale / 5.5,
      scale / 2.44,
      scale / 5.5,
      scale / 2.75,
      scale / 2.44,
      scale / 2,
      scale / 1.69,
      scale / 3.14,
      scale / 1.29,
      scale / 4.4,
      scale,

      0,
      scale / 1.1,

      -(scale / 4.4),
      scale,
      -(scale / 3.14),
      scale / 1.29,
      -(scale / 2),
      scale / 1.69,
      -(scale / 2.75),
      scale / 2.44,
      -(scale / 2.44),
      scale / 5.5,
      -(scale / 5.5),
      scale / 5.5,

      0,
      0,
    ];
  }

  drawBush(x: number, y: number, size: number) {
    const points = this.getBushPoints(size);
    const pointsInside = this.getBushPoints(size / 2);

    this.p.push();
    this.p.translate(x, y);

    // core
    this.p.fill(78, 100, 54);
    this.p.stroke(51);
    this.p.strokeWeight(3);

    this.p.beginShape();

    for (let i = 0; i < points.length; i += 2) {
      this.p.curveVertex(points[i], points[i + 1]);
    }

    this.p.endShape(this.p.CLOSE);

    // inside
    this.p.translate(0, size / 4);

    this.p.fill(88, 123, 57);
    this.p.noStroke();

    this.p.beginShape();
    for (let i = 0; i < pointsInside.length; i += 2) {
      this.p.curveVertex(pointsInside[i], pointsInside[i + 1]);
    }
    this.p.endShape(this.p.CLOSE);

    this.p.pop();
  }
}

export default Entity;
