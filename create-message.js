import fetch from "node-fetch";
import { readResults } from "./db.js";
import { formatMessage } from "./message-formatter.js";

const CHANNEL_ID = "1058962408749682698";

export async function createDiscordMessage() {
  const apiToken = process.env.BOT_TOKEN;
  if (!apiToken) throw "Requires environment variable: BOT_TOKEN";

  const url = `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`;
  const headers = {
    Authorization: `Bot ${apiToken}`,
    "Content-Type": "application/json",
  };

  const results = await readResults();
  const content = formatMessage(results.results);

  await fetch(url, {
    headers,
    method: "POST",
    body: JSON.stringify({
      content: content,
    }),
  });
}
