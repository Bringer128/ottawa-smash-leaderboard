import { listUsers, writeResults } from "./db.js";
import { scrape, ScrapeResult } from "./scrape.js";
import { RateLimiter } from "limiter";
import { editLastDiscordMessages } from "./edit-message.js";
import { CloudEvent } from "@google-cloud/functions-framework";

const limiter = new RateLimiter({ tokensPerInterval: 1, interval: "second" });

export async function recurringScrape(_cloudEvent?: CloudEvent<unknown>) {
  const users = await listUsers();

  // This is so naive what if the list gets big and the function
  // is killed? Should we have some kind of resume logic?
  const results = [] as ScrapeResult[];
  const invalidCodes = [] as string[];
  for (const connectCode of users) {
    // We can get a lot of parallelism here but we should be nice
    // to the Slippi API and do them in sequence to avoid too many requests
    await limiter.removeTokens(1);
    let result: ScrapeResult | null = null;
    try {
      result = await scrape(connectCode);
    } catch (e) {
      console.error(e);
    }
    if (result) {
      results.push(result);
    } else {
      console.warn(`Invalid code: ${connectCode}`);
      invalidCodes.push(connectCode);
    }
  }

  results.sort((first, second) => second.rating - first.rating);

  await writeResults({
    createdAt: Date.now(),
    results: results.sort((first, second) => second.rating - first.rating),
    invalidCodes,
  });

  await editLastDiscordMessages();
}