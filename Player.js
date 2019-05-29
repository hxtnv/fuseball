const KEYS = {
  KEY_UP: [87, 38],
  KEY_RIGHT: [68, 39],
  KEY_DOWN: [83, 40],
  KEY_LEFT: [65, 37],
  KICK: [88, 32, 17, 16] // x, space, lctrl, lshift
}

class Player {
  constructor(props) {
    this.props = props;

    this.velocity = {
      x: 0,
      y: 0
    }

    this.keys = [];

    this.sprite = createSprite(this.props.pos.x, this.props.pos.y, this.props.size, this.props.size);
    this.sprite.setCollider('circle');
    this.sprite.draw = () => this.draw();

    this.init();
  }

  init() {
    window.addEventListener('keydown', e => this.keys[e.keyCode] = true);
    window.addEventListener('keyup', e => this.keys[e.keyCode] = false);
  }

  move() {
    if(this.keys[KEYS.KEY_UP[0]] || this.keys[KEYS.KEY_UP[1]]) {
      // if (this.velocity.y > -this.props.speed) this.velocity.y--;
      this.sprite.velocity.y = -this.props.speed;
    }
    
    if(this.keys[KEYS.KEY_DOWN[0]] || this.keys[KEYS.KEY_DOWN[1]]) {
      // if (this.velocity.y < this.props.speed) this.velocity.y++;
      this.sprite.velocity.y = this.props.speed;
    }

    if(this.keys[KEYS.KEY_RIGHT[0]] || this.keys[KEYS.KEY_RIGHT[1]]) {
      // if (this.velocity.x < this.props.speed) this.velocity.x++;
      this.sprite.velocity.x = this.props.speed;
    }

    if(this.keys[KEYS.KEY_LEFT[0]] || this.keys[KEYS.KEY_LEFT[1]]) {
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
    noStroke();
    fill(0, 0, 0, 35);
    ellipse(0, 0, this.props.size + 17);

    // core
    stroke(51);
    strokeWeight(4);
    fill(253, 200, 118);
    ellipse(0, 0, this.props.size);
  }

  update() {
    this.move();

    drawSprite(this.sprite);
  }
}