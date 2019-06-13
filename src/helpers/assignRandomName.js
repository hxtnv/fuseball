import names from '../const/names';

const assignRandomName = (players) => {
  let id = Math.floor(Math.random() * names.length);
  let taken = false;

  for(let i in players) {
    if(players[i].name == names[id]) taken = true;
  }

  if(taken) return assignRandomName(players);
  else return names[id];
}

export default assignRandomName;