import Player from './Player';

import assignRandomName from '../helpers/assignRandomName';

class Bot extends Player {
  constructor(props, state) {
    super(props, state);

    this.props = props;
    this.props.name = assignRandomName(state.players);

    this.isBot = true;
    this.shouldMove = {x: false, y: false}; // 0 = x, 1 = y
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

  _update(state) {
    if(this.target) this.follow(this.target, state);

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
}

export default Bot;