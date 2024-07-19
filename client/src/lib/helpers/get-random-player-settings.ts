import EMOJIS from "@/lib/const/emojis";
import getRandomPlayerName from "@/lib/helpers/get-random-player-name";

const getRandomPlayerSettings = () => ({
  name: getRandomPlayerName(),
  emoji: Math.floor(Math.random() * EMOJIS.length),
});

export default getRandomPlayerSettings;
