#/bin/bash

gcloud functions deploy \
  nodejs-http-function \
  --gen2 \
  --runtime=nodejs16 \
  --region=us-east1 \
  --source=. \
  --entry-point=myHttpFunction \
  --trigger-http \
  --allow-unauthenticated