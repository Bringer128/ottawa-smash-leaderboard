const APPLICATION_ID = "1057467461135507536";

class Discord {
  constructor({ channel, guild, apiToken }) {
    this.channel = channel;
    this.apiToken = apiToken;
  }

  async createMessage(content) {
    if (content.length > 2000) throw "Content too large";

    const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
    const headers = {
      Authorization: `Bot ${apiToken}`,
      "Content-Type": "application/json",
    };
    const response = await fetch(url, {
      headers,
      method: "POST",
      body: JSON.stringify({
        content: content,
      }),
    });
    if (!response.ok) throw `Bad response: ${response.statusCode}`;
    const { id } = await response.json();
    return id;
  }

  async editMessage(id, content) {
    const url = `https://discord.com/api/v10/channels/${channelId}/messages/${id}`;
    const headers = {
      Authorization: `Bot ${apiToken}`,
      "Content-Type": "application/json",
    };
    await fetch(url, {
      headers,
      method: "PATCH",
      content,
    });
  }

  async getLastMessageInChannel(channelId, apiToken) {
    const url = `https://discord.com/api/v10/channels/${channelId}`;
    const headers = {
      Authorization: `Bot ${apiToken}`,
      "Content-Type": "application/json",
    };
    const response = await fetch(url, { headers });
    const json = response.json();
    return json.last_message_id;
  }

  async defineCommand(command) {
    const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/guilds/${guildId}/commands`;

    const headers = {
      Authorization: `Bot ${apiToken}`,
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
