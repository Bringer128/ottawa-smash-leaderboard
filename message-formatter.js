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

function formatCharacters(characters) {
  const totalGames = characters.reduce(
    (sum, { gameCount }) => sum + gameCount,
    0
  );
  const charactersToKeep = characters.filter(
    // Stolen from Slippi - if <2% of total games then skip the character.
    (char) => char.gameCount / totalGames > 0.02
  );
  return charactersToKeep
    .map((char) => characterToEmoji(char.character))
    .join();
}

function formatRow({ displayName, connectCode, characters, rating }, index) {
  const position = index + 1;
  const nameChunk = `${displayName} (${connectCode})`;
  const characterChunk = formatCharacters(characters);
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
