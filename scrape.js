import fetch from 'node-fetch'

function getBody(connectCode) {
  return `{\"operationName\":\"AccountManagementPageQuery\",\"variables\":{\"cc\":\"${connectCode}\",\"uid\":\"${connectCode}\"},\"query\":\"fragment userProfilePage on User {\\n  fbUid\\n  displayName\\n  connectCode {\\n    code\\n    __typename\\n  }\\n  status\\n  activeSubscription {\\n    level\\n    hasGiftSub\\n    __typename\\n  }\\n  rankedNetplayProfile {\\n    id\\n    ratingOrdinal\\n    ratingUpdateCount\\n    wins\\n    losses\\n    dailyGlobalPlacement\\n    dailyRegionalPlacement\\n    continent\\n    characters {\\n      id\\n      character\\n      gameCount\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nquery AccountManagementPageQuery($cc: String!, $uid: String!) {\\n  getUser(fbUid: $uid) {\\n    ...userProfilePage\\n    __typename\\n  }\\n  getConnectCode(code: $cc) {\\n    user {\\n      ...userProfilePage\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}`
}

export async function scrape(connectCode) {
  const body = getBody(connectCode)
  const response = await fetch("https://gql-gateway-dot-slippi.uc.r.appspot.com/graphql", {
    "headers": {
      "cache-control": "no-cache",
      "content-type": "application/json",
      "pragma": "no-cache",
    },
    "body": body,
    "method": "POST"
  });

  if(response.status == 200) {
    const json = await response.json();
    const user = json.data.getConnectCode.user;
    const netplayProfile = user.rankedNetplayProfile;
    const userDeets = {
      displayName: user.displayName,
      connectCode: user.connectCode.code,
      rating: netplayProfile.ratingOrdinal,
      wins: netplayProfile.wins,
      losses: netplayProfile.losses,
      dailyGlobalPlacement: netplayProfile.dailyGlobalPlacement,
      dailyRegionalPlacement: netplayProfile.dailyRegionalPlacement,
    }

    return userDeets;
  }

  return response;
}