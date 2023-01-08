class Discord {
  constructor(channel, apiToken) {
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
}

export default Discord;
