import functions from "@google-cloud/functions-framework";

import { scrape } from "./scrape.js";
import { createUser } from "./db.js";
import { discordAuth } from "./discord-auth.js";

async function doRegister(body) {
  const interestingFields = {
    channelId: body.channel_id,
    guildId: body.data.guild_id,
    connectCode: body.data.options[0].value,
    discordUser: {
      username: body.member.user.username,
      id: body.member.user.id,
      guildNickname: body.member.nick,
    },
    requestId: body.id,
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

    // Send an HTTP response
    res.json({
      type: 4, // TODO: This is an inline response but we can do a deferred response in case the db is slow
      data: {
        content: `Registered ${interestingFields.connectCode} successfully!`,
      },
    });
  } catch (e) {
    throw e; // Raise 500
  }
}

async function register(req, res) {
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
    await doRegister(req.body, res);
    return;
  }
  res.status(400).json({ error: `Unknown type: ${req.body.type}` });
}

functions.http("register", register);

function validate(connectCode) {
  if (!connectCode.trim().match(/^[A-Za-z]{1,4}#\d{1,3}/)) {
    return `Invalid connect code: ${connectCode}`;
  }
}
