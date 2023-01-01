import fetch from "node-fetch";

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

function getBody(connectCode) {
  return JSON.stringify({
    operationName: "AccountManagementPageQuery",
    query,
    variables: { cc: connectCode },
  });
}

export async function scrape(connectCode) {
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

  if (response.status == 200) {
    const json = await response.json();
    console.log(json);
    const user = json.data.getConnectCode?.user;
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
      rawResponse: json.data.getConnectCode.user,
    };

    return userDeets;
  }

  return response;
}
