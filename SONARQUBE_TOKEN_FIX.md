# SonarQube Token 401 Error - Troubleshooting

## Problem
You're getting a `401 Unauthorized` error when running SonarQube scans.

## Cause
Your SonarQube token is either:
- Expired
- Invalid
- Revoked
- Has insufficient permissions

## Solution

### Step 1: Generate a New Token

1. Go to: <https://sonarqube.cdao.us/account/security>
2. Log in with your credentials
3. Scroll to "Generate Tokens" section
4. Enter a token name (e.g., "Local Development - Nov 2025")
5. Set expiration (recommended: 90 days or more)
6. Click "Generate"
7. **Copy the token immediately** (you won't be able to see it again)

### Step 2: Update Your `.env.sonar` File

Open `.env.sonar` in the root directory and update the token:

```bash
# SonarQube Configuration
# This file contains sensitive credentials - DO NOT COMMIT TO GIT

export SONAR_TOKEN=YOUR_NEW_TOKEN_HERE
export SONAR_HOST_URL=https://sonarqube.cdao.us
```

### Step 3: Test the Connection

```bash
# Source the environment
source .env.sonar

# Check if token is set
npm run sonar:check

# Try a scan
npm run sonar:local
```

## Alternative: Use Environment Variable Directly

If you don't want to use `.env.sonar`, you can export the token directly:

```bash
export SONAR_TOKEN="your_token_here"
npm run sonar
```

## Verify Your Token

You can test your token with curl:

```bash
source .env.sonar
curl -u ${SONAR_TOKEN}: https://sonarqube.cdao.us/api/system/status
```

If you get a JSON response, your token is valid. If you get 401, the token needs to be regenerated.

## Common Issues

1. **Token copied with extra spaces** - Make sure there are no leading/trailing spaces
2. **Wrong token type** - Make sure you're using a User Token, not a Project Token
3. **Insufficient permissions** - Your user account needs "Execute Analysis" permission
4. **Token expired** - Check the expiration date on the SonarQube security page

## Updated Commands

All commands now use `-Dsonar.token` (not the deprecated `-Dsonar.login`):
- ✅ `npm run sonar:local` - Uses token from `.env.sonar`
- ✅ `npm run sonar:branch` - Uses token from `.env.sonar`
- ✅ `npm run sonar:full` - Full workflow with token
