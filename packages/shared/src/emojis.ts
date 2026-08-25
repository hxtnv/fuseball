import { EMOJI_SLUGS } from "./emoji-slugs";

// Emoji cosmetic catalog. Lives in shared so client + server use one source of
// truth: the client renders it with zero network fetch (it ships in the bundle),
// and the server validates skins + assigns starters from the same list. Image
// files are static assets under the client's /emojis/ (CDN).

export interface Emoji {
  slug: string;
  label: string;
  image: string;
  price: number;
}

const titleCase = (slug: string): string =>
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// free starters — a random one is granted + equipped on account creation
export const NEW_PLAYER_EMOJIS = [
  "slightly-smiling-face",
  "grinning-face",
  "smiling-face-with-sunglasses",
];

// Placeholder pricing: deterministic coin tiers keyed off the slug so the store
// shows variety when sorted by price. Starters are free. Curate a real table later.
const PRICE_TIERS = [
  500, 900, 1500, 2500, 4000, 6000, 9000, 14000, 22000, 35000,
];
const priceFor = (slug: string): number => {
  if (NEW_PLAYER_EMOJIS.includes(slug)) return 0;
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PRICE_TIERS[h % PRICE_TIERS.length]!;
};

export const EMOJIS: Emoji[] = EMOJI_SLUGS.map((slug) => ({
  slug,
  label: titleCase(slug),
  image: `/emojis/${slug}.png`,
  price: priceFor(slug),
}));

const EMOJI_SET = new Set<string>(EMOJI_SLUGS);
export const isValidSkin = (slug: string): boolean => EMOJI_SET.has(slug);

export const randomStarter = (): string =>
  NEW_PLAYER_EMOJIS[Math.floor(Math.random() * NEW_PLAYER_EMOJIS.length)]!;

// used when an account has no skin selected (legacy accounts)
export const DEFAULT_EMOJI = NEW_PLAYER_EMOJIS[0]!;
