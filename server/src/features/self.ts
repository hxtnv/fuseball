import { Router } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { PlayerData } from "../types/player";
import getCountryCodeFromTimezone from "../lib/helpers/get-country-code-from-timezone";

const selfFeature = Router();

selfFeature.get("/", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.toString() ?? "";
    const timezone = req.headers["timezone"]?.toString() ?? "";

    if (!token) {
      res.status(401).json({
        success: false,
        error: "No token provided",
      });
      return;
    }

    const playerData = jwt.verify(
      token,
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

    // save timezone to db
    // gipsy as heck but watdo at the moment
    if (playerDataDb.country_code === "") {
      const countryCode = getCountryCodeFromTimezone(timezone);

      await prisma.users.update({
        where: {
          id: playerDataDb.id,
        },
        data: {
          country_code: countryCode,
        },
      });
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
