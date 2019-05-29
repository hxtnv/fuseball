class Scene {
  constructor(props) {
    this.props = props;

    this.size = {
      x: this.props.size,
      y: this.calculateRatioHeight(this.props.size) // should be in resize event
    };

    this.goalSize = {
      x: this.size.y * .25,
      y: this.size.y * .5
    }

    this.goals = [];

    this.border = createSprite(0, 0, this.size.x, this.size.y);
    this.border.draw = () => this.drawBorder();

    this.middle = createSprite(0, 0, this.size.y * .5, this.size.y * .5);
    this.middle.draw = () => this.drawMiddle();

    this.goals[0] = createSprite(-(this.size.x / 2) - (this.goalSize.x / 2), 0, this.goalSize.x, this.goalSize.y);
    this.goals[0].draw = () => this.drawGoal(0);

    this.goals[1] = createSprite((this.size.x / 2) + (this.goalSize.x / 2), 0, this.goalSize.x, this.goalSize.y);
    this.goals[1].draw = () => this.drawGoal(1);


    this.border.setCollider('rectangle');
    this.middle.setCollider('circle');
    this.goals[0].setCollider('rectangle');
    this.goals[1].setCollider('rectangle');

    this.initColliders();
  }

  calculateRatioHeight(width) {
    return Math.round((width / 16) * 9);
  }

  initColliders() {
    this.colSize = 200;
    this.col = new Group();

    this.col.add(createSprite(0, -(this.size.y / 2) - (this.colSize / 2), this.size.x, this.colSize)); // top
    this.col.add(createSprite(0, (this.size.y / 2) + (this.colSize / 2), this.size.x, this.colSize)); // bottom


    this.col.add(createSprite(
      -(this.size.x / 2) - (this.goalSize.x / 2),
      -(this.size.y / 2) + ((this.size.y - this.goalSize.y) / 2) / 2,
      this.goalSize.x,
      (this.size.y - this.goalSize.y) / 2)
    ); // left top

    this.col.add(createSprite(
      -(this.size.x / 2) - (this.goalSize.x / 2),
      (this.size.y / 2) - ((this.size.y - this.goalSize.y) / 2) / 2,
      this.goalSize.x,
      (this.size.y - this.goalSize.y) / 2)
    ); // left bottom

    this.col.add(createSprite(-(this.size.x / 2) - (this.goalSize.x * 1.5), 0, this.goalSize.x, this.goalSize.y)); // left middle



    this.col.add(createSprite(
      (this.size.x / 2) + (this.goalSize.x / 2),
      -(this.size.y / 2) + ((this.size.y - this.goalSize.y) / 2) / 2,
      this.goalSize.x,
      (this.size.y - this.goalSize.y) / 2)
    ); // right top

    this.col.add(createSprite(
      (this.size.x / 2) + (this.goalSize.x / 2),
      (this.size.y / 2) - ((this.size.y - this.goalSize.y) / 2) / 2,
      this.goalSize.x,
      (this.size.y - this.goalSize.y) / 2)
    ); // right bottom

    this.col.add(createSprite((this.size.x / 2) + (this.goalSize.x * 1.5), 0, this.goalSize.x, this.goalSize.y)); // right middle


    for(let i in this.col.toArray()) {
      this.col[i].immovable = true;
    }
  }

  fillLines() {
    stroke(225);
    strokeWeight(5);
    noFill();
  }

  drawBorder() {
    this.fillLines();

    rect(0, 0, this.border.width, this.border.height);
  }

  drawMiddle() {
    this.fillLines();

    rect(0, 0, 0, this.size.y);
    ellipse(0, 0, this.middle.width);
  }

  drawGoal(side) {
    this.fillLines();

    rect(0, 0, this.goals[side].width, this.goals[side].height);
  }

  update() {
    stroke(225);
    strokeWeight(5);
    noFill();

    drawSprite(this.border);
    drawSprite(this.middle);
    drawSprite(this.goals[0]);
    drawSprite(this.goals[1]);
  }
}