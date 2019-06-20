import Player from './Player';
// import Raycast from './Raycast';

import assignRandomName from '../helpers/assignRandomName';

class Bot extends Player {
  constructor(props, state) {
    super(props, state);

    this.props = props;
    this.props.name = assignRandomName(state.players);

    this.isBot = true;
    this.shouldMove = {x: false, y: false}; // 0 = x, 1 = y

    // raycast
    /*this.rays = [];
    this.rayLength = 0;

    for(let i=0; i<30; i++) this.rays[i] = new Raycast(0, 0, 20, this.id);*/
  }

  follow(target, state) {
    if(!state.isStarted && state.teamTurn !== this.props.team) return;

    let _shouldMove = [0, 0];

    this._shouldMove('x', target, state, (shouldMove, sign) => {
      _shouldMove[0] = shouldMove;
      this.sprite.velocity.x = shouldMove ? this.props.speed * (sign === 0 ? -1 : 1) : 0;
    });

    this._shouldMove('y', target, state, (shouldMove, sign) => {
      _shouldMove[1] = shouldMove;
      this.sprite.velocity.y = shouldMove ? this.props.speed * (sign === 0 ? -1 : 1) : 0;
    });


    this.sprite.velocity.y *= this._props.friction;
    this.sprite.velocity.x *= this._props.friction;

    if(!_shouldMove[0] && !_shouldMove[1] && this.isInRange) {
      return state.ball.sprite.addSpeed(7, this.angle);
    }
  }

  _shouldMove(axis, target, state, callback) {
    let pos = this.sprite.position;
    let _target = {x: target.x, y: target.y};

    let shouldMove = Math.abs(_target[axis] - pos[axis]) > 5;
    let sign = this.sprite.position[axis] > _target[axis] ? 0 : 1;

    return callback(shouldMove, sign);
  }

  /*goTo(x, y) {
    let pos = this.sprite.position;
    let vel = this.sprite.velocity;

    let s = [pos.x > x ? -1 : 1, pos.y > y ? -1 : 1]; // x y
    // console.log(s);

    if(pos.x !== x) vel.x = 3 * s[0];
    if(pos.y !== y) vel.y = 3 * s[1];
  }*/

  _update(state) {
    if(this.target) this.follow(this.target, state);

    /*for(let i=0; i<this.rays.length; i++) {
      
      let ray = this.rays[i];

      let a = (360 / this.rays.length) * i;
      let x = Math.cos(a * Math.PI / 180) * this.rayLength + this.sprite.position.x;
      let y = Math.sin(a * Math.PI / 180) * this.rayLength + this.sprite.position.y;

      ray.sprite.position.x = x;
      ray.sprite.position.y = y;

      if(this.rayLength >= 600) this.rayLength = 0;

      ray.update(state, (hit, pos, desc) => {
        // if(hit) console.log(`hit something at `, pos);
        // console.log(desc);
        // if(desc == 'ball') this.target = pos;
      });
    }*/

    // if(this.target) this.goTo(this.target.x, this.target.y);

    // this.rayLength += 50;

    let enemGoal = state.scene.goals[this.props.team === 0 ? 1 : 0];
    let enemGoalPoint = {
      x: enemGoal.position.x - (enemGoal.width / 2),
      y: enemGoal.position.y
    }

    let angleBetweenBallAndGoal = Math.atan2(state.ball.sprite.position.y - enemGoalPoint.y, state.ball.sprite.position.x - enemGoalPoint.x) * 180 / Math.PI;

    // x and y are where bot is supposed to be to shoot
    let x = Math.cos(angleBetweenBallAndGoal * Math.PI / 180) * this._props.size + state.ball.sprite.position.x;
    let y = Math.sin(angleBetweenBallAndGoal * Math.PI / 180) * this._props.size + state.ball.sprite.position.y;

    this.target = {x: x, y: y};
  }

  // __isInRange(state) {
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
}

export default Bot;