import { Router } from "express";
import dotenv from "dotenv";
import prisma from "../../lib/prisma";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import authCreateAccount from "../../lib/helpers/auth-create-account";
import DiscordOauth2 from "discord-oauth2";

dotenv.config();
const authFeature = Router();
const oauth = new DiscordOauth2({
  clientId: process.env.OAUTH_DISCORD_CLIENT_ID,
  clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET,
  redirectUri: "http://localhost:8080/auth/discord/callback",
});

authFeature.get("/", (req, res) => {
  const redirectURL = `${process.env.BACKEND_URL}/auth/discord/callback`;

  return res.redirect(
    `https://discord.com/oauth2/authorize?client_id=${
      process.env.OAUTH_DISCORD_CLIENT_ID
    }&response_type=code&redirect_uri=${encodeURIComponent(
      redirectURL
    )}&scope=email`
  );
});

authFeature.get("/callback", async (req, res) => {
  oauth
    .tokenRequest({
      code: req.query.code?.toString() ?? "",
      scope: "identify guilds",
      grantType: "authorization_code",
    })
    .then(({ access_token }) => {
      oauth.getUser(access_token).then(async (user) => {
        const playerDataDb = await prisma.users.findFirst({
          where: { email: user.email },
        });

        // todo: combine this into one function
        if (playerDataDb) {
          const token = jwt.sign(
            {
              ...playerDataDb,
              authenticated: true,
            },
            process.env.JWT_SECRET ?? "FUSEBALL_VERY_SECRET"
          );

          return res.redirect(
            `${process.env.FRONTEND_URL}/auth/callback/${token}`
          );
        }

        // new sign up
        const token = await authCreateAccount({
          email: user.email ?? "",
          name: user.global_name ?? "",
        });
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/callback/${token}`
        );
      });
    })
    .catch((err) => {
      return res.json({ success: true, message: "Something went wrong" });
    });
});

export default authFeature;
