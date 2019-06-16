import getPositions from '../helpers/getPositions';

class Scene {
  constructor(size) {
    this.size = {
      x: size,
      y: this.calculateRatioHeight(size) // should be in resize event
    };

    this.goalSize = {
      x: this.size.y * .25,
      y: this.size.y * .5
    }

    this.goals = [];
    this.sides = [];

    this.border = p5.createSprite(0, 0, this.size.x, this.size.y);
    this.border.draw = () => this.drawBorder();

    this.middle = p5.createSprite(0, 0, this.size.y * .5, this.size.y * .5);
    this.middle.draw = () => this.drawMiddle();

    this.goals[0] = p5.createSprite(-(this.size.x / 2) - (this.goalSize.x / 2), 0, this.goalSize.x, this.goalSize.y);
    this.goals[0].draw = () => this.drawGoal(0);

    this.goals[1] = p5.createSprite((this.size.x / 2) + (this.goalSize.x / 2), 0, this.goalSize.x, this.goalSize.y);
    this.goals[1].draw = () => this.drawGoal(1);

    this.sides[0] = p5.createSprite(-(this.size.x / 4), 0, this.size.x / 2, this.size.y);
    this.sides[0].draw = () => {};

    this.sides[1] = p5.createSprite(this.size.x / 4, 0, this.size.x / 2, this.size.y);
    this.sides[1].draw = () => {};


    this.border.setCollider('rectangle');
    this.middle.setCollider('circle');
    this.goals[0].setCollider('rectangle');
    this.goals[1].setCollider('rectangle');
    this.sides[0].setCollider('rectangle');
    this.sides[1].setCollider('rectangle');

    this.initColliders();

    this.positions = getPositions(this.size);
  }

  calculateRatioHeight(width) {
    return Math.round((width / 16) * 9);
  }

  initColliders() {
    this.colSize = 200;
    this.col = new p5.Group();

    this.col.add(p5.createSprite(0, -(this.size.y / 2) - (this.colSize / 2), this.size.x, this.colSize)); // top
    this.col.add(p5.createSprite(0, (this.size.y / 2) + (this.colSize / 2), this.size.x, this.colSize)); // bottom


    this.col.add(p5.createSprite(
      -(this.size.x / 2) - (this.goalSize.x / 2),
      -(this.size.y / 2) + ((this.size.y - this.goalSize.y) / 2) / 2,
      this.goalSize.x,
      (this.size.y - this.goalSize.y) / 2)
    ); // left top

    this.col.add(p5.createSprite(
      -(this.size.x / 2) - (this.goalSize.x / 2),
      (this.size.y / 2) - ((this.size.y - this.goalSize.y) / 2) / 2,
      this.goalSize.x,
      (this.size.y - this.goalSize.y) / 2)
    ); // left bottom

    this.col.add(p5.createSprite(-(this.size.x / 2) - (this.goalSize.x * 1.5), 0, this.goalSize.x, this.goalSize.y)); // left middle



    this.col.add(p5.createSprite(
      (this.size.x / 2) + (this.goalSize.x / 2),
      -(this.size.y / 2) + ((this.size.y - this.goalSize.y) / 2) / 2,
      this.goalSize.x,
      (this.size.y - this.goalSize.y) / 2)
    ); // right top

    this.col.add(p5.createSprite(
      (this.size.x / 2) + (this.goalSize.x / 2),
      (this.size.y / 2) - ((this.size.y - this.goalSize.y) / 2) / 2,
      this.goalSize.x,
      (this.size.y - this.goalSize.y) / 2)
    ); // right bottom

    this.col.add(p5.createSprite((this.size.x / 2) + (this.goalSize.x * 1.5), 0, this.goalSize.x, this.goalSize.y)); // right middle


    for(let i in this.col.toArray()) {
      this.col[i].immovable = true;
    }
  }

  fillLines() {
    p5.stroke(225);
    p5.strokeWeight(7);
    p5.noFill();
  }

  drawBorder() {
    this.fillLines();

    p5.rect(0, 0, this.border.width, this.border.height, 10);
  }

  drawMiddle() {
    this.fillLines();

    p5.rect(0, 0, 0, this.size.y);
    p5.ellipse(0, 0, this.middle.width);
  }

  drawGoal(side) {
    this.fillLines();

    p5.rect(0, 0, this.goals[side].width, this.goals[side].height,
      side === 0 ? 10 : 0,
      side === 1 ? 10 : 0,
      side === 1 ? 10 : 0,
      side === 0 ? 10 : 0
    );
  }

  update() {
    p5.stroke(225);
    p5.strokeWeight(5);
    p5.noFill();

    p5.drawSprite(this.border);
    p5.drawSprite(this.middle);
    p5.drawSprite(this.goals[0]);
    p5.drawSprite(this.goals[1]);

    p5.drawSprite(this.sides[0]);
    p5.drawSprite(this.sides[1]);

    p5.noStroke();

    // draw spawn points
    /*for(let i in this.positions[0]) {
      let pos = this.positions[0][i];

      p5.fill(255, 0, 0);
      p5.ellipse(pos.x, pos.y,  40);
    }

    for(let i in this.positions[1]) {
      let pos = this.positions[1][i];

      p5.fill(0, 0, 255);
      p5.ellipse(pos.x, pos.y,  40);
    }*/
  }
}

export default Scene;