import { readResults, readLastMessages, writeLastMessages } from "./db.js";
import { formatToMessages } from "./message-formatter.js";
import { RateLimiter } from "limiter";
import Discord from "./discord/Discord.js";

const limiter = new RateLimiter({ tokensPerInterval: 1, interval: "second" });

const TEST_SERVER_CHANNEL_ID = "1057467076639473768";
const CHANNEL_ID = "1058962408749682698";

/*export async function editLastDiscordMessages() {
  const apiToken = process.env.BOT_TOKEN;
  if (!apiToken) throw "Requires environment variable: BOT_TOKEN";

  const channelId = CHANNEL_ID;
  const discord = new Discord({ channel: channelId, apiToken });

  const lastMessageId = await discord.getLastMessageInChannel();

  const results = await readResults();
  const messages = formatToMessages(results);

  const fullLeaderboard = messages.join("\n");
  const safeText = fullLeaderboard.slice(0, 4096); // Discord embed limit

  const embed = {
    title: "🏆 Ottawa Smash Leaderboard",
    description: safeText,
    color: 0xffcc00,
    timestamp: new Date().toISOString(),
  };

  const lastMessages = await readLastMessages(channelId);

  if (
    lastMessageId &&
    lastMessages &&
    lastMessages.includes(lastMessageId) &&
    lastMessages.length == messages.length
  ) {

    const embeds = messages.map((msg, i) => ({
      title: i === 0 ? "🏆 Ottawa Smash Leaderboard" : undefined,
      description: msg,
      color: 0xffcc00,
    }));

    await limiter.removeTokens(1);
    await discord.editMessage(lastMessageId, { embeds: [embed] });

  }

  else {
    // We must create - we're not the latest, or the number of messages has changed
    // so we can't just go back and edit them.

    await limiter.removeTokens(1);
    const id = await discord.createMessage({ embeds: [embed] });
    const ids = [id];
    await writeLastMessages({ channelId, messageIds: ids });
  }
}*/

export async function editLastDiscordMessages() {
  const apiToken = process.env.BOT_TOKEN;
  if (!apiToken) throw "Requires environment variable: BOT_TOKEN";

  const channelId = CHANNEL_ID;
  const discord = new Discord({ channel: channelId, apiToken });

  const lastMessageId = await discord.getLastMessageInChannel();
  const lastMessages = await readLastMessages(channelId);

  const results = await readResults();
  const messages = formatToMessages(results); // split by 4000-char limit

  const embeds = messages.map((msg, i) => ({
    title: i === 0 ? "🏆 Ottawa Smash Leaderboard" : undefined,
    description: msg,
    color: 0xffcc00,
    timestamp: new Date().toISOString(),
  }));

  // Reuse only if message count and IDs match
  const canEdit = lastMessageId &&
    lastMessages &&
    lastMessages.length === embeds.length &&
    lastMessages.includes(lastMessageId);

  if (canEdit) {
    for (let i = 0; i < lastMessages.length; i++) {
      await limiter.removeTokens(1);
      await discord.editMessage(lastMessages[i], { embeds: [embeds[i]] });
    }
  } else {
    // Create new messages, replace tracked list
    const ids = [];
    for (let embed of embeds) {
      await limiter.removeTokens(1);
      const id = await discord.createMessage({ embeds: [embed] });
      ids.push(id);
    }
    await writeLastMessages({ channelId, messageIds: ids });
  }
}
