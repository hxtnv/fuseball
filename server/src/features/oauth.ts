import { Router } from "express";
import dotenv from "dotenv";
import prisma from "../lib/prisma";
import getRandomPlayerName from "../lib/helpers/get-random-player-name";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import authCreateAccount from "../lib/helpers/auth-create-account";

dotenv.config();
const authFeature = Router();

type GooglePayload = {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
};

const oauth2Client = new OAuth2Client(
  process.env.OAUTH_GOOGLE_CLIENT_ID,
  process.env.OAUTH_GOOGLE_CLIENT_SECRET,
  "http://localhost:8080/auth/google/callback"
);

authFeature.get("/google", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
  res.redirect(authUrl);
});

authFeature.get("/google/callback", async (req, res) => {
  // @ts-ignore
  const { tokens } = await oauth2Client.getToken(req.query.code);

  oauth2Client.setCredentials(tokens);

  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.OAUTH_GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload() as GooglePayload;

  const playerDataDb = await prisma.users.findFirst({
    where: { email: payload.email },
  });

  if (playerDataDb) {
    const token = jwt.sign(
      {
        ...playerDataDb,
        authenticated: true,
      },
      process.env.JWT_SECRET ?? "FUSEBALL_VERY_SECRET"
    );

    return res.redirect(`${process.env.FRONTEND_URL}/auth/callback/${token}`);
  }

  // new sign up
  const token = await authCreateAccount({
    email: payload.email,
  });
  return res.redirect(`${process.env.FRONTEND_URL}/auth/callback/${token}`);

  /*
  const playerData = {
    timezone: "",
    name: getRandomPlayerName(),
    emoji: 0, // todo: get random emoji
    country_code: "",
    total_wins: 0,
    total_goals: 0,
    total_games: 0,
    xp: 0,
    email: payload.email,
  };
  
  const playerDataInsert = await prisma.users.create({ data: playerData });

  const token = jwt.sign(
    {
      ...playerData,
      id: playerDataInsert.id,
      authenticated: true,
    },
    process.env.JWT_SECRET ?? "FUSEBALL_VERY_SECRET"
  );

  return res.redirect(`${process.env.FRONTEND_URL}/auth/callback/${token}`);
  */
});

export default authFeature;
