import Player from './Player';
import assignRandomName from '../helpers/assignRandomName';

class Bot extends Player {
  constructor(props, state) {
    super(props);

    this.props = props;
    this.props.name = assignRandomName(state.players);

    this.isBot = true;
    this.shouldMove = {x: false, y: false}; // 0 = x, 1 = y

    this.init(state);
  }

  isInRange(state, angle) {
    let raycastSize = 1800;
    let enemyTeam = this.props.team === 0 ? 1 : 0;
    let enemyGoal = state.scene.goals[enemyTeam];

    let x = Math.cos(angle * Math.PI / 180) * raycastSize + state.ball.sprite.position.x;
    let y = Math.sin(angle * Math.PI / 180) * raycastSize + state.ball.sprite.position.y;

    let shouldKick = false;

    if(enemyGoal.position.x >= state.ball.sprite.position.x) {
      shouldKick = enemyGoal.position.x >= state.ball.sprite.position.x && enemyGoal.position.x <= x;
    } else {
      shouldKick = state.ball.sprite.position.x >= enemyGoal.position.x && x <= enemyGoal.position.x;
    }

    // if(shouldKick) return state.ball.sprite.addSpeed(10, angle);
  }

  follow(target, state) {
    if(!state.isStarted && state.teamTurn !== this.props.team) return;

    this._shouldMove('x', target, state, (shouldMove, sign) => {
      this.sprite.velocity.x = shouldMove ? this.props.speed * (sign === 0 ? -1 : 1) : 0;
    });

    this._shouldMove('y', target, state, (shouldMove, sign) => {
      this.sprite.velocity.y = shouldMove ? this.props.speed * (sign === 0 ? -1 : 1) : 0;
    });


    this.sprite.velocity.y *= this._props.friction;
    this.sprite.velocity.x *= this._props.friction;
  }

  _shouldMove(axis, target, state, callback) {
    // default values
    let shouldMove = true;
    let sign = 0;

    let pos = this.sprite.position;
    let _target = {x: target.x, y: target.y};

    if(target[axis] <= pos[axis]) _target[axis] = _target[axis] + this._props.size - (state.ball.props.size / 2);
    else if(target[axis] > pos[axis]) _target[axis] = target[axis] - this._props.size + (state.ball.props.size / 2);

    sign = this.sprite.position[axis] > _target[axis] ? 0 : 1;

    if(Math.abs(_target[axis] - pos[axis]) <= 5) shouldMove = false; // if distance is less than 4, dont move

    return callback(shouldMove, sign);
  }
}

export default Bot;