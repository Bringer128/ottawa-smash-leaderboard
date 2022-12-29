import { listUsers } from "./db.js";
import { scrape } from "./scrape.js";

export async function recurringScrape(_cloudEvent) {
  const users = await listUsers();

  // This is so naive what if the list gets big and the function
  // is killed? Should we have some kind of resume logic?
  const results = [];
  for (const connectCode of users) {
    // We can get a lot of parallelism here but we should be nice
    // to the Slippi API and do them in sequence to avoid too many requests
    const result = await scrape(connectCode);
    results.push(result);
  }
  console.log(results);
}
