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

export const EMOJIS: Emoji[] = EMOJI_SLUGS.map((slug) => ({
  slug,
  label: titleCase(slug),
  image: `/emojis/${slug}.png`,
  price: 100,
}));

const EMOJI_SET = new Set<string>(EMOJI_SLUGS);
export const isValidSkin = (slug: string): boolean => EMOJI_SET.has(slug);

// free starters — a random one is granted + equipped on account creation
export const NEW_PLAYER_EMOJIS = [
  "slightly-smiling-face",
  "grinning-face",
  "smiling-face-with-sunglasses",
];

export const randomStarter = (): string =>
  NEW_PLAYER_EMOJIS[Math.floor(Math.random() * NEW_PLAYER_EMOJIS.length)]!;

// used when an account has no skin selected (legacy accounts)
export const DEFAULT_EMOJI = NEW_PLAYER_EMOJIS[0]!;
