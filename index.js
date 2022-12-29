import functions from "@google-cloud/functions-framework";

import { scrape } from "./scrape.js";
import { createUser } from "./db.js";
import { discordAuth } from "./discord-auth.js";

functions.http("register", async (req, res) => {
  console.log("received message");
  const error = await discordAuth(req.headers, req.rawBody);
  if (error && error.code) {
    console.log("Le error: " + error.code);
    res.status(error.code);
    return;
  }
  if (req.body.type == 1) {
    res.json({ type: 1 });
    return;
  }

  console.log(JSON.stringify(req.body));
  const interestingFields = {
    channelId: req.body.channel_id,
    guildId: req.body.data.guild_id,
    connectCode: req.body.data.options[0].value,
    discordUser: {
      username: req.body.member.user.username,
      id: req.body.member.user.id,
      guildNickname: req.body.member.nick,
    },
    requestId: req.body.id,
  };

  const validationError = validate(interestingFields.connectCode);
  if (validationError) {
    res.json({
      type: 4,
      data: {
        content: validationError,
      },
    });
    return;
  }
  try {
    await createUser(interestingFields);

    console.log("Success!");
    // Send an HTTP response
    res.json({
      type: 4, // TODO: This is an inline response but we can do a deferred response in case the db is slow
      data: {
        content: `Registered ${interestingFields.connectCode} successfully!`,
      },
    });
  } catch (e) {
    console.log("Error!", e);
    throw e; // Raise 500
  }
});

function validate(connectCode) {
  if (!connectCode.trim().match(/^[A-Za-z]{1,4}#\d{1,3}/)) {
    return `Invalid connect code: ${connectCode}`;
  }
}
