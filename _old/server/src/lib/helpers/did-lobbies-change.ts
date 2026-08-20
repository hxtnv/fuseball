const deepEqualArray = (arr1: any[], arr2: any[]): boolean => {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
};

const didLobbiesChange = (x: any[], y: any[]) => {
  if (x.length !== y.length) {
    return true;
  }

  return x.some((xItem, index) => {
    const yItem = y[index];

    if (!deepEqualArray(xItem.score, yItem.score)) {
      return true;
    }

    const xPlayerIds = xItem.players.map((player: any) => player.id);
    const yPlayerIds = yItem.players.map((player: any) => player.id);

    if (!deepEqualArray(xPlayerIds, yPlayerIds)) {
      return true;
    }

    if (xItem.status !== yItem.status) {
      return true;
    }

    return false;
  });
};

export default didLobbiesChange;
