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
  const resultsDoc = db.doc(`results/${results.createdAt}`);
  await resultsDoc.set(results);
}

export async function readResults() {
  const collection = db.collection("results");
  const snapshot = await collection.orderBy("createdAt", "desc").limit(1).get();
  if (snapshot.empty) throw "wtf";
  const results = snapshot.docs[0].data();
  return results;
}

export async function writeLastMessages({ channelId, messageIds }) {
  const doc = db.document(`discordMessages/${channelId}`);
  await doc.set(messageIds);
}

export async function readLastMessages(channelId) {
  const doc = db.document(`discordMessages/${channelId}`);
  const snapshot = await doc.get();
  return snapshot.data();
}
