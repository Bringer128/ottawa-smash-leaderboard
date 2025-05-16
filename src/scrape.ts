import fetch from "node-fetch";

type SlippiQueryResponse = {
  getUser: SlippiUserProfilePage;
};

type SlippiUserProfilePage = {
  fbUid: string;
  displayName: string;
  connectCode: {
    code: string;
    __typename: string;
  };
  status: string;
  activeSubscription: {
    level: string;
    hasGiftSub: boolean;
    __typename: string;
  };
  rankedNetplayProfile: {
    id: string;
    ratingOrdinal: number;
    ratingUpdateCount: number;
    wins: number;
    losses: number;
    dailyGlobalPlacement?: number;
    dailyRegionalPlacement?: number;
    continent: string;
    characters: {
      character: string;
      gameCount: number;
      __typename: string;
    }[];
    __typename: string;
  };
  rankedNetplayProfileHistory: {
    id: string;
    ratingOrdinal: number;
    ratingUpdateCount: number;
    wins: number;
    losses: number;
    dailyGlobalPlacement?: number;
    dailyRegionalPlacement?: number;
    continent: string;
    characters: {
      character: string;
      gameCount: number;
      __typename: string;
    }[];
    season: {
      id: string;
      startedAt: string;
      endedAt: string;
      name: string;
      status: string;
      __typename: string;
    };
    __typename: string;
  }[];
  __typename: string;
};

export type Character = {
  id: string;
  character: string;
  gameCount: number;
  __typename: string;
};

export type ScrapeResult = {
  displayName: string;
  connectCode: string;
  rating: number;
  wins: number | null;
  losses: number | null;
  dailyGlobalPlacement: number | undefined;
  dailyRegionalPlacement: number | undefined;
  characters: Character[];
  rawResponse: SlippiUserProfilePage;
};

const query = String.raw`
fragment profileFields on NetplayProfile {
  id
  ratingOrdinal
  ratingUpdateCount
  wins
  losses
  dailyGlobalPlacement
  dailyRegionalPlacement
  continent
  characters {
    character
    gameCount
    __typename
  }
  __typename
}

fragment userProfilePage on User {
  fbUid
  displayName
  connectCode {
    code
    __typename
  }
  status
  activeSubscription {
    level
    hasGiftSub
    __typename
  }
  rankedNetplayProfile {
    ...profileFields
    __typename
  }
  rankedNetplayProfileHistory {
    ...profileFields
    season {
      id
      startedAt
      endedAt
      name
      status
      __typename
    }
    __typename
  }
  __typename
}

query UserProfilePageQuery($cc: String, $uid: String) {
  getUser(fbUid: $uid, connectCode: $cc) {
    ...userProfilePage
    __typename
  }
}`;

function getBody(connectCode: string) {
  console.log("Outgoing GraphQL Query:\n", query);
  return JSON.stringify({
    operationName: "UserProfilePageQuery",
    variables: { cc: connectCode, uid: connectCode },
    query: query,
  });
}

export async function scrape(connectCode: string) {
  const body = getBody(connectCode);
  const response = await fetch(
    "https://internal.slippi.gg/graphql",
    {
      headers: {
        "content-type": "application/json",
      },
      body: body,
      method: "POST",
    }
  );

  if (response.ok) {
    const { data } = (await response.json()) as { data: SlippiQueryResponse };
    const user = data.getUser;
    if (!user) return null;

    const netplayProfile = user.rankedNetplayProfile;
    const userDeets: ScrapeResult = {
      displayName: user.displayName,
      connectCode: user.connectCode.code,
      rating: netplayProfile.ratingOrdinal,
      wins: netplayProfile.wins,
      losses: netplayProfile.losses,
      dailyGlobalPlacement: netplayProfile.dailyGlobalPlacement,
      dailyRegionalPlacement: netplayProfile.dailyRegionalPlacement,
      characters: netplayProfile.characters.map(char => ({
        ...char,
        id: `char-${char.character.toLowerCase()}`
      })),
      rawResponse: user,
    };

    return userDeets;
  }

  throw new Error(
    `Bad response from Slippi: ${response.status} - ${JSON.stringify(
      await response.text()
    )}`
  );
}