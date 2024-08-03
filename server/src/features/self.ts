import { Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { PlayerData } from "../types/player";

const selfFeature = Router();

selfFeature.get("/", async (req, res) => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      res.status(401).json({
        success: false,
        error: "No token provided",
      });
      return;
    }

    const playerData = jwt.verify(
      token.toString(),
      process.env.JWT_SECRET ?? "FUSEBALL_VERY_SECRET"
    ) as PlayerData;

    if (!playerData.authenticated) {
      res.json({
        success: true,
        data: {
          ...playerData,
          authenticated: false,
        },
      });
      return;
    }

    const playerDataDb = await prisma.users.findFirst({
      where: { id: playerData.id },
    });

    if (!playerDataDb) {
      res.status(404).json({
        success: false,
        error: "Player not found",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        ...playerDataDb,
        authenticated: true,
      },
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      error: "Failed",
    });
    return;
  }
});

export default selfFeature;
