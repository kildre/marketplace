# SonarQube Complete Setup Guide

> **Complete guide for setting up and running SonarQube analysis for the Advana Marketplace project**

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [What is SonarQube?](#-what-is-sonarqube)
3. [Prerequisites](#-prerequisites)
4. [First-Time Setup](#-first-time-setup)
5. [Running Analysis](#-running-analysis)
6. [Viewing Results](#-viewing-results)
7. [Troubleshooting](#-troubleshooting)
8. [Configuration Reference](#-configuration-reference)
9. [Security Best Practices](#-security-best-practices)

---

## 🚀 Quick Start

**Already set up?** Run this:

```bash
# Load your token
source .env.sonar

# Run analysis
cd frontend
npm run sonar
```

**First time?** Follow the [First-Time Setup](#-first-time-setup) section below.

---

## 📖 What is SonarQube?

SonarQube analyzes your code for:

- 🐛 **Bugs** - Potential runtime errors
- 🔒 **Security Vulnerabilities** - Known security issues
- 🧹 **Code Smells** - Maintainability issues
- 📊 **Test Coverage** - How much code is tested
- 📏 **Code Quality** - Best practices and standards

**Project Information:**
- **Server:** https://sonarqube.cdao.us
- **Project Key:** `tenant-metrostar-advana-marketplace`
- **Dashboard:** https://sonarqube.cdao.us/dashboard?id=tenant-metrostar-advana-marketplace

---

## ✅ Prerequisites

Before you begin, ensure you have:

- ✅ Node.js (>= 16.17.0)
- ✅ npm (>= 8.0.0)
- ✅ Access to https://sonarqube.cdao.us
- ✅ Git repository cloned

**Verify your environment:**

```bash
node --version  # Should be >= 16.17.0
npm --version   # Should be >= 8.0.0
```

---

## 🔧 First-Time Setup

### Step 1: Get Your SonarQube Token

1. **Log into SonarQube**
   - Go to: https://sonarqube.cdao.us
   - Log in with your credentials

2. **Navigate to Token Generation**
   - Click your **profile icon** (top-right corner)
   - Select **"My Account"**
   - Click the **"Security"** tab

3. **Generate a Token**
   
   Fill out the form:
   - **Name:** `Local Development` (or any descriptive name)
   - **Type:** Select "User Token" or "Global Analysis Token"
   - **Expires in:** Choose expiration (30, 90 days, or custom)
   - Click **"Generate"**

4. **⚠️ COPY THE TOKEN IMMEDIATELY**
   
   The token is shown **only once**! Copy it now.

### Step 2: Configure Your Environment

**Option A: Using .env.sonar (Recommended)**

```bash
# Navigate to project root
cd /Users/kberres/dev/CDAO/advana-marketplace

# Check if .env.sonar exists
ls -la .env.sonar

# If it exists, edit it:
# If not, copy from example:
cp .env.sonar.example .env.sonar

# Edit the file and paste your token
nano .env.sonar
```

Your `.env.sonar` should look like:

```bash
# SonarQube Configuration
export SONAR_TOKEN=sqp_your_actual_token_here
export SONAR_HOST_URL=https://sonarqube.cdao.us
```

**Option B: Export Directly (Temporary)**

```bash
export SONAR_TOKEN='your-actual-token-here'
export SONAR_HOST_URL='https://sonarqube.cdao.us'
```

**Option C: Add to Shell Profile (Permanent)**

```bash
# For zsh (macOS default)
echo 'export SONAR_TOKEN="your-actual-token-here"' >> ~/.zshrc
echo 'export SONAR_HOST_URL="https://sonarqube.cdao.us"' >> ~/.zshrc
source ~/.zshrc

# For bash
echo 'export SONAR_TOKEN="your-actual-token-here"' >> ~/.bashrc
source ~/.bashrc
```

### Step 3: Load Environment Variables

If using `.env.sonar`:

```bash
source .env.sonar
```

**Verify it's loaded:**

```bash
echo $SONAR_TOKEN
# Should print your token
```

### Step 4: Install Dependencies (If Needed)

```bash
# In project root
npm install

# In frontend directory
cd frontend
npm install
```

---

## 🏃 Running Analysis

### Method 1: Full Analysis (Recommended)

Runs tests with coverage, then performs SonarQube scan:

```bash
# Make sure token is loaded
source .env.sonar

# Run full analysis
cd frontend
npm run sonar
```

**What happens:**
1. ✅ Runs all tests with coverage
2. 📊 Generates `lcov.info` coverage report
3. 🔍 Scans code for issues
4. 📤 Uploads results to SonarQube
5. 🎉 Shows dashboard URL

**Expected output:**

```
🔍 Local SonarQube Analysis
======================================

📊 Configuration:
  Project: tenant-metrostar-advana-marketplace
  Host: https://sonarqube.cdao.us

🧪 Step 1/2: Running tests with coverage...
--------------------------------------
✅ Tests completed successfully

🔍 Step 2/2: Running SonarQube scanner...
--------------------------------------

======================================
✅ Analysis complete!

📊 View results at:
   https://sonarqube.cdao.us/dashboard?id=tenant-metrostar-advana-marketplace
```

### Method 2: Quick Scan (Skip Tests)

If you've already run tests and just want to scan:

```bash
cd frontend
npm run sonar:quick
```

⚠️ **Note:** This requires coverage reports to already exist from a previous test run.

### Method 3: Using Shell Script Directly

```bash
# From project root
source .env.sonar
./sonar-local.sh
```

### Method 4: Manual Scanner (Advanced)

```bash
# After running tests with coverage
cd frontend
npm run test:coverage

# Run scanner manually
cd ..
npx sonarqube-scanner \
  -Dsonar.projectKey=tenant-metrostar-advana-marketplace \
  -Dsonar.host.url=https://sonarqube.cdao.us \
  -Dsonar.token=$SONAR_TOKEN
```

---

## 📊 Viewing Results

### Dashboard

After analysis completes, view results at:

**https://sonarqube.cdao.us/dashboard?id=tenant-metrostar-advana-marketplace**

### What to Review

1. **Overview Tab**
   - Overall code quality rating
   - Reliability, Security, Maintainability ratings
   - Test coverage percentage
   - Code duplications

2. **Issues Tab**
   - Bugs (critical, high, medium, low)
   - Vulnerabilities
   - Code smells
   - Security hotspots

3. **Measures Tab**
   - Detailed metrics
   - Coverage reports
   - Complexity analysis

4. **Code Tab**
   - Browse source code
   - See issues inline

### Priority Actions

Fix issues in this order:

1. 🔴 **Critical Bugs** - Can cause system failures
2. 🔴 **Critical Vulnerabilities** - Security risks
3. 🟠 **Major Bugs** - Functional issues
4. 🟠 **Major Vulnerabilities** - Potential security issues
5. 🟡 **Code Smells** - Maintainability issues

---

## 🔧 Troubleshooting

### Error: "SONAR_TOKEN environment variable is not set"

**Problem:** Token not loaded in current terminal session.

**Solution:**

```bash
# Check if token is set
echo $SONAR_TOKEN

# If empty, load it
source .env.sonar

# Verify
echo $SONAR_TOKEN  # Should print your token
```

### Error: "sonarqube-scanner not found"

**Problem:** Scanner not installed.

**Solution:**

```bash
# Install globally
npm install -g sonarqube-scanner

# Or use npx (no installation needed)
npx sonarqube-scanner --version
```

### Error: "Coverage reports missing" or "lcov.info not found"

**Problem:** No coverage data available.

**Solution:**

```bash
# Run tests with coverage first
cd frontend
npm run test:coverage

# Then run sonar
npm run sonar
```

### Error: "401 Unauthorized" or "Invalid token"

**Problem:** Token is expired or incorrect.

**Solutions:**

1. **Check token expiration:**
   - Go to https://sonarqube.cdao.us
   - My Account → Security
   - Check expiration date

2. **Generate new token:**
   - Follow [Step 1](#step-1-get-your-sonarqube-token) again
   - Update `.env.sonar` with new token
   - Run `source .env.sonar`

3. **Verify token format:**
   - Should start with `sqp_`
   - No spaces before/after
   - Copied completely

### Tests Failing Before Scan

**Problem:** Tests fail, preventing scan.

**Solution:**

```bash
# Run tests to see failures
cd frontend
npm run test:verbose

# Fix failing tests
# Then run full analysis
npm run sonar
```

### Permission Denied on .env.sonar

**Problem:** Can't read environment file.

**Solution:**

```bash
# Check file permissions
ls -la .env.sonar

# Fix permissions
chmod 600 .env.sonar
```

### Token Works in Terminal But Not in Script

**Problem:** Environment not passed to script.

**Solution:**

```bash
# Make sure to source before running
source .env.sonar && npm run sonar

# Or add to script itself
# Edit frontend/package.json to include: source ../env.sonar &&
```

---

## ⚙️ Configuration Reference

### Project Structure

```
advana-marketplace/
├── .env.sonar              # Your token (gitignored)
├── .env.sonar.example      # Template
├── sonar-project.properties # SonarQube config
├── sonar-local.sh          # Analysis script
├── run-sonar-analysis.sh   # Alternative script
└── frontend/
    ├── package.json        # Contains npm scripts
    ├── coverage/           # Generated coverage
    └── src/               # Source code to analyze
```

### NPM Scripts (frontend/package.json)

| Script | Command | Description |
|--------|---------|-------------|
| `sonar` | `npm run sonar` | Full analysis (tests + scan) |
| `sonar:quick` | `npm run sonar:quick` | Quick scan only |
| `test:coverage` | `npm run test:coverage` | Generate coverage only |

### SonarQube Configuration (sonar-project.properties)

```properties
# Source code location
sonar.sources=frontend/src

# Test files location
sonar.tests=frontend/src

# Test file patterns
sonar.test.inclusions=**/*.test.tsx,**/*.test.ts

# Files to exclude from analysis
sonar.exclusions=**/node_modules/**,**/coverage/**,**/dist/**,**/build/**,**/*.test.tsx,**/*.test.ts

# TypeScript configuration
sonar.typescript.tsconfigPath=frontend/tsconfig.json

# Coverage report location
sonar.javascript.lcov.reportPaths=frontend/coverage/lcov.info
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SONAR_TOKEN` | **Yes** | - | Authentication token |
| `SONAR_HOST_URL` | No | `https://sonarqube.cdao.us` | SonarQube server URL |

---

## 🔒 Security Best Practices

### Do's ✅

- ✅ Store tokens in `.env.sonar` (gitignored)
- ✅ Use descriptive token names ("MacBook Local Dev")
- ✅ Set expiration dates on tokens
- ✅ Use password managers for token storage
- ✅ Revoke unused tokens regularly
- ✅ Use different tokens for different machines
- ✅ Keep `.env.sonar` permissions restrictive (`chmod 600`)

### Don'ts ❌

- ❌ Never commit `.env.sonar` to Git
- ❌ Don't share tokens with other developers
- ❌ Don't hardcode tokens in source files
- ❌ Don't use same token everywhere
- ❌ Don't store tokens in plaintext notes
- ❌ Don't skip token expiration

### Token Management

**Check current tokens:**
1. Go to https://sonarqube.cdao.us
2. My Account → Security
3. Review active tokens

**Revoke old tokens:**
1. Find token in list
2. Click "Revoke" button
3. Generate new token if needed

**If token is compromised:**
1. Revoke immediately in SonarQube
2. Generate new token
3. Update `.env.sonar`
4. Re-run `source .env.sonar`

---

## 📚 Additional Resources

### Documentation Files

- `SONARQUBE_GUIDE.md` - Detailed original guide
- `sonar-project.properties` - Configuration file
- `.env.sonar.example` - Environment template

### Useful Commands

```bash
# View coverage report locally
open frontend/coverage/lcov-report/index.html

# Run specific test file
npm test -- path/to/test.tsx

# Run tests in watch mode
npm run test:watch

# Lint code before analysis
npm run lint

# Full pre-push check
npm run beforepush
```

### Links

- **SonarQube Server:** https://sonarqube.cdao.us
- **Project Dashboard:** https://sonarqube.cdao.us/dashboard?id=tenant-metrostar-advana-marketplace
- **SonarQube Docs:** https://docs.sonarqube.org/

---

## 🎯 Quick Reference Card

### Setup Checklist

- [ ] Get SonarQube token from https://sonarqube.cdao.us
- [ ] Create/update `.env.sonar` file
- [ ] Load environment: `source .env.sonar`
- [ ] Verify token: `echo $SONAR_TOKEN`
- [ ] Run analysis: `cd frontend && npm run sonar`
- [ ] View results in dashboard

### Common Commands

```bash
# Load token
source .env.sonar

# Full analysis
cd frontend && npm run sonar

# Quick scan
cd frontend && npm run sonar:quick

# Just tests
cd frontend && npm run test:coverage

# View results
open https://sonarqube.cdao.us/dashboard?id=tenant-metrostar-advana-marketplace
```

### Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Token not set | `source .env.sonar` |
| Scanner not found | `npm install -g sonarqube-scanner` |
| No coverage | `npm run test:coverage` first |
| 401 Error | Generate new token, update `.env.sonar` |
| Tests failing | `npm run test:verbose` to debug |

---

## 📝 Notes

- Analysis typically takes 2-5 minutes
- Coverage threshold is set at 80%
- Run analysis before pushing code
- Review SonarQube results as part of code review
- Fix critical/blocker issues before merging

---

**Last Updated:** October 2025  
**Maintained by:** Development Team  
**Questions?** Check troubleshooting section or contact your team lead.
