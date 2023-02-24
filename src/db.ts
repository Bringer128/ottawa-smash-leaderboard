import {Firestore} from "@google-cloud/firestore";
import { ScrapeResult } from "./scrape";

const db = new Firestore();

type CreateUserArgs = {
  channelId: string,
  guildId: string,
  connectCode: string,
  discordUser: {
    username: string,
    id: string,
    guildNickname: string
  },
  requestId: string
}

type User = {
  connectCode: string;
  creationDetails: {
      requestId: string;
      channelId: string;
      guildId: string;
      user: {
          discordUsername: string;
          discordUserId: string;
          guildNickname: string;
      };
  };
}

export async function createUser({
  channelId,
  guildId,
  connectCode,
  discordUser,
  requestId,
}: CreateUserArgs) {
  const {
    username: discordUsername,
    id: discordUserId,
    guildNickname,
  } = discordUser;

  const user: User = {
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

export async function removeUser(connectCode: string) {
  const userDocument = db.doc(`users/${connectCode}`);
  await userDocument.delete();
}

export async function writeResults(results: { createdAt: number, results: ScrapeResult[]}) {
  const resultsDoc = db.doc(`results/${results.createdAt}`);
  await resultsDoc.set(results);
}

export async function readResults() {
  const collection = db.collection("results");
  const snapshot = await collection.orderBy("createdAt", "desc").limit(2).get();
  if (snapshot.empty) throw "wtf";
  const results = snapshot.docs.map((doc) => doc.data());
  return results;
}

type WriteLastMessagesArgs = {
  channelId: string,
  messageIds: string[]
}
export async function writeLastMessages({ channelId, messageIds }: WriteLastMessagesArgs) {
  const doc = db.doc(`discordMessages/${channelId}`);
  await doc.set({ messageIds });
}

export async function readLastMessages(channelId: string) {
  const doc = db.doc(`discordMessages/${channelId}`);
  const snapshot = await doc.get();
  return snapshot.data()?.messageIds as string[];
}

export async function getRegistrationDetails(connectCode: string) {
  const userDocument = db.doc(`users/${connectCode}`);
  const snapshot = await userDocument.get();
  if (!snapshot.exists) return null;
  const { creationDetails } = snapshot.data() as User;
  return creationDetails;
}
