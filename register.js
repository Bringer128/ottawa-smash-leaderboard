import { createUser } from "./db.js";

function validate(connectCode) {
  if (!connectCode.trim().match(/^[A-Z]+#\d+/)) {
    return `Invalid connect code: ${connectCode}. Must be upper case and include the #.`;
  }
}

async function doRegister(requestBody, res) {
  const interestingFields = {
    channelId: requestBody.channel_id,
    guildId: requestBody.data.guild_id,
    connectCode: requestBody.data.options[0].value.toUpperCase(),
    discordUser: {
      username: requestBody.member.user.username,
      id: requestBody.member.user.id,
      guildNickname: requestBody.member.nick,
    },
    requestId: requestBody.id,
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

export async function register(req, res) {
  await doRegister(req.body, res);
}
