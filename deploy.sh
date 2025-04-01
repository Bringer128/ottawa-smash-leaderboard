#/bin/bash

cp package.json dist
cp package-lock.json dist

gcloud functions deploy \
  register-function \
  --gen2 \
  --runtime=nodejs22 \
  --region=us-east1 \
  --source=dist \
  --entry-point=register \
  --trigger-http \
  --allow-unauthenticated \
  --service-account functions-service-account@ottawa-smash-discord-bot.iam.gserviceaccount.com

gcloud functions deploy \
  recurring-scrape \
  --gen2 \
  --runtime=nodejs22 \
  --region=us-east1 \
  --source=dist \
  --entry-point=recurring-scrape \
  --trigger-topic=daily-scrape \
  --allow-unauthenticated \
  --service-account functions-service-account@ottawa-smash-discord-bot.iam.gserviceaccount.com