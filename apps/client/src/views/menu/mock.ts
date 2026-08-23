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
