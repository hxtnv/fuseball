const adjectives = [
  "quick",
  "lazy",
  "happy",
  "sad",
  "angry",
  "joyful",
  "brave",
  "calm",
  "eager",
  "fancy",
  "glad",
  "jolly",
  "kind",
  "lucky",
  "proud",
  "silly",
  "witty",
  "zany",
];

const nouns = [
  "lion",
  "tiger",
  "bear",
  "fox",
  "eagle",
  "shark",
  "wolf",
  "panda",
  "koala",
  "dragon",
  "unicorn",
  "phoenix",
  "griffin",
  "turtle",
  "owl",
  "hawk",
  "falcon",
  "panther",
];

const capitalize = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

const getRandomElement = (arr: string[]) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const getRandomPlayerName = () => {
  const adjective = capitalize(getRandomElement(adjectives));
  const noun = capitalize(getRandomElement(nouns));
  const number = Math.floor(Math.random() * 9999);

  return `${adjective}${noun}${number}`;
};

export default getRandomPlayerName;
