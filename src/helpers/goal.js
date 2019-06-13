import getPositions from './getPositions';

const findUnusedPosId = (usedPos, team, state, callback) => {
  let pos = getPositions(state.scene.size);

  let id = Math.floor(Math.random() * pos[team].length);
  let taken = false;

  for(let i in usedPos) {
    if(usedPos[i] == pos[team][id]) taken = true;
  }

  if(taken) return findUnusedPosId(usedPos, team, state, callback);
  else return callback(pos[team][id]);
}



const goal = (side, state) => {
  if(!state.goals[side]) return;
  if(state.goals[side] && state.prevGoals[side]) return;
  if(state.isReset) return;
  if(!state.isLive) return;

  state.score[side == 0 ? 1 : 0]++;

  state.isReset = true;
  state.hud.teamScore(0, side, 2000);


  clearTimeout(state.goalTimeout);
  state.goalTimeout = null;

  state.goalTimeout = setTimeout(() => {
    state.ball.reset();

    // reset player positions
    let usedPos = [[], []];

    for(let i=0; i<state.players.length; i++) {
      let player = state.players[i];

      let id = findUnusedPosId(usedPos, player.props.team, state, (newPos) => {
        usedPos.push(newPos);

        player.sprite.position.x = newPos.x;
        player.sprite.position.y = newPos.y;
      });

      player.sprite.velocity.x = 0;
      player.sprite.velocity.y = 0;
    }
    
    state.isReset = false;
    state.isStarted = false;
    state.teamTurn = side;
  }, 2000);
}

export default goal;