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

function formatRow(
  {
    displayName,
    connectCode,
    characters,
    rating,
    changes: { indexChange, ratingChange },
  },
  index
) {
  const position = index + 1;
  let positionChunk = `${position}.`;
  if (indexChange.number !== 0) {
    const up = indexChange.number < 0;
    positionChunk += `${up ? "🔺" : "🔻"}(was ${indexChange.old + 1})`;
  }
  const nameChunk = `${displayName} (${connectCode})`;
  const characterChunk = formatCharacters(characters);
  let ratingChunk = `${ratingToEmoji(rating)} ELO: ${Math.floor(rating)}`;
  if (ratingChange.number !== 0) {
    const up = ratingChange.number > 0;
    const number = Math.floor(Math.abs(ratingChange.number));
    ratingChunk += `(${up ? "+" : "-"}${number})`;
  }

  return `${positionChunk} ${nameChunk} - ${characterChunk} - ${ratingChunk}`;
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

function formatToMessagesWithChanges(singleResults, changes) {
  const lines = singleResults
    .map((result) => ({ ...result, changes: changes[result.connectCode] }))
    .map((resultWithChanges, index) => formatRow(resultWithChanges, index));
  lines.unshift("Today's rankings:");

  return linesToMessages(lines);
}

function groupByConnectCode(results) {
  return Object.fromEntries(
    results.map(({ connectCode, rating }, index) => [
      connectCode,
      { index, rating },
    ])
  );
}

function computeChangesToRankAndELO(bothResults) {
  // Currently I have: rating and index for each result
  // I want to get an object like:
  /** {
   *   "BRGR#785": { ratingChange: 10.123, indexChange: -1 }
   * } */

  // First group by connect code
  const [latest, previous] = bothResults.map(groupByConnectCode);
  const merged = Object.entries(latest).map(([connectCode, result]) => [
    connectCode,
    { latest: result, previous: previous[connectCode] },
  ]);
  // Then, get the changes
  const changes = merged.map(([connectCode, { latest, previous }]) => [
    connectCode,
    {
      ratingChange: {
        number: latest.rating - previous.rating,
        old: previous.rating,
        new: latest.rating,
      },
      indexChange: {
        number: latest.index - previous.index,
        old: previous.index,
        new: latest.index,
      },
    },
  ]);

  return Object.fromEntries(changes);
}

export function formatToMessages(results) {
  const changes = computeChangesToRankAndELO(results);
  return formatToMessagesWithChanges(results[0], changes);
}
