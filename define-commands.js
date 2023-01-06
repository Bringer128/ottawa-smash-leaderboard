import fetch from "node-fetch";

import commands from "./command-definitions";

const apiToken = process.env.BOT_TOKEN;
if (!apiToken) throw "Requires environment variable: BOT_TOKEN";

const APPLICATION_ID = "1057467461135507536";
const GUILD_ID = "205436248481988608";

const headers = {
  Authorization: `Bot ${apiToken}`,
  "Content-Type": "application/json",
};

async function defineCommands(commands, guild = GUILD_ID) {
  const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/guilds/${guild}/commands`;

  for (let command of commands) {
    const response = await fetch(url, {
      headers,
      method: "POST",
      body: JSON.stringify(command),
    });
    console.log(response.status);

    const json = await response.json();
    console.log(JSON.stringify(json));
  }
}

await defineCommands(commands);
