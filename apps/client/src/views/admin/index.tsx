import { useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import {
  ArrowLeft,
  Gamepad2,
  Radio,
  Server,
  Target,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { fetchAdminStats, type AdminData } from "@/lib/auth";
import styles from "./admin.module.scss";

type Phase = "loading" | "ready" | "denied" | "error";

const pct = (part: number, whole: number): string =>
  whole === 0 ? "0%" : `${Math.round((part / whole) * 100)}%`;

export const AdminPage = () => {
  const [data, setData] = useState<AdminData | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    fetchAdminStats()
      .then((d) => {
        setData(d);
        setPhase("ready");
      })
      .catch((e: Error) => setPhase(e.message === "403" ? "denied" : "error"));
  }, []);

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

  const { stats, top } = data;

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
