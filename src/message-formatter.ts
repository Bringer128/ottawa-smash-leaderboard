import { getRank } from "./ranks.js";
import { getEmojiIdForName } from "./emoji.js";
import { PersistedResults } from "./db.js";
import { Character, ScrapeResult } from "./scrape.js";

function rankToEmoji(rank: string) {
  // E.g. Bronze II -> :BronzeII:
  const nospaces = rank.replace(" ", "");
  return getEmojiIdForName(nospaces);
}

function ratingToEmoji(
  rating: number,
  ratingUpdateCount: number,
  dailyGlobalPlacement?: number,
  dailyRegionalPlacement?: number
) {
  const rank = getRank(
    ratingUpdateCount,
    rating,
    dailyGlobalPlacement,
    dailyRegionalPlacement
  );
  return rankToEmoji(rank);
}

function characterToEmoji(character: string) {
  const nospaces = character.toLowerCase().replaceAll(" ", "");
  return getEmojiIdForName(nospaces);
}

function formatCharacters(characters: Character[]) {
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
    rawResponse: {
      rankedNetplayProfile: {
        ratingUpdateCount,
        dailyGlobalPlacement,
        dailyRegionalPlacement,
      },
    },
    wins,
    losses,
    changes: { indexChange, ratingChange },
  }: ResultsWithChanges,
  index: number
) {
  const position = index + 1;
  let positionChunk = `${position}.`;
  if (indexChange.number !== 0) {
    const up = indexChange.number < 0;
    positionChunk += `${up ? "🔺" : "🔻"}(was ${indexChange.old + 1})`;
  }
  const nameChunk = `${displayName} (${connectCode})`;
  const characterChunk = formatCharacters(characters);
  wins = wins || 0;
  losses = losses || 0;
  const winLossChunk = `${wins}W/${losses}L`;
  let ratingChunk = `${ratingToEmoji(
    rating,
    ratingUpdateCount,
    dailyGlobalPlacement,
    dailyRegionalPlacement
  )} ${Math.floor(rating)}`;
  if (ratingChange.number !== 0) {
    const up = ratingChange.number > 0;
    const number = Math.floor(Math.abs(ratingChange.number));
    ratingChunk += `(${up ? "+" : "-"}${number})`;
  }

  return `${positionChunk} ${nameChunk} - ${characterChunk} - ${winLossChunk} ${ratingChunk}`;
}

function linesToMessages(lines: string[]) {
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

type ResultsWithChanges = ScrapeResult & {
  changes: {
    ratingChange: Change;
    indexChange: Change;
  };
};

function splitOutNoMatches(singleResults: ScrapeResult[]) {
  const toReturn = {
    hasMatches: [] as ScrapeResult[],
    noMatches: [] as ScrapeResult[],
  };

  singleResults.forEach((result) => {
    const hasMatches = !!(result.wins || result.losses);
    const arr = hasMatches ? toReturn.hasMatches : toReturn.noMatches;
    arr.push(result);
  });
  return toReturn;
}

function formatToMessagesWithChanges(
  singleResults: ScrapeResult[],
  changes: OverallChanges,
  invalidCodes?: string[]
) {
  const reuslts = splitOutNoMatches(singleResults);

  const lines = reuslts.hasMatches
    .map((result) => ({
      ...result,
      changes: changes.changesByConnectCode[result.connectCode],
    }))
    .map((resultWithChanges: ResultsWithChanges, index) =>
      formatRow(resultWithChanges, index)
    );

  lines.push("Connect codes with no results yet:");
  const noMatchConnectCodes = reuslts.noMatches
    .map((result) => result.connectCode)
    .join(", ");
  lines.push(noMatchConnectCodes);

  if (invalidCodes && invalidCodes.length > 0) {
    lines.push("\nInvalid connect codes (these should be removed):");
    lines.push(invalidCodes.join(", "));
  }

  const timeChange = changes.timeChangeMs;
  const timeHours = (timeChange.number * 1.0) / 1000 / 60 / 60;
  const latestTime = new Date(timeChange.new).toLocaleTimeString("en-CA", {
    timeZone: "America/Toronto",
  });
  lines.unshift(
    `Rankings as of ${latestTime} (displayed changes are since ${timeHours
      .toString()
      .substring(0, 3)} hours prior)`
  );
  console.log(lines[0]);

  return linesToMessages(lines);
}

function groupByConnectCode(results: ScrapeResult[]) {
  return Object.fromEntries(
    results.map(({ connectCode, rating }, index) => [
      connectCode,
      { index, rating },
    ])
  );
}

type RankAndRating = {
  index: number;
  rating: number;
};

type Change = {
  number: number;
  old: number;
  new: number;
};

type OverallChanges = {
  changesByConnectCode: {
    [k: string]: {
      ratingChange: Change;
      indexChange: Change;
    };
  };
  timeChangeMs: Change;
};

function computeChangesToRankAndELO(
  resultsAndTimes: [PersistedResults, PersistedResults]
): OverallChanges {
  // Currently I have: rating and index for each result
  // I want to get an object like:
  /** {
   *   "BRGR#785": { ratingChange: 10.123, indexChange: -1 }
   * } */

  const bothResults = resultsAndTimes.map((x) => x.results);
  const [latestTimeMs, previousTimeMs] = resultsAndTimes.map(
    (x) => x.createdAt
  );
  // First group by connect code
  const [latest, previous] = bothResults.map(groupByConnectCode);
  const merged = Object.entries(latest).map(
    ([connectCode, result]) =>
      [connectCode, { latest: result, previous: previous[connectCode] }] as [
        string,
        { latest: RankAndRating; previous: RankAndRating }
      ]
  );

  // Then, get the changes
  const changes = merged
    .filter(([, v]) => v?.latest && v?.previous)
    .map(([connectCode, { latest, previous }]) => [
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
    ]) as [string, { ratingChange: Change; indexChange: Change }][];


  const changesByConnectCode = Object.fromEntries(changes) as {
    [k: string]: {
      ratingChange: Change;
      indexChange: Change;
    };
  };

  return {
    changesByConnectCode,
    timeChangeMs: {
      number: latestTimeMs - previousTimeMs,
      old: previousTimeMs,
      new: latestTimeMs,
    },
  };
}

export function formatToMessages(
  results: [PersistedResults, PersistedResults]
) {
  const changes = computeChangesToRankAndELO(results);
  return formatToMessagesWithChanges(results[0].results, changes, results[0].invalidCodes);
}