import fetch from "node-fetch";

import commands from "./command-definitions";
import Discord from "./discord/Discord";

const apiToken = process.env.BOT_TOKEN;
if (!apiToken) throw "Requires environment variable: BOT_TOKEN";

const GUILD_ID = "205436248481988608";

async function defineCommands(commands, guild = GUILD_ID) {
  const discord = Discord.new({ guild, apiToken });

  for (let command of commands) {
    discord.defineCommand(command);
  }
}

await defineCommands(commands);
