import { Webhook } from "discord-webhook-node";
import dotenv from "dotenv";
dotenv.config();

const webhook = new Webhook(process.env.DISCORD_WEBHOOK_URL ?? "");

export const log = (message: string) => {
  console.log(message);
  webhook.send(message);
};
