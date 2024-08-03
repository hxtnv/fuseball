import { Router } from "express";
import google from "./google";
import discord from "./discord";

const authFeature = Router();

authFeature.use("/google", google);
authFeature.use("/discord", discord);

export default authFeature;
