import { readResults, writeLastMessages } from "./db.js";
import { formatToMessages } from "./message-formatter.js";
import { RateLimiter } from "limiter";
import Discord from "discord/Discord.js";

const limiter = new RateLimiter({ tokensPerInterval: 1, interval: "second" });

const TEST_SERVER_CHANNEL_ID = "1057467076639473768";
const CHANNEL_ID = "1058962408749682698";

export async function createDiscordMessage() {
  const apiToken = process.env.BOT_TOKEN;
  if (!apiToken) throw "Requires environment variable: BOT_TOKEN";

  const channelId = CHANNEL_ID;
  const discord = new Discord({ channel: channel, apiToken });

  const results = await readResults();
  const messages = formatToMessages(results.results);

  const messageIds = [];
  for (let message of messages) {
    await limiter.removeTokens(1);
    const id = discord.postMessage(message);
    messageIds.push({ id });
  }

  writeLastMessages({ channelId, messageIds });
}
