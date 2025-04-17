import fetch from "node-fetch";
const APPLICATION_ID = "1057467461135507536";

interface Args {
  channel?: string
  guild?: string
  apiToken: string
}

interface MessagePostResponse {
  id: string
}

interface ChannelGetResponse {
  last_message_id: string | undefined
}

type Option = {
  name: string,
  description: string,
  type: number
  required: boolean,
}

export type Command = {
  name: string
  description: string
  type: number
  options?: Option[]
}

class Discord {
  guild: string | undefined;
  channel: string | undefined;
  apiToken: string;
  constructor({ channel, guild, apiToken }: Args) {
    this.channel = channel;
    this.apiToken = apiToken;
    this.guild = guild;
  }

  static hasManageGuildPermissions(permissions: number) {
    const manageGuild = 1 << 5;
    return (permissions & manageGuild) === manageGuild;
  }

  static hasKickMembersPermission(permissions: number) {
    const kickMembers = 1 << 1;
    return (permissions & kickMembers) === kickMembers;
  }

  async createMessage(content: string) {
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
    const json = await response.json() as MessagePostResponse;
    const { id } = json;
    return id;
  }

  async editMessage(id: string, content: string) {
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
  }

  async getLastMessageInChannel() {
    const url = `https://discord.com/api/v10/channels/${this.channel}`;
    const headers = {
      Authorization: `Bot ${this.apiToken}`,
    };
    const response = await fetch(url, { headers });
    const json = await response.json() as ChannelGetResponse;
    return json.last_message_id;
  }

  async defineCommand(command: Command) {
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