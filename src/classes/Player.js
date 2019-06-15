import drawMultiColorText from '../helpers/drawMultiColorText';
import getPositions from '../helpers/getPositions';

import keys from '../const/keys';

class Player {
  constructor(props, state) {
    this.props = props;

    this.keys = [];
    this._props = {
      size: 40,
      friction: .7
    };

    this.sprite = p5.createSprite(0, 0, this._props.size, this._props.size);
    this.sprite.restitution = .1;
    this.sprite.setCollider('circle');
    this.sprite.draw = () => this.draw();

    this.id = '_' + Math.random().toString(36).substr(2, 9);

    if(state) this.init(state);
  }

  init(state) {
    let pos = getPositions(state.scene.size);

    this.sprite.position.x = pos[this.props.team][ state.playerSpawns[this.props.team] ].x;
    this.sprite.position.y = pos[this.props.team][ state.playerSpawns[this.props.team] ].y;

    state.playerSpawns[this.props.team]++;

    if(this.props.controllable) {
      window.addEventListener('keydown', e => this.keys[e.keyCode] = true);
      window.addEventListener('keyup', e => this.keys[e.keyCode] = false);
    }
  }

  move() {
    if(this.keys[keys.KEY_UP[0]] || this.keys[keys.KEY_UP[1]]) {
      this.sprite.velocity.y = -this.props.speed;
    }
    
    if(this.keys[keys.KEY_DOWN[0]] || this.keys[keys.KEY_DOWN[1]]) {
      this.sprite.velocity.y = this.props.speed;
    }

    if(this.keys[keys.KEY_RIGHT[0]] || this.keys[keys.KEY_RIGHT[1]]) {
      this.sprite.velocity.x = this.props.speed;
    }

    if(this.keys[keys.KEY_LEFT[0]] || this.keys[keys.KEY_LEFT[1]]) {
      this.sprite.velocity.x = -this.props.speed;
    }

    this.sprite.velocity.y *= this._props.friction;
    this.sprite.velocity.x *= this._props.friction;
  }

  draw() {
    // shadow
    p5.noStroke();
    p5.fill(0, 0, 0, 35);
    p5.ellipse(0, 0, this._props.size + 17);

    // core
    p5.stroke(51);
    p5.strokeWeight(4);
    p5.fill(253, 200, 118);
    p5.ellipse(0, 0, this._props.size);
  }

  drawNameTag() {
    let teamColor = this.props.team === 0 ? [255, 75, 75] : [67, 149, 249];

    let text = [
      [this.isBot ? '[Bot] ' : '', [255]],
      [this.props.name, teamColor]
    ];

    p5.stroke(51);
    p5.strokeWeight(4);
    p5.textSize(21);
    p5.fill(teamColor);
    drawMultiColorText(text, this.sprite.position.x - (p5.textWidth(text[0][0] + text[1][0]) / 2), this.sprite.position.y - this._props.size * 0.8);
  }

  update() {
    this.move();

    p5.drawSprite(this.sprite);
  }
}

export default Player;