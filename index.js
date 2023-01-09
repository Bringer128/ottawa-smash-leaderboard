import functions from "@google-cloud/functions-framework";

import { register } from "./register.js";
import { recurringScrape } from "./recurring-scrape.js";
import { discordAuth } from "./discord-auth.js";
import { PubSub } from "@google-cloud/pubsub";

async function auth(req, res, callback) {
  const error = await discordAuth(req.headers, req.rawBody);
  if (error && error.code) {
    res.status(error.code);
    return;
  }
  if (req.body.type == 1) {
    res.json({ type: 1 });
    return;
  }
  if (req.body.type == 2) {
    await callback();
    return;
  }
  res.status(400).json({ error: `Unknown type: ${req.body.type}` });
}

async function triggerScrape(res) {
  const pubsub = new PubSub();
  try {
    const messageId = await pubsub
      .topic("daily-scrape")
      .publishMessage({ data: Buffer.from("foo") });
    console.log(`Message ${messageId} published.`);
    res.status(201).json({
      type: 4,
      data: {
        content: "Asking Slippi nicely for updated stats; please wait.",
      },
    });
  } catch (error) {
    console.error(`Received error while publishing: ${error.message}`);
    res.status(500).json({
      type: 4,
      data: {
        content: "Unexpected error",
      },
    });
  }
}

functions.http("register", async function (req, res) {
  return await auth(req, res, async () => {
    if (req.body.data.name === "register") {
      await register(req, res);
    } else if (req.body.data.name === "show_leaderboard") {
      await triggerScrape(res);
    }
  });
});
functions.cloudEvent("recurring-scrape", recurringScrape);
