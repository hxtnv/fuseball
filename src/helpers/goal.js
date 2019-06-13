const goal = (side, state) => {
  if(!state.goals[side]) return;
  if(state.goals[side] && state.prevGoals[side]) return;
  if(state.isReset) return;

  state.hud.score[side == 0 ? 1 : 0]++;

  state.isReset = true;
  state.hud.teamScore(0, side);


  clearTimeout(state.goalTimeout);
  state.goalTimeout = null;

  state.goalTimeout = setTimeout(() => {
    state.ball.reset();

    for(let i in state.players) {
      state.players[i].sprite.position.x = i == 0 ? 300 : -300; // todo IMPORTANT: save position somewhere
      state.players[i].sprite.position.y = 0; // this too

      state.players[i].sprite.velocity.x = 0;
      state.players[i].sprite.velocity.y = 0;
    }
    
    state.isReset = false;
    state.isStarted = false;
    state.teamTurn = side;
  }, 2000);
}

export default goal;