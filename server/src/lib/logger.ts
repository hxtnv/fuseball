import { Webhook } from "discord-webhook-node";
import dotenv from "dotenv";
dotenv.config();

const webhook = process.env.DISCORD_WEBHOOK_URL
  ? new Webhook(process.env.DISCORD_WEBHOOK_URL ?? "")
  : { send: () => {} };

export const log = (message: string) => {
  console.log(message);
  webhook.send(message);
};
