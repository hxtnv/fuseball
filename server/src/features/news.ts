import { Router } from "express";
import prisma from "../lib/prisma";

const newsFeature = Router();

newsFeature.get("/", async (req, res) => {
  const data = await prisma.news.findMany({
    orderBy: {
      created_at: "desc",
    },
  });

  res.json({
    success: true,
    data,
  });
});

export default newsFeature;
