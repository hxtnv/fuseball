import { Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { PlayerData } from "../types/player";

const selfFeature = Router();

selfFeature.get("/", async (req, res) => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      res.json({
        success: false,
        error: "No token provided",
      });
      return;
    }

    const playerData = jwt.verify(
      token.toString(),
      process.env.JWT_SECRET ?? "FUSEBALL_VERY_SECRET"
    ) as PlayerData;

    if (!playerData) {
      res.json({
        success: false,
        error: "Not signed in",
      });
      return;
    }

    const playerDataDb = await prisma.users.findFirst({
      where: { id: playerData.id },
    });

    if (!playerDataDb) {
      res.json({
        success: false,
        error: "Player not found",
      });
      return;
    }

    res.json({
      success: true,
      data: playerDataDb,
    });
  } catch (e) {
    res.json({
      success: false,
      error: "Failed",
    });
    return;
  }
});

export default selfFeature;
