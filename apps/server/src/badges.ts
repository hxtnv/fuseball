// Badge catalog, transmitted to the client on load. Kept server-side (not in the
// client bundle) so image URLs / new badges can change without a client rebuild
// — handy when a portal (e.g. Poki) reprocesses every uploaded build.
//
// `name` is what's stored in User.badges. Later this can move to the database.

export interface Badge {
  name: string;
  label: string;
  image: string;
}

export const BADGES: Badge[] = [
  { name: "lb-gold", label: "Weekly Champion", image: "/badges/gold.png" },
  { name: "lb-silver", label: "Weekly Runner-up", image: "/badges/silver.png" },
  { name: "lb-bronze", label: "Weekly Bronze", image: "/badges/bronze.png" },
  { name: "lb-top10", label: "Weekly Top 10", image: "/badges/top10.png" },
];

// which badge a finishing rank (0-based) earns at week settlement
export const badgeForRank = (rank: number): string => {
  if (rank === 0) return "lb-gold";
  if (rank === 1) return "lb-silver";
  if (rank === 2) return "lb-bronze";
  return "lb-top10";
};

// per-award flavour line, e.g. "Top 1 · Week 16, 2026"
export const awardDescription = (
  rank: number,
  week: number,
  year: number,
): string => `Top ${rank + 1} · Week ${week}, ${year}`;
