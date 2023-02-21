import commands from "./command-definitions/index.js";
import Discord from "./discord/Discord.js";

const apiToken = process.env.BOT_TOKEN;
if (!apiToken) throw "Requires environment variable: BOT_TOKEN";

const GUILD_ID = "205436248481988608";

async function defineCommands(commands, guild = GUILD_ID) {
  const discord = new Discord({ guild, apiToken });

  for (let command of commands) {
    discord.defineCommand(command);
  }
}

await defineCommands(commands);
