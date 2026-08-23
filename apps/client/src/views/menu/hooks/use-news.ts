import { useEffect, useState } from "preact/hooks";
import { fetchNews, type NewsItem } from "@/lib/auth";

type Status = "loading" | "ready" | "error";

export const useNews = (
  limit: number,
): { news: NewsItem[]; status: Status } => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    fetchNews(limit)
      .then((items) => {
        if (!alive) return;
        setNews(items);
        setStatus("ready");
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, [limit]);

  return { news, status };
};

export const formatNewsDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
