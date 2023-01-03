import functions from "@google-cloud/functions-framework";

import { register } from "./register.js";
import { recurringScrape } from "./recurring-scrape.js";
import { discordAuth } from "./discord-auth.js";

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
    callback();
  }
  res.status(400).json({ error: `Unknown type: ${req.body.type}` });
}

functions.http("register", function (req, res) {
  return auth(req, res, () => {
    if (req.body.data.name === "register") {
      register(req.body, res);
    } else if (req.body.data.name === "show_leaderboard") {
      res.json({
        type: 4,
        data: {
          content: "Leaderboard command in progress. Be patient!",
        },
      });
    }
  });
});
functions.cloudEvent("recurring-scrape", recurringScrape);
