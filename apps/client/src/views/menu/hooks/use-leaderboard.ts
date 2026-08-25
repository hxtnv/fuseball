import { useEffect, useState } from "preact/hooks";
import { fetchLeaderboard, type BadgeAward } from "@/lib/auth";

export interface LbRow {
  rank: number;
  name: string;
  wins: number;
  goals: number;
  badges: BadgeAward[];
  skin?: string; // active emoji slug
  empty?: boolean; // placeholder slot when there aren't enough ranked players
}

type Status = "loading" | "ready" | "error";

export const useLeaderboard = (
  limit: number,
): { rows: LbRow[]; status: Status; resetsAt: number } => {
  const [rows, setRows] = useState<LbRow[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [resetsAt, setResetsAt] = useState(0);

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    fetchLeaderboard(limit)
      .then((result) => {
        if (!alive) return;
        setRows(
          result.players.map((p, i) => ({
            rank: i + 1,
            name: p.name,
            wins: p.wins,
            goals: p.goals,
            badges: p.badges,
            skin: p.skin,
          })),
        );
        setResetsAt(result.resetsAt);
        setStatus("ready");
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, [limit]);

  return { rows, status, resetsAt };
};

// pad a ranked list up to `count` with empty placeholder slots
export const padRows = (rows: LbRow[], count: number): LbRow[] => {
  const out = rows.slice(0, count);
  for (let i = out.length; i < count; i++)
    out.push({
      rank: i + 1,
      name: "No player",
      wins: 0,
      goals: 0,
      badges: [],
      empty: true,
    });
  return out;
};
