import jwt from "jsonwebtoken";
import prisma from "../prisma";
import getRandomPlayerName from "./get-random-player-name";
import dotenv from "dotenv";
dotenv.config();

type Props = {
  email: string;
};

const authCreateAccount = async (payload: Props) => {
  const playerData = {
    name: getRandomPlayerName(),
    emoji: 0, // todo: get random emoji
    country_code: "",
    total_wins: 0,
    total_goals: 0,
    total_games: 0,
    xp: 0,
    timezone: "",
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

  return token;
};

export default authCreateAccount;
