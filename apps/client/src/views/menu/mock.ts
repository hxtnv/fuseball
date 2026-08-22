// Placeholder data for menu parts that aren't backed by the server yet
// (friends, news, leaderboard, rewards). Swap these for real API calls later.

export interface Friend {
  name: string;
  status: "online" | "in-game" | "offline";
}

export const MOCK_FRIENDS: Friend[] = [
  { name: "AtomicFalcon", status: "in-game" },
  { name: "LunarSweeper", status: "online" },
  { name: "PixelBaller", status: "online" },
  { name: "GrumpyRhino", status: "offline" },
  { name: "NovaKeeper", status: "offline" },
];

export interface NewsItem {
  title: string;
  date: string;
  body: string;
}

export const MOCK_NEWS: NewsItem[] = [
  {
    title: "The Name Tags Update",
    date: "Aug 21, 2026",
    body: "Player names now float above every baller, plus a slick new lobby.",
  },
  {
    title: "Accounts are here",
    date: "Aug 20, 2026",
    body: "Your stats now save. Sign in soon to sync across devices.",
  },
];

export interface LeaderRow {
  rank: number;
  name: string;
  wins: number;
  goals: number;
}

export const MOCK_LEADERBOARD: LeaderRow[] = [
  { rank: 1, name: "TurboStriker", wins: 412, goals: 1893 },
  { rank: 2, name: "IronCobra", wins: 388, goals: 1710 },
  { rank: 3, name: "SonicWinger", wins: 351, goals: 1655 },
  { rank: 4, name: "FrostyBull", wins: 297, goals: 1402 },
  { rank: 5, name: "CosmicHawk", wins: 271, goals: 1288 },
  { rank: 6, name: "WavyNomad", wins: 240, goals: 1120 },
  { rank: 7, name: "EpicViper", wins: 218, goals: 998 },
  { rank: 8, name: "JollyTitan", wins: 190, goals: 902 },
];

export interface Reward {
  day: number;
  label: string;
  claimed: boolean;
  today: boolean;
}

export const MOCK_REWARDS: Reward[] = [
  { day: 1, label: "100 coins", claimed: true, today: false },
  { day: 2, label: "150 coins", claimed: true, today: false },
  { day: 3, label: "Emote", claimed: false, today: true },
  { day: 4, label: "250 coins", claimed: false, today: false },
  { day: 5, label: "Trail", claimed: false, today: false },
  { day: 6, label: "400 coins", claimed: false, today: false },
  { day: 7, label: "Skin", claimed: false, today: false },
];
