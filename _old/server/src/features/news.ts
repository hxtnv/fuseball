import { Router } from "express";
import prisma from "../lib/prisma";

const newsFeature = Router();

const REFRESH_INTERVAL_MS = 60_000;

let cachedNews: unknown[] = [];

const refreshNews = async () => {
  try {
    cachedNews = await prisma.news.findMany({
      orderBy: {
        created_at: "desc",
      },
    });
  } catch (err) {
    // Keep serving the last good cache instead of crashing.
    console.error("[news] failed to refresh cache:", err);
  }
};

// Prime the cache on boot, then refresh on a fixed interval.
refreshNews();
setInterval(refreshNews, REFRESH_INTERVAL_MS).unref();

newsFeature.get("/", (req, res) => {
  res.json({
    success: true,
    data: cachedNews,
  });
});

export default newsFeature;
