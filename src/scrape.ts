import fetch from "node-fetch";

type SlippiQueryResponse = {
  getConnectCode: {
    user: SlippiUserProfilePage
    __typename: string
  }
}
type SlippiUserProfilePage = {
  displayName: string
  connectCode: {
    code: string
    __typename: string
  }
  rankedNetplayProfile: {
    id: string
    ratingOrdinal: number
    ratingUpdateCount: number
    wins: number
    losses: number
    dailyGlobalPlacement?: number
    dailyRegionalPlacement?: number
    continent: string
    characters: {
            id: string
            character: string
            gameCount: number
            __typename: string
          }
    __typename: string
  }
__typename: string
}

export type ScrapeResult = {
  displayName: string;
  connectCode: string;
  rating: number;
  wins: number;
  losses: number;
  dailyGlobalPlacement: number | undefined;
  dailyRegionalPlacement: number | undefined;
  characters: {
    id: string
    character: string
    gameCount: number
    __typename: string
  };
  rawResponse: SlippiUserProfilePage;
}

const query = `fragment userProfilePage on User {
  displayName
  connectCode {
        code
        __typename
      }
    rankedNetplayProfile {
          id
          ratingOrdinal
          ratingUpdateCount
          wins
          losses
          dailyGlobalPlacement
          dailyRegionalPlacement
          continent
          characters {
                  id
                  character
                  gameCount
                  __typename
                }
          __typename
        }
    __typename
}
query AccountManagementPageQuery($cc: String!) {
    getConnectCode(code: $cc) {
          user {
                  ...userProfilePage
                  __typename
                }
          __typename
        }
}`;

function getBody(connectCode: string) {
  return JSON.stringify({
    operationName: "AccountManagementPageQuery",
    query,
    variables: { cc: connectCode },
  });
}

export async function scrape(connectCode:string) {
  const body = getBody(connectCode);
  const response = await fetch(
    "https://gql-gateway-dot-slippi.uc.r.appspot.com/graphql",
    {
      headers: {
        "cache-control": "no-cache",
        "content-type": "application/json",
        pragma: "no-cache",
      },
      body: body,
      method: "POST",
    }
  );

  if (response.ok) {
    const {data} = await response.json() as { data: SlippiQueryResponse };
    const user = data.getConnectCode?.user;
    if (!user) return null;

    const netplayProfile = user.rankedNetplayProfile;
    const userDeets = {
      displayName: user.displayName,
      connectCode: user.connectCode.code,
      rating: netplayProfile.ratingOrdinal,
      wins: netplayProfile.wins,
      losses: netplayProfile.losses,
      dailyGlobalPlacement: netplayProfile.dailyGlobalPlacement,
      dailyRegionalPlacement: netplayProfile.dailyRegionalPlacement,
      characters: netplayProfile.characters,
      rawResponse: data.getConnectCode.user,
    };

    return userDeets;
  }

  throw new Error(`Bad response from Slippi: ${response.status} - ${JSON.stringify(await response.json())}`)
}
