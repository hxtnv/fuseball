import getPositions from './getPositions';

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
    let pos = getPositions(state.scene.size);

    let usedPos = [[], []];
    let playerIdInTeam = [0, 0];

    for(let i=0; i<state.players.length; i++) {
      let player = state.players[i];

      player.sprite.position.x = pos[player.props.team][playerIdInTeam[player.props.team]].x;
      player.sprite.position.y = pos[player.props.team][playerIdInTeam[player.props.team]].y;

      player.sprite.velocity.x = 0;
      player.sprite.velocity.y = 0;

      playerIdInTeam[player.props.team]++;
    }
    
    state.isReset = false;
    state.isStarted = false;
    state.teamTurn = side;
  }, 2000);
}

export default goal;