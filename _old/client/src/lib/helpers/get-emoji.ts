import EMOJIS from "@/lib/const/emojis";

const getEmoji = (index: number) => {
  if (isNaN(index)) return EMOJIS[0];

  return EMOJIS[index % EMOJIS.length];
};

export default getEmoji;
