const getTeamPlayers = (index) => {
  let list = [];

  for(let i in state.players) {
    if(state.players[i].team === index) list.push(state.players[i]);
  }

  return list;
}

export default getTeamPlayers;