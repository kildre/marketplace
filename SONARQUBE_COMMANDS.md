# SonarQube Commands Guide

This document describes all available SonarQube commands for the Advana Marketplace project. **All SonarQube commands should be run from the root directory**, not from the frontend folder.

## Available Commands

| Script | Full Command | What it Does |
|--------|-------------|--------------|
| `sonar` | `npm run sonar` | Runs a SonarQube scan using your `sonar-project.properties` configuration. Equivalent to running `sonar-scanner` directly. |
| `sonar:check` | `npm run sonar:check` | Verifies that the `SONAR_TOKEN` environment variable is set. Prints ✅ if found, or ❌ with instructions to run `source .env.sonar` if missing. |
| `sonar:validate` | `npm run sonar:validate` | Executes the custom shell script `./sonar-token-check.sh` to validate your SonarQube token and environment prerequisites. |
| `sonar:local` | `npm run sonar:local` | Loads your `.env.sonar` file (if it exists) using `source` and runs a local SonarQube scan with the token (`sonar-scanner -Dsonar.token=${SONAR_TOKEN}`). |
| `sonar:branch` | `npm run sonar:branch` | Performs a branch-specific SonarQube scan, automatically setting the branch name from your current Git branch. Useful for PR or feature-branch analysis. Loads `.env.sonar` if available. |
| `sonar:report` | `npm run sonar:report` | Generates an HTML SonarQube report using `sonar-report`. It connects to <https://sonarqube.cdao.us> and outputs the results to `reports/sonarqube-report.html`. |
| `sonar:report:pdf` | `npm run sonar:report:pdf` | Prints a warning that PDF generation requires extra setup, then calls `npm run sonar:report` to produce the HTML report instead. |
| `sonar:full` | `npm run sonar:full` | Runs a complete local SonarQube workflow: executes frontend tests with coverage (ignores failures), runs a local scan, waits 10 seconds, then generates an HTML report. |
| `sonar:full:unit` | `npm run sonar:full:unit` | Runs only unit tests, followed by a SonarQube scan and HTML report generation. Unlike `sonar:full`, this one requires tests to pass. |

## Setup Instructions

### 1. Install Dependencies

First, install the SonarQube dependencies from the **root** directory:

```bash
cd /path/to/advana-marketplace
npm install
```

### 2. Configure Your Token

Copy the template and add your SonarQube token:

```bash
cp .env.sonar.template .env.sonar
```

Edit `.env.sonar` and replace `your_sonarqube_token_here` with your actual token from:
<https://sonarqube.cdao.us/account/security>

**Important**: The `.env.sonar` file should use `export` statements:

```bash
export SONAR_TOKEN=your_actual_token_here
export SONAR_HOST_URL=https://sonarqube.cdao.us
```

This format allows the scripts to properly source the file using `source .env.sonar`.

### 3. Verify Setup

Test that everything is configured correctly from the root:

```bash
# Check if token is set
npm run sonar:check

# Validate configuration
npm run sonar:validate
```

## Common Workflows

### Quick Local Scan

```bash
npm run sonar:local
```

### Full Analysis with Report

```bash
npm run sonar:full
```

### Branch-Specific Analysis

```bash
npm run sonar:branch
```

### Just Generate Report (after scan)

```bash
npm run sonar:report
```

## Project Structure

The SonarQube configuration analyzes the frontend code from the root:

```plaintext
advana-marketplace/          ← Run all sonar commands from here
├── sonar-project.properties ← Main configuration
├── sonar-token-check.sh     ← Token validation script
├── .env.sonar.template      ← Token template
├── .env.sonar               ← Your actual token (gitignored)
├── package.json             ← Contains all sonar:* scripts
└── frontend/
    ├── src/                 ← Analyzed source code
    ├── coverage/            ← Coverage reports
    └── tsconfig.json        ← TypeScript config
```

## Files

- **`sonar-project.properties`** - SonarQube project configuration (points to frontend/src)
- **`sonar-token-check.sh`** - Shell script for token validation (executable)
- **`.env.sonar.template`** - Template for your SonarQube token configuration
- **`.env.sonar`** - Your actual token file (gitignored, you need to create this)

## Troubleshooting

### Token Not Found Error

If you see `❌ SONAR_TOKEN not found`, run from the root:

```bash
source .env.sonar
npm run sonar:check
```

### 401 Unauthorized Error

If you get `Request failed with status code 401`:

1. Your SonarQube token has expired or is invalid
2. Generate a new token at: <https://sonarqube.cdao.us/account/security>
3. Update your `.env.sonar` file with the new token
4. Test: `source .env.sonar && npm run sonar:check`

See `SONARQUBE_TOKEN_FIX.md` for detailed troubleshooting steps.

### Missing Dependencies

If `sonar-scanner` is not found, ensure you've run from the root:

```bash
npm install
```

### Report Generation Fails

Make sure you've run a scan first from the root:

```bash
npm run sonar:local
sleep 10
npm run sonar:report
```

### Running from Wrong Directory

**Important**: All SonarQube commands must be run from the **root** directory (`advana-marketplace/`), not from the `frontend/` directory. The configuration is set up to analyze `frontend/src` from the root level.

## Security Note

⚠️ **Never commit `.env.sonar` to git!** This file is already in `.gitignore` to protect your token.
