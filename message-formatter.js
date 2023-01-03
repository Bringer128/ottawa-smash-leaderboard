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
  const ratingChunk = `${ratingToEmoji(rating)} ELO: ${rating}`;

  return `${position}. ${nameChunk} - ${characterChunk} - ${ratingChunk}`;
}

export function formatMessage(results) {
  const textResult = results
    .slice(0, 10)
    .map((x, i) => formatRow(x, i))
    .join("\n");
  return "Today's rankings:\n" + textResult;
}
