# ottawa-smash-leaderboard

## Purpose

The Ottawa Smash Community have a discord. We want to be able to post everyone's position on the global leaderboard relative to each other as a way to promote healthy competition.

## To set up:

1. Install Node.js
2. Run `npm install` to get the packages
3. Run `npm run setup-auth` to authenticate to Google Cloud & impersonate the service user to access the db.
4. To test the registration cloud function locally run `npm run register`

### Running the scrape locally:

1. Get the Discord Bot Token from Ryan
2. Run `BOT_TOKEN=<bot token> npm run scrape`
