import keys from '../const/keys';

class Player {
  constructor(props) {
    this.props = props;
    // this.p = p;

    this.velocity = {
      x: 0,
      y: 0
    }

    this.keys = [];

    this.sprite = p5.createSprite(this.props.pos.x, this.props.pos.y, this.props.size, this.props.size);
    this.sprite.restitution = .1;
    this.sprite.setCollider('circle');
    this.sprite.draw = () => this.draw();

    this.init();
  }

  init() {
    if(this.props.controllable) {
      window.addEventListener('keydown', e => this.keys[e.keyCode] = true);
      window.addEventListener('keyup', e => this.keys[e.keyCode] = false);
    }
  }

  move() {
    if(this.keys[keys.KEY_UP[0]] || this.keys[keys.KEY_UP[1]]) {
      // if (this.velocity.y > -this.props.speed) this.velocity.y--;
      this.sprite.velocity.y = -this.props.speed;
    }
    
    if(this.keys[keys.KEY_DOWN[0]] || this.keys[keys.KEY_DOWN[1]]) {
      // if (this.velocity.y < this.props.speed) this.velocity.y++;
      this.sprite.velocity.y = this.props.speed;
    }

    if(this.keys[keys.KEY_RIGHT[0]] || this.keys[keys.KEY_RIGHT[1]]) {
      // if (this.velocity.x < this.props.speed) this.velocity.x++;
      this.sprite.velocity.x = this.props.speed;
    }

    if(this.keys[keys.KEY_LEFT[0]] || this.keys[keys.KEY_LEFT[1]]) {
      // if (this.velocity.x > -this.props.speed) this.velocity.x--;
      this.sprite.velocity.x = -this.props.speed;
    }

    this.sprite.velocity.y *= this.props.friction;
    this.sprite.velocity.x *= this.props.friction;

    // this.sprite.position.y += this.velocity.y;
    // this.sprite.position.x += this.velocity.x;
  }

  draw() {
    // shadow
    p5.noStroke();
    p5.fill(0, 0, 0, 35);
    p5.ellipse(0, 0, this.props.size + 17);

    // core
    p5.stroke(51);
    p5.strokeWeight(4);
    p5.fill(253, 200, 118);
    p5.ellipse(0, 0, this.props.size);
  }

  update() {
    this.move();

    p5.drawSprite(this.sprite);
  }
}

export default Player;