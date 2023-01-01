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

export async function listUsers() {
  const usersCollection = db.collection("users");
  const documentRefs = await usersCollection.listDocuments();
  return documentRefs.map((x) => x.id);
}

export async function writeResults(results) {
  const resultsDoc = db.doc(`results/${Date.now()}`);
  await resultsDoc.set(results);
}
