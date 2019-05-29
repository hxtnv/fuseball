class Ball {
  constructor(props) {
    this.props = props;

    this.sprite = createSprite(this.props.pos.x, this.props.pos.y, this.props.size, this.props.size);
    this.sprite.setCollider('circle');
    this.sprite.draw = () => this.draw();

    this.hitCollider = createSprite(this.props.pos.x, this.props.pos.y, this.props.size + this.props.hitbox, this.props.size + this.props.hitbox);
    this.hitCollider.setCollider('circle');
    this.hitCollider.draw = () => {}
  }

  move() {
    this.sprite.velocity.x *= this.props.friction;
    this.sprite.velocity.y *= this.props.friction;
  }

  draw() {
    fill(255);
    strokeWeight(3);
    stroke(25);
    ellipse(0, 0, this.props.size, this.props.size);
  }

  update() {
    this.move();

    this.hitCollider.position.x = this.sprite.position.x;
    this.hitCollider.position.y = this.sprite.position.y;

    drawSprite(this.sprite);
    drawSprite(this.hitCollider);
  }
}