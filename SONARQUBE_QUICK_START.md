# Quick Reference: SonarQube Commands (Root Level)

## 🎯 Quick Start

**Important**: All commands must be run from the **root** directory!

```bash
# 1. Navigate to root
cd /path/to/advana-marketplace

# 2. Install dependencies (first time only)
npm install

# 3. Setup your token (first time only)
cp .env.sonar.template .env.sonar
# Edit .env.sonar and add your token

# 4. Run a full analysis
npm run sonar:full
```

## 📋 Command Cheat Sheet

**Run all commands from root directory:**

```bash
# Check if token is configured
npm run sonar:check

# Validate full setup
npm run sonar:validate

# Run basic scan
npm run sonar

# Run scan with auto-loaded token
npm run sonar:local

# Scan current git branch
npm run sonar:branch

# Generate HTML report
npm run sonar:report

# Full workflow: test + scan + report (allows test failures)
npm run sonar:full

# Full workflow: test + scan + report (requires passing tests)
npm run sonar:full:unit
```

## 🔧 What Was Changed

### Root Level (`advana-marketplace/`)

**Files Added/Updated:**
- ✅ `package.json` - Added 9 comprehensive `sonar:*` scripts
- ✅ `sonar-token-check.sh` - Token validation script (copied from frontend)
- ✅ `.env.sonar.template` - Token template (copied from frontend)
- ✅ `sonar-project.properties` - Updated with better coverage config
- ✅ `SONARQUBE_COMMANDS.md` - Full documentation
- ✅ Added 3 devDependencies:
  - `sonar-scanner`
  - `sonar-report`
  - `sonarqube-scanner` (upgraded)

### Frontend Level (`frontend/`)

**Cleaned Up:**
- ✅ Removed all `sonar:*` scripts from `package.json`
- ✅ Removed `sonar-token-check.sh`
- ✅ Removed `.env.sonar.template`
- ✅ Removed `sonar-project.properties`
- ✅ Removed `SONARQUBE_COMMANDS.md`
- ✅ Removed `SONARQUBE_QUICK_START.md`
- ✅ Removed SonarQube dependencies from devDependencies

## 📁 Directory Structure

```plaintext
advana-marketplace/                    ← RUN COMMANDS HERE
├── package.json                       ← Contains sonar:* scripts
├── sonar-project.properties           ← Config (analyzes frontend/src)
├── sonar-token-check.sh               ← Validation script
├── .env.sonar                         ← Your token (gitignored)
├── .env.sonar.template                ← Token template
├── SONARQUBE_COMMANDS.md              ← Full docs (this lives here now)
└── frontend/
    ├── src/                           ← Source code to analyze
    ├── coverage/                      ← Coverage reports
    └── package.json                   ← No sonar scripts here!
```

## ⚠️ Important Notes

1. **Always run from root**: Do NOT run SonarQube commands from `frontend/`
2. **Frontend tests**: The `sonar:full` commands automatically `cd` into frontend to run tests, then return to root for scanning
3. **Configuration**: `sonar-project.properties` at root points to `frontend/src` and `frontend/coverage`

## 🎉 Your Repository Now Matches Backend Pattern

Both frontend and backend repositories now have consistent SonarQube capabilities at the root level:
- ✅ Token validation
- ✅ Local scanning
- ✅ Branch-specific analysis
- ✅ HTML report generation
- ✅ Full workflow automation
- ✅ All run from repository root
