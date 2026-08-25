// Random display-name generator for anonymous accounts (football-flavoured).
const ADJECTIVES = [
  "Swift",
  "Clever",
  "Mighty",
  "Sneaky",
  "Golden",
  "Rapid",
  "Brave",
  "Wild",
  "Cosmic",
  "Turbo",
  "Silent",
  "Lucky",
  "Fierce",
  "Sonic",
  "Frosty",
  "Blazing",
  "Nimble",
  "Rowdy",
  "Dizzy",
  "Epic",
  "Rogue",
  "Jolly",
  "Zippy",
  "Feral",
  "Atomic",
  "Vivid",
  "Grumpy",
  "Wavy",
  "Snappy",
  "Bouncy",
];

const NOUNS = [
  "Striker",
  "Keeper",
  "Winger",
  "Baller",
  "Sweeper",
  "Captain",
  "Playmaker",
  "Rocket",
  "Comet",
  "Panther",
  "Falcon",
  "Tiger",
  "Viper",
  "Rhino",
  "Bull",
  "Shark",
  "Hawk",
  "Wolf",
  "Cobra",
  "Dragon",
  "Phoenix",
  "Bandit",
  "Maverick",
  "Ninja",
  "Wizard",
  "Goblin",
  "Titan",
  "Ranger",
  "Nomad",
  "Jet",
];

const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]!;

export const generateName = (): string =>
  `${pick(ADJECTIVES)}${pick(NOUNS)}${Math.floor(Math.random() * 90 + 10)}`;

export const NAME_MIN = 3;
export const NAME_MAX = 16;

// Clean a user-supplied name: strip control chars, collapse whitespace, clamp.
// Returns null if the result is too short (caller keeps the old name).
export const sanitizeName = (raw: string): string | null => {
  const cleaned = raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, NAME_MAX);
  return cleaned.length >= NAME_MIN ? cleaned : null;
};
