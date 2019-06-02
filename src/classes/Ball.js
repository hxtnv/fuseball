class Ball {
  constructor(props) {
    this.props = props;

    this.sprite = p5.createSprite(this.props.pos.x, this.props.pos.y, this.props.size, this.props.size);
    this.sprite.setCollider('circle');
    this.sprite.draw = () => this.draw();

    this.hitCollider = p5.createSprite(this.props.pos.x, this.props.pos.y, this.props.size + this.props.hitbox, this.props.size + this.props.hitbox);
    this.hitCollider.setCollider('circle');
    this.hitCollider.draw = () => {};
  }

  move() {
    this.sprite.velocity.x *= this.props.friction;
    this.sprite.velocity.y *= this.props.friction;
  }

  draw() {
    p5.noStroke();
    p5.fill(0, 0, 0, 35);
    p5.ellipse(0, 0, this.props.size + 17);

    p5.fill(255);
    p5.strokeWeight(4);
    p5.stroke(51);
    p5.ellipse(0, 0, this.props.size, this.props.size);
  }

  update() {
    this.move();

    this.hitCollider.position.x = this.sprite.position.x;
    this.hitCollider.position.y = this.sprite.position.y;

    p5.drawSprite(this.sprite);
    p5.drawSprite(this.hitCollider);
  }
}

export default Ball;