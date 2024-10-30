import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "./context.js";
import { ethers } from "ethers";
import { config } from "dotenv";
config({ path: ".env.local" });

const composer = new Composer<Context>();

const feature = composer.chatType("private");

const adminAccount = new ethers.Wallet(process.env.ADMIN_SECRET_KEY as string);

feature.command("start", async (ctx) => {
  const id = ctx.from?.id + "";
  const username = ctx.from?.username;
  const expiration = Date.now() + 600_000 * 12; // valid for 10 minutes
  const message = JSON.stringify({
    id,
    username,
    expiration,
  });

  const messageBytes = ethers.toUtf8Bytes(message);
  const authCode = await adminAccount.signMessage(messageBytes);

  const keyboard = new InlineKeyboard().webApp(
    "Launchify Game",
    `${
      process.env.FRONTEND_APP_ORIGIN
    }?signature=${authCode}&message=${encodeURIComponent(message)}`
  );
  return ctx.reply("Pick an app to launch.", { reply_markup: keyboard });
});

export { composer as startFeature };
