import { useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import {
  Activity,
  ArrowLeft,
  Clock,
  Gamepad2,
  LogOut,
  Radio,
  Server,
  Target,
  Timer,
  TrendingDown,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { Select } from "@/components/ui";
import {
  fetchActivity,
  fetchAdminStats,
  type AdminActivity,
  type AdminData,
} from "@/lib/auth";
import { BarChart, LineChart } from "./charts";
import styles from "./admin.module.scss";

type Phase = "loading" | "ready" | "denied" | "error";
type Gran = "all" | "day" | "week";

const pct = (part: number, whole: number): string =>
  whole === 0 ? "0%" : `${Math.round((part / whole) * 100)}%`;

const rate = (x: number): string => `${Math.round(x * 100)}%`;

const todayISO = (): string => new Date().toISOString().slice(0, 10);

// backfill a sparse daily series to a dense `days`-long window ending today
const fillDays = (
  points: { d: string; v: number }[],
  days: number,
): { label: string; value: number }[] => {
  const map = new Map(points.map((p) => [p.d, p.v]));
  const out: { label: string; value: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - i);
    const key = dt.toISOString().slice(0, 10);
    out.push({ label: key.slice(8, 10), value: map.get(key) ?? 0 });
  }
  return out;
};

const fmtDuration = (sec: number): string => {
  if (sec <= 0) return "0s";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
};

export const AdminPage = () => {
  const [data, setData] = useState<AdminData | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [gran, setGran] = useState<Gran>("all");
  const [date, setDate] = useState<string>(todayISO());
  const [activity, setActivity] = useState<AdminActivity | null>(null);

  useEffect(() => {
    fetchAdminStats()
      .then((d) => {
        setData(d);
        setPhase("ready");
      })
      .catch((e: Error) => setPhase(e.message === "403" ? "denied" : "error"));
  }, []);

  // swap the hour/weekday charts to the chosen range (or all-time from charts)
  useEffect(() => {
    if (!data) return;
    if (gran === "all") {
      setActivity({
        hourly: data.charts.hourly,
        weekday: data.charts.weekday,
      });
      return;
    }
    const from = new Date(`${date}T00:00:00`);
    const to = new Date(from);
    to.setDate(from.getDate() + (gran === "week" ? 7 : 1));
    let alive = true;
    fetchActivity(from.toISOString(), to.toISOString())
      .then((a) => alive && setActivity(a))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [data, gran, date]);

  if (phase !== "ready" || !data) {
    return (
      <div class={styles.admin}>
        <div class={styles.admin__center}>
          {phase === "loading" && "Loading analytics…"}
          {phase === "denied" && "You don't have access to this page."}
          {phase === "error" && "Couldn't load analytics."}
          {phase !== "loading" && (
            <a class={styles.admin__center__link} href="/">
              Back to menu
            </a>
          )}
        </div>
      </div>
    );
  }

  const { stats, top, charts } = data;
  const act = activity ?? { hourly: charts.hourly, weekday: charts.weekday };

  return (
    <div class={styles.admin}>
      <header class={styles.admin__head}>
        <a class={styles.admin__head__back} href="/">
          <ArrowLeft size={18} /> Menu
        </a>
        <h1 class={styles.admin__head__title}>Analytics</h1>
      </header>

      <div class={styles.admin__body}>
        <section class={styles.admin__section}>
          <h2 class={styles.admin__section__title}>Live</h2>
          <div class={styles.admin__grid}>
            <Card
              icon={<Radio />}
              label="Players online"
              value={stats.onlineNow}
              accent
            />
            <Card
              icon={<Server />}
              label="Servers online"
              value={`${stats.serversOnline} / ${stats.serversTotal}`}
            />
          </div>
        </section>

        <section class={styles.admin__section}>
          <h2 class={styles.admin__section__title}>Players</h2>
          <div class={styles.admin__grid}>
            <Card
              icon={<Users />}
              label="Total users"
              value={stats.totalUsers}
            />
            <Card
              icon={<UserPlus />}
              label="Signed in"
              value={stats.signedInUsers}
              sub={`${pct(stats.signedInUsers, stats.totalUsers)} converted`}
            />
            <Card
              icon={<UserPlus />}
              label="New today"
              value={stats.newToday}
            />
            <Card
              icon={<UserPlus />}
              label="New this week"
              value={stats.new7d}
            />
            <Card
              icon={<Radio />}
              label="Active today (DAU)"
              value={stats.activeToday}
            />
            <Card
              icon={<Radio />}
              label="Active 7d (WAU)"
              value={stats.active7d}
            />
            <Card icon={<Radio />} label="Active 30d (MAU)" value={stats.mau} />
            <Card
              icon={<Activity />}
              label="Stickiness"
              value={rate(stats.stickiness)}
              sub="DAU / MAU"
            />
            <Card
              icon={<TrendingDown />}
              label="Weekly churn"
              value={rate(stats.weeklyChurn)}
            />
          </div>
        </section>

        <section class={styles.admin__section}>
          <h2 class={styles.admin__section__title}>Gameplay</h2>
          <div class={styles.admin__grid}>
            <Card
              icon={<Gamepad2 />}
              label="Games played"
              value={stats.totalGames}
            />
            <Card
              icon={<Target />}
              label="Goals scored"
              value={stats.totalGoals}
            />
            <Card
              icon={<Trophy />}
              label="Total wins"
              value={stats.totalWins}
            />
            <Card
              icon={<Target />}
              label="Goals / game"
              value={
                stats.totalGames
                  ? (stats.totalGoals / stats.totalGames).toFixed(1)
                  : "0"
              }
            />
          </div>
        </section>

        <section class={styles.admin__section}>
          <h2 class={styles.admin__section__title}>Engagement</h2>
          <div class={styles.admin__grid}>
            <Card
              icon={<Timer />}
              label="Sessions"
              value={stats.totalSessions}
            />
            <Card
              icon={<Clock />}
              label="Total playtime"
              value={fmtDuration(stats.totalPlaytimeSec)}
            />
            <Card
              icon={<Clock />}
              label="Avg session"
              value={fmtDuration(stats.avgSessionSec)}
            />
            <Card
              icon={<Trophy />}
              label="Match completion"
              value={rate(stats.completionRate)}
              accent
            />
            <Card
              icon={<LogOut />}
              label="Mid-match quit rate"
              value={rate(stats.quitRate)}
              sub={`${stats.midMatchQuits.toLocaleString()} quits`}
            />
          </div>
        </section>

        <section class={styles.admin__section}>
          <h2 class={styles.admin__section__title}>Trends</h2>
          <div class={styles.admin__charts}>
            <div class={styles.admin__panel}>
              <h3 class={styles.admin__panel__title}>
                Concurrent players (24h)
              </h3>
              <LineChart points={charts.ccu} />
            </div>
            <div class={styles.admin__panel}>
              <h3 class={styles.admin__panel__title}>New users (14d)</h3>
              <BarChart bars={fillDays(charts.newUsers, 14)} />
            </div>
            <div class={styles.admin__panel}>
              <h3 class={styles.admin__panel__title}>
                Daily active users (14d)
              </h3>
              <BarChart bars={fillDays(charts.dau, 14)} />
            </div>
            <div class={styles.admin__panel}>
              <h3 class={styles.admin__panel__title}>Retention</h3>
              <p class={styles.admin__panel__hint}>
                Of players who joined N days ago, the % who came back to play on
                day N.
              </p>
              <BarChart
                bars={charts.retention.map((r) => ({
                  label: r.label,
                  value: Math.round(r.value * 100),
                }))}
                max={100}
                format={(v) => `${v}%`}
              />
            </div>
          </div>
        </section>

        <section class={styles.admin__section}>
          <div class={styles.admin__activityHead}>
            <h2 class={styles.admin__section__title}>Activity</h2>
            <div class={styles.admin__range}>
              <Select
                class={styles.admin__range__select}
                value={gran}
                onChange={(v) => setGran(v as Gran)}
                options={[
                  { label: "All time (avg)", value: "all" },
                  { label: "Single day", value: "day" },
                  { label: "Week from", value: "week" },
                ]}
              />
              {gran !== "all" && (
                <input
                  class={styles.admin__range__date}
                  type="date"
                  value={date}
                  max={todayISO()}
                  onInput={(e) =>
                    setDate((e.currentTarget as HTMLInputElement).value)
                  }
                />
              )}
            </div>
          </div>
          <div class={styles.admin__charts}>
            <div class={styles.admin__panel}>
              <h3 class={styles.admin__panel__title}>Players by hour</h3>
              <BarChart bars={act.hourly} />
            </div>
            <div class={styles.admin__panel}>
              <h3 class={styles.admin__panel__title}>Players by weekday</h3>
              <BarChart bars={act.weekday} />
            </div>
          </div>
        </section>

        <section class={styles.admin__section}>
          <h2 class={styles.admin__section__title}>Top players</h2>
          <div class={styles.admin__table}>
            <div class={styles.admin__table__head}>
              <span>#</span>
              <span>Player</span>
              <span>Wins</span>
              <span>Goals</span>
            </div>
            {top.length === 0 && (
              <div class={styles.admin__table__empty}>
                No ranked players yet.
              </div>
            )}
            {top.map((p, i) => (
              <div class={styles.admin__table__row} key={p.id}>
                <span>{i + 1}</span>
                <span>{p.name}</span>
                <span>{p.wins}</span>
                <span>{p.goals}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

interface CardProps {
  icon: ComponentChildren;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

const Card = ({ icon, label, value, sub, accent }: CardProps) => (
  <div class={styles.card} data-accent={accent ? "true" : undefined}>
    <span class={styles.card__icon}>{icon}</span>
    <span class={styles.card__value}>
      {typeof value === "number" ? value.toLocaleString() : value}
    </span>
    <span class={styles.card__label}>{label}</span>
    {sub && <span class={styles.card__sub}>{sub}</span>}
  </div>
);
