import { readResults, readLastMessages, writeLastMessages } from "./db.js";
import { formatToMessages } from "./message-formatter.js";
import { RateLimiter } from "limiter";
import Discord from "./discord/Discord.js";

const limiter = new RateLimiter({ tokensPerInterval: 1, interval: "second" });

const TEST_SERVER_CHANNEL_ID = "1057467076639473768";
const CHANNEL_ID = "1058962408749682698";

export async function editLastDiscordMessages() {
  const apiToken = process.env.BOT_TOKEN;
  if (!apiToken) throw "Requires environment variable: BOT_TOKEN";

  const channelId = CHANNEL_ID;
  const discord = new Discord({ channel: channelId, apiToken });

  const lastMessageId = await discord.getLastMessageInChannel();

  const results = await readResults();
  const messages = formatToMessages(results.results);
  const lastMessages = await readLastMessages(channelId);

  if (
    lastMessages &&
    lastMessages.includes(lastMessageId) &&
    lastMessages.length == messages.length
  ) {
    // We can edit
    const updates = lastMessages.map((id, index) => ({
      id,
      content: messages[index],
    }));

    for (let { id, content } of updates) {
      await limiter.removeTokens(1);
      discord.editMessage(id, content);
    }
  } else {
    // We must create - we're not the latest, or the number of messages has changed
    // so we can't just go back and edit them.
    const ids = [];
    for (let message of messages) {
      await limiter.removeTokens(1);
      const id = await discord.createMessage(message);
      ids.push(id);
    }
    await writeLastMessages({ channelId, messageIds: ids });
  }
}
