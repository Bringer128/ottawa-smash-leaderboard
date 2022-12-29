import fetch from "node-fetch";

const apiToken = process.env.BOT_TOKEN;
if (!apiToken) throw "Requires environment variable: BOT_TOKEN";

const registerCommand = {
  name: "register",
  description: "Register your connect code to the leaderboard",
  type: 1, // CHAT_INPUT aka slash commands
  options: [
    {
      name: "connect-code",
      description: "Your Slippi connect code e.g. BRGR#785",
      type: 3, // STRING
      required: true,
    },
  ],
};

const APPLICATION_ID = "1057467461135507536";
const GUILD_ID = "1057467076639473765";

const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`;
console.log(url);
console.log(apiToken);
const headers = {
  Authorization: `Bot ${apiToken}`,
  "Content-Type": "application/json",
};

(async () => {
  const response = await fetch(url, {
    headers,
    method: "POST",
    body: JSON.stringify(registerCommand),
  });

  console.log(response.status);

  const json = await response.json();

  console.log(JSON.stringify(json));
})();
