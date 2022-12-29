import Firestore from "@google-cloud/firestore";

const db = new Firestore();

export async function createUser({
  channelId,
  guildId,
  connectCode,
  discordUser,
  requestId,
}) {
  const {
    username: discordUsername,
    id: discordUserId,
    guildNickname,
  } = discordUser;

  const user = {
    connectCode,
    creationDetails: {
      requestId,
      channelId,
      guildId,
      user: {
        discordUsername,
        discordUserId,
        guildNickname,
      },
    },
  };

  const userDocument = db.doc(`users/${connectCode}`);
  await userDocument.set(user);
}