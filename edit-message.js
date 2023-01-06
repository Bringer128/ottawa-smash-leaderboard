import fetch from "node-fetch";
import { readResults, readLastMessages } from "./db.js";
import { formatToMessages } from "./message-formatter.js";
import { RateLimiter } from "limiter";
import { createDiscordMessage } from "./create-message.js";

const limiter = new RateLimiter({ tokensPerInterval: 1, interval: "second" });

const TEST_SERVER_CHANNEL_ID = "1057467076639473768";
const CHANNEL_ID = "1058962408749682698";

async function getLastMessageInChannel(channelId, apiToken) {
  const url = `https://discord.com/api/v10/channels/${channelId}`;
  const headers = {
    Authorization: `Bot ${apiToken}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, { headers });
  const json = response.json();
  return json.last_message_id;
}

export async function editLastDiscordMessage() {
  const apiToken = process.env.BOT_TOKEN;
  if (!apiToken) throw "Requires environment variable: BOT_TOKEN";

  const channelId = CHANNEL_ID;

  const lastMessageId = await getLastMessageInChannel(channelId, apiToken);

  const results = await readResults();
  const messages = formatToMessages(results.results);
  const lastMessages = await readLastMessages(channelId);
  if (
    lastMessages.include(lastMessageId) &&
    lastMessages.length == messages.length
  ) {
    // We can edit
    const updates = lastMessages.map((id, index) => ({
      id,
      content: messages[index],
    }));
    for (let { id, content } of updates) {
      await limiter.removeTokens(1);
      const url = `https://discord.com/api/v10/channels/${channelId}/messages/${id}`;
      const headers = {
        Authorization: `Bot ${apiToken}`,
        "Content-Type": "application/json",
      };
      await fetch(url, {
        headers,
        method: "PATCH",
        content,
      });
    }
  } else {
    // We must create - we're not the latest, or the number of messages has changed
    // so we can't just go back and edit them.
    await createDiscordMessage();
  }
}
