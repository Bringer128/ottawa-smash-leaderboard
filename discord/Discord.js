import fetch from "node-fetch";
const APPLICATION_ID = "1057467461135507536";

class Discord {
  constructor({ channel, guild, apiToken }) {
    this.channel = channel;
    this.apiToken = apiToken;
    this.guild = guild;
  }

  static hasManageGuildPermissions(permissions) {
    const manageGuild = 1 << 5;
    return (permissions & manageGuild) === manageGuild;
  }

  async createMessage(content) {
    if (content.length > 2000) throw "Content too large";

    const url = `https://discord.com/api/v10/channels/${this.channel}/messages`;
    const headers = {
      Authorization: `Bot ${this.apiToken}`,
      "Content-Type": "application/json",
    };
    const response = await fetch(url, {
      headers,
      method: "POST",
      body: JSON.stringify({
        content: content,
      }),
    });
    if (!response.ok) throw `Bad response: ${response.status}`;
    const json = await response.json();
    const { id } = json;
    return id;
  }

  async editMessage(id, content) {
    const url = `https://discord.com/api/v10/channels/${this.channel}/messages/${id}`;
    const headers = {
      Authorization: `Bot ${this.apiToken}`,
      "Content-Type": "application/json",
    };
    const response = await fetch(url, {
      headers,
      method: "PATCH",
      body: JSON.stringify({ content }),
    });
    const json = await response.json();
    console.log(response.status);
    console.log(JSON.stringify(json));
  }

  async getLastMessageInChannel() {
    const url = `https://discord.com/api/v10/channels/${this.channel}`;
    const headers = {
      Authorization: `Bot ${this.apiToken}`,
    };
    const response = await fetch(url, { headers });
    const json = await response.json();
    return json.last_message_id;
  }

  async defineCommand(command) {
    const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/guilds/${this.guild}/commands`;

    const headers = {
      Authorization: `Bot ${this.apiToken}`,
      "Content-Type": "application/json",
    };
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

export default Discord;
