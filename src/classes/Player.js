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

    this.init(state);
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

  update(state) {
    this.move();
    if(this.isBot) this._update(state);

    // kick
    this.isInRange = false;

    this.sprite.overlap(state.ball.hitCollider, () => {
      this.isInRange = true;
      this.angle = Math.atan2(state.ball.sprite.position.y - this.sprite.position.y, state.ball.sprite.position.x - this.sprite.position.x) * 180 / Math.PI;

      if(!this.isBot) {
        for(let j in keys.KICK) {
          if(this.keys[keys.KICK[j]]) {
            if(!state.isStarted) state.isStarted = true; // mark game as started aswell
            return state.ball.sprite.addSpeed(10, this.angle);
          }
        }
      } else {
        if(!state.isStarted) state.isStarted = true;
      }

      // raycast
      // if(this.isBot) {
      //   let x = Math.cos(angle * Math.PI / 180) * this._ray + this.sprite.position.x;
      //   let y = Math.sin(angle * Math.PI / 180) * this._ray + this.sprite.position.y;

      //   this._ray += 50; // speed
      //   if(x <= -1000 || x >= 1000 || y <= -500 || y >= 500) this._ray = 0; // reset

      //   this.ray.sprite.position.x = x;
      //   this.ray.sprite.position.y = y;

      //   this.ray.update(state, this.enemy, this.id, (shouldKick) => {
      //     if(shouldKick) return state.ball.sprite.addSpeed(10, angle);
      //   });
      // }
    });



    // ball interaction
    this.sprite.collide(state.scene.col);
    this.sprite.bounce(state.ball.sprite, () => {
      if(!state.isStarted) state.isStarted = true;
    });

    // middle border collision
    if(this.props.team !== state.teamTurn && !state.isStarted) {
      this.sprite.collide(state.scene.middle);
    }

    // sides collision
    if (!state.isStarted) {
      this.sprite.collide(state.scene.sides[this.props.team === 0 ? 1 : 0]);
    }

    // player collision
    for(let j=0; j<state.players.length; j++) {
      if(state.players[j].id !== this.id) this.sprite.bounce(state.players[j].sprite);
    }

    if(this.props.controllable) p5.camera.position = this.sprite.position; // follow player

    p5.drawSprite(this.sprite);
  }
}

export default Player;