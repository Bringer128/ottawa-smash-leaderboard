import fetch from "node-fetch";
import { readResults, writeLastMessages } from "./db.js";
import { formatToMessages } from "./message-formatter.js";
import { RateLimiter } from "limiter";

const limiter = new RateLimiter({ tokensPerInterval: 1, interval: "second" });

const TEST_SERVER_CHANNEL_ID = "1057467076639473768";
const CHANNEL_ID = "1058962408749682698";

export async function createDiscordMessage() {
  const apiToken = process.env.BOT_TOKEN;
  if (!apiToken) throw "Requires environment variable: BOT_TOKEN";

  const channelId = CHANNEL_ID;

  const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
  const headers = {
    Authorization: `Bot ${apiToken}`,
    "Content-Type": "application/json",
  };

  const results = await readResults();
  const messages = formatToMessages(results.results);

  const messageIds = [];
  for (let message of messages) {
    await limiter.removeTokens(1);
    const response = await fetch(url, {
      headers,
      method: "POST",
      body: JSON.stringify({
        content: message,
      }),
    });
    if (!response.ok) throw `Bad response: ${response.statusCode}`;
    const { id } = await response.json();
    messageIds.push({ id });
  }

  writeLastMessages({ channelId, messageIds });
}
