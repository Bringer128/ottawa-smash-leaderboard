import { createUser } from "./db.js";
import Discord from "./discord/Discord.js";
import { Request, Response } from "@google-cloud/functions-framework"

const TEST_SERVER_CHANNEL_ID = "1057467076639473768";
const CHANNEL_ID = "1058962408749682698";

function validate(connectCode: string) {
  if (!connectCode.trim().match(/^[A-Z]+#\d+/)) {
    return `Invalid connect code: ${connectCode}. Must be upper case and include the #.`;
  }
}

type DiscordRequestBody = {
  id: string
  channel_id: string;  
  data: {
    guild_id: string
    options: [
      {value: string}
    ]
  };
  member: {
    user: {
      id: string,
      username: string
    }
    nick: string
  }
}

async function doRegister(requestBody: DiscordRequestBody, res: Response) {
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

    const discord = new Discord({
      channel: requestBody.channel_id,
      apiToken: process.env.BOT_TOKEN!,
    });
    await discord.createMessage(
      `Registered ${interestingFields.connectCode} successfully!`
    );
    // Send an HTTP response
    res.sendStatus(201);
  } catch (e) {
    throw e; // Raise 500
  }
}

export async function register(req: Request, res: Response) {
  await doRegister(req.body, res);
}
