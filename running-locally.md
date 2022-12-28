### Troubleshooting

> Error: 16 UNAUTHENTICATED: Failed to retrieve auth metadata with error: Could not refresh access token: PERMISSION_DENIED: unable to impersonate: The caller does not have permission

Your Google Cloud account requires the `Service Account Token Creator` and `Service Account User` roles. Jump into IAM and set this up then run `npm run setup-auth` to use OAuth so you can impersonate the service user.