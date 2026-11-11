#!/bin/bash
# Deploys both functions, then applies config that lives in this repo.
# Every step after the deploys is idempotent: it sets desired state.
set -euo pipefail

PROJECT=ottawa-smash-discord-bot
REGION=us-east1
SERVICE_ACCOUNT=functions-service-account@${PROJECT}.iam.gserviceaccount.com

# CI must never deploy from anywhere but main (a branch deploy would replace prod).
if [[ "${GITHUB_ACTIONS:-}" == "true" && "${GITHUB_REF:-}" != "refs/heads/main" ]]; then
  echo "Refusing to deploy from ${GITHUB_REF:-unknown} - only main may deploy." >&2
  exit 1
fi

cp package.json dist
cp package-lock.json dist

gcloud functions deploy \
  register-function \
  --gen2 \
<<<<<<< HEAD
  --runtime=nodejs22 \
  --region=us-east1 \
=======
  --runtime=nodejs22 \
  --region=$REGION \
>>>>>>> d03b125 (Make deploy.sh strict, apply image cleanup policy post-deploy, deploy from main only)
  --source=dist \
  --entry-point=register \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars=LOG_EXECUTION_ID=true \
  --set-secrets=BOT_TOKEN=discord-bot-api-key:latest \
  --service-account $SERVICE_ACCOUNT

gcloud functions deploy \
  recurring-scrape \
  --gen2 \
<<<<<<< HEAD
  --runtime=nodejs22 \
  --region=us-east1 \
=======
  --runtime=nodejs22 \
  --region=$REGION \
>>>>>>> d03b125 (Make deploy.sh strict, apply image cleanup policy post-deploy, deploy from main only)
  --source=dist \
  --entry-point=recurring-scrape \
  --trigger-topic=daily-scrape \
  --allow-unauthenticated \
  --set-env-vars=LOG_EXECUTION_ID=true \
  --set-secrets=BOT_TOKEN=discord-bot-api-key:latest \
  --service-account $SERVICE_ACCOUNT

# --- Post-deploy config (only reached if both deploys succeeded, thanks to set -e) ---

# Each deploy leaves ~2 container images behind in gcf-artifacts. This policy deletes
# images older than 7 days while always keeping the 2 newest per image.
# Set CLEANUP_DRY_RUN=1 to log what would be deleted instead of deleting.
if [[ -n "${CLEANUP_DRY_RUN:-}" ]]; then DRY_RUN_FLAG=--dry-run; else DRY_RUN_FLAG=--no-dry-run; fi
gcloud artifacts repositories set-cleanup-policies gcf-artifacts \
  --project=$PROJECT \
  --location=$REGION \
  --policy=artifact-cleanup-policy.json \
  $DRY_RUN_FLAG
