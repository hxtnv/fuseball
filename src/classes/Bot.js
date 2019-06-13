import Player from './Player';
import assignRandomName from '../helpers/assignRandomName';

class Bot extends Player {
  constructor(props, players) {
    super(props);

    this.props = props;
    this.props.name = assignRandomName(players);

    this.isBot = true;
    this.shouldMove = {x: false, y: false}; // 0 = x, 1 = y
  }

  follow(target) {
    let pos = this.sprite.position;
    let sign = {x: 0, y: 0}; // 0 = -, 1 = +

    
    // x
    if(this.sprite.position.x > target.x) sign.x = 0;
    else sign.x = 1;

    if(pos.x <= target.x + this.props.speed && pos.x >= target.x - this.props.speed) this.shouldMove.x = false;
    else this.shouldMove.x = true;

    this.sprite.velocity.x = 0;

    if(this.shouldMove.x) {
      if(sign.x === 0) this.sprite.velocity.x = -this.props.speed;
      else if(sign.x === 1) this.sprite.velocity.x = this.props.speed;
    }

    // y
    if(this.sprite.position.y > target.y) sign.y = 0;
    else sign.y = 1;

    if(pos.y <= target.y + this.props.speed && pos.y >= target.y - this.props.speed) this.shouldMove.y = false;
    else this.shouldMove.y = true;

    this.sprite.velocity.y = 0;

    if(this.shouldMove.y) {
      if(sign.y === 0) this.sprite.velocity.y = -this.props.speed;
      else if(sign.y === 1) this.sprite.velocity.y = this.props.speed;
    }

    this.sprite.velocity.y *= this.props.friction;
    this.sprite.velocity.x *= this.props.friction;
  }
}

export default Bot;