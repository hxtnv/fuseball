// Weekly leaderboard windows. Weeks start Monday 00:00 UTC so every player
// worldwide gets the same reset.

export const weekStartOf = (d: Date = new Date()): Date => {
  const dt = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const dow = dt.getUTCDay(); // 0=Sun..6=Sat
  const toMonday = dow === 0 ? -6 : 1 - dow;
  dt.setUTCDate(dt.getUTCDate() + toMonday);
  return dt;
};

export const nextWeekStart = (d: Date = new Date()): Date => {
  const w = weekStartOf(d);
  const n = new Date(w);
  n.setUTCDate(w.getUTCDate() + 7);
  return n;
};

export const prevWeekStart = (d: Date = new Date()): Date => {
  const w = weekStartOf(d);
  const p = new Date(w);
  p.setUTCDate(w.getUTCDate() - 7);
  return p;
};

// ISO week number + year, for human-readable badge descriptions
export const isoWeek = (d: Date): { week: number; year: number } => {
  const dt = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const day = dt.getUTCDay() || 7; // Mon=1..Sun=7
  dt.setUTCDate(dt.getUTCDate() + 4 - day); // Thursday of this week
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((dt.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return { week, year: dt.getUTCFullYear() };
};
