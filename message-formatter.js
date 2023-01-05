import { getRank } from "./ranks.js";
import { getEmojiIdForName } from "./emoji.js";

function rankToEmoji(rank) {
  // E.g. Bronze II -> :BronzeII:
  const nospaces = rank.replace(" ", "");
  return getEmojiIdForName(nospaces);
}

function ratingToEmoji(rating) {
  const rank = getRank(6, rating);
  return rankToEmoji(rank);
}

function characterToEmoji(character) {
  const nospaces = character.toLowerCase().replaceAll(" ", "");
  return getEmojiIdForName(nospaces);
}

function formatRow({ displayName, connectCode, characters, rating }, index) {
  const position = index + 1;
  const nameChunk = `${displayName} (${connectCode})`;
  const characterChunk = characters
    .map((char) => characterToEmoji(char.character))
    .join();
  const ratingChunk = `${ratingToEmoji(rating)} ELO: ${Math.floor(rating)}`;

  return `${position}. ${nameChunk} - ${characterChunk} - ${ratingChunk}`;
}

function linesToMessages(lines) {
  let currentMessage = "";
  const messages = [];
  for (let line of lines) {
    const newLength = currentMessage.length + line.length;
    if (newLength < 2000) {
      currentMessage = currentMessage + "\n" + line;
    } else {
      messages.push(currentMessage);
      currentMessage = line;
    }
  }
  if (currentMessage !== "") messages.push(currentMessage);
  return messages;
}

export function formatToMessages(results) {
  const lines = results.map((x, i) => formatRow(x, i));
  lines.unshift("Today's rankings:");

  return linesToMessages(lines);
}
