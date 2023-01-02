import { getRank } from "./ranks.js";

function rankToEmoji(rank) {
  // E.g. Bronze I -> :bronzei:
  const nospaces = rank.toLowerCase().replace(" ", "");
  return `:${nospaces}:`;
}

function ratingToEmoji(rating) {
  const rank = getRank(6, rating);
  return rankToEmoji(rank);
}

function characterToEmoji(character) {
  const nospaces = character.toLowerCase().replaceAll(" ", "");
  return `:${nospaces}:`;
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
    .slice(0, 15)
    .map((x, i) => formatRow(x, i))
    .join("\n");
  return "Today's rankings:\n" + textResult;
}
