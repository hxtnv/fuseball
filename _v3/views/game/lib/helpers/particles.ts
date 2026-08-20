import p5 from "q5";

type ParticleType = "particle" | "impact";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: {
    alpha: number;
    size: number;
  };
  properties: {
    type: ParticleType;
    color: [number, number, number];
  };
};

const particleStateMap: Record<
  ParticleType,
  Particle["state"] & { count: number }
> = {
  particle: { alpha: 200, size: 6, count: 5 },
  impact: { alpha: 0, size: 0, count: 1 },
};

export class ParticleSystem {
  private p: p5;
  private particles: Particle[] = [];
  private alive: boolean = true;

  constructor(
    p: p5,
    x: number,
    y: number,
    properties: Particle["properties"] = {
      type: "particle",
      color: [255, 200, 50],
    }
  ) {
    this.p = p;

    console.log(
      "create",
      properties.type,
      particleStateMap[properties.type].count
    );

    for (let i = 0; i < particleStateMap[properties.type].count; i++) {
      const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.2;
      const speed = 2 + Math.random() * 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        state: {
          ...particleStateMap[properties.type],
        },
        properties,
      });
    }
  }

  update() {
    this.particles.forEach((pt) => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vx *= 0.92;
      pt.vy *= 0.92;

      if (pt.properties.type === "particle") {
        pt.state.alpha -= 8;
      } else if (pt.properties.type === "impact") {
        pt.state.alpha += 4;
        pt.state.size += 5;
      }
    });

    this.particles = this.particles.filter((pt) => {
      if (pt.properties.type === "particle") {
        return pt.state.alpha > 0;
      } else if (pt.properties.type === "impact") {
        return pt.state.size < 80;
      }
    });

    if (this.particles.length === 0) this.alive = false;
  }

  draw() {
    this.p.push();
    this.p.noStroke();
    this.particles.forEach((pt) => {
      if (pt.properties.type === "particle") {
        this.p.fill(
          pt.properties.color[0],
          pt.properties.color[1],
          pt.properties.color[2],
          pt.state.alpha
        );

        this.p.ellipse(pt.x, pt.y, pt.state.size);
      } else if (pt.properties.type === "impact") {
        this.p.stroke(255, 255, 255, 80);
        this.p.strokeWeight(3);
        this.p.fill(0, 0, 0, pt.state.alpha);
        this.p.ellipse(pt.x, pt.y, pt.state.size);
      }
    });
    this.p.pop();
  }

  isAlive() {
    return this.alive;
  }
}
