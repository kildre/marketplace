# Local Development Setup Guide

> **Quick Start Guide for Running Advana Marketplace Locally with Mock Authentication**

This guide will help you set up and run the entire Advana Marketplace application on your local machine using mocked Keycloak authentication. No external Keycloak server required!

**⏱️ Expected Setup Time:** ~10 minutes

**📚 For Production Setup:** See [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) and [PRODUCTION_AUTH_SETUP.md](PRODUCTION_AUTH_SETUP.md)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Using Mock Authentication](#using-mock-authentication)
6. [Testing the Complete Workflow](#testing-the-complete-workflow)
7. [Development Tools](#development-tools)
8. [Troubleshooting](#troubleshooting)
9. [Running Tests](#running-tests)
10. [Next Steps](#next-steps)
11. [Quick Reference](#quick-reference)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Software | Minimum Version | Check Command |
|----------|----------------|---------------|
| **Node.js** | 16.17.0 | `node --version` |
| **npm** | 8.0.0 | `npm --version` |
| **PostgreSQL** | Any recent version | `psql --version` |
| **Git** | Any recent version | `git --version` |

### Installation Links

- **Node.js & npm:** [https://nodejs.org/](https://nodejs.org/)
- **PostgreSQL:** [https://www.postgresql.org/download/](https://www.postgresql.org/download/) or `brew install postgresql@16` (macOS)
- **Git:** [https://git-scm.com/](https://git-scm.com/)

---

## Architecture Overview

The Advana Marketplace consists of three main components running locally:

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Local Machine                       │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   Frontend       │         │   Backend        │         │
│  │   (React/Vite)   │────────▶│   (Express.js)   │         │
│  │                  │  HTTP   │                  │         │
│  │  Port: 8080      │         │  Port: 8082      │         │
│  │                  │         │                  │         │
│  │  Mock Keycloak   │         │  Mock Auth       │         │
│  │  Token Generator │         │  Bypass Mode     │         │
│  └──────────────────┘         └────────┬─────────┘         │
│                                        │                    │
│                                        │ SQL                │
│                                        ▼                    │
│                              ┌──────────────────┐          │
│                              │   PostgreSQL     │          │
│                              │   Database       │          │
│                              │                  │          │
│                              │  Port: 5432      │          │
│                              └──────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Authentication Flow:
Frontend → Generates mock JWT token → Backend → Validates mock token → Allow access
                                                  (No Keycloak server needed)
```

**Key Points:**
- **No External Keycloak Server Required** - Mock tokens are used for local development
- **All Communication is Local** - No cloud services needed
- **Real Database Persistence** - All data stored in local PostgreSQL

---

## Backend Setup

The backend must be set up and running before starting the frontend.

### Step 1: Navigate to Backend Repository

```bash
cd /Users/kberres/dev/CDAO/advana-marketplace-monolith-node
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected Output:**
```
added XXX packages in XXs
```

### Step 3: Verify Environment Configuration

Check that the `.env` file exists and contains the following key settings:

```bash
cat .env | grep -E "KEYCLOAK_BYPASS_AUTH|PORT|secret-env-postgresql|CORS_ORIGIN"
```

**Expected Output:**
```
KEYCLOAK_BYPASS_AUTH=true
PORT=8082
secret-env-postgresql=postgres://postgres:password@localhost:5432/advana-marketplace-monolith-db
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:8080
```

✅ If these values are present, your backend is configured correctly for local development.

### Step 4: Create PostgreSQL Database

```bash
# Standard command (if you have postgres user)
createdb -U postgres advana-marketplace-monolith-db
```

**Alternative if `postgres` user doesn't exist:**
```bash
# Create without specifying user
createdb advana-marketplace-monolith-db
```

**Verify Database Creation:**
```bash
psql -U postgres -l | grep advana-marketplace
```

**Expected Output:**
```
advana-marketplace-monolith-db | postgres | UTF8     | ...
```

### Step 5: Run Database Migrations

This creates all necessary tables (users, requests, decisions, products, etc.):

```bash
npm run db:migrate
```

**Expected Output:**
```
Sequelize CLI [Node: XX.X.X]

Loaded configuration file "src/main/config/sequelizeCLIConfig.cjs".
Using environment "development".
== 2025_07_16-01-create_marketplace_user_table: migrating =======
== 2025_07_16-01-create_marketplace_user_table: migrated (0.XXXs)
== 2025_07_16-02-create_role_table: migrating =======
== 2025_07_16-02-create_role_table: migrated (0.XXXs)
...
```

### Step 6: (Optional) Seed Database

Load initial data including sample products:

```bash
npm run db:seed
```

### Step 7: Start Backend Server

```bash
npm start
```

**Expected Output:**
```
✅ Connected to PostgreSQL database
✅ Running migrations...
✅ Migrations complete
⚠️  KEYCLOAK_BYPASS_AUTH=true - Mock authentication enabled for development
Server listening on http://0.0.0.0:8082
```

**⚠️ Leave this terminal running** - The backend server needs to stay active.

### Step 8: Verify Backend is Running

In a **new terminal**, test the backend health endpoint:

```bash
curl http://localhost:8082/actuator/health
```

**Expected Response:**
```json
{"status":"UP"}
```

✅ **Backend Setup Complete!** The backend is now running and ready to accept requests.

---

## Frontend Setup

### Step 1: Navigate to Frontend Repository

Open a **new terminal** and run:

```bash
cd /Users/kberres/dev/CDAO/advana-marketplace/frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected Output:**
```
added XXX packages in XXs
```

### Step 3: Verify Environment Configuration

Check that `.env.development` exists and contains mock authentication settings:

```bash
cat .env.development | grep -E "VITE_BYPASS_AUTH|VITE_API_BASE_URL"
```

**Expected Output:**
```
VITE_BYPASS_AUTH=true
VITE_API_BASE_URL=http://localhost:8082
```

✅ If these values are present, your frontend is configured correctly.

### Step 4: Start Frontend Development Server

```bash
npm run dev
```

**Expected Output:**
```
VITE v6.3.5  ready in XXX ms

➜  Local:   http://localhost:8080/
➜  Network: use --host to expose
➜  press h to show help
```

**⚠️ Leave this terminal running** - The frontend dev server needs to stay active.

### Step 5: Open Application in Browser

Navigate to: **http://localhost:8080**

You should see the Advana Marketplace homepage with a **Mock User Switcher** panel in the bottom-left corner.

✅ **Frontend Setup Complete!** The application is now running with mock authentication.

---

## Using Mock Authentication

### Mock User Switcher UI

When `VITE_BYPASS_AUTH=true`, a draggable panel appears in the **bottom-left corner** of the screen:

- **Click** the panel to expand and see available users
- **Select** any user to instantly switch roles
- **No page reload** required - the app updates immediately

### Available Mock Users

| Username | Email | Roles | Capabilities |
|----------|-------|-------|--------------|
| **requestor_vinoth** | vinoth@advana.mil | `marketplace-requestor` | ✅ Browse products<br>✅ Create requests<br>✅ View own requests<br>❌ Cannot approve |
| **requestor_elizabeth** | elizabeth@advana.mil | `marketplace-requestor` | ✅ Browse products<br>✅ Create requests<br>✅ View own requests<br>❌ Cannot approve |
| **approver_joanna** | joanna@advana.mil | `marketplace-approver` | ✅ View all requests<br>✅ Approve/Deny requests<br>✅ View reports<br>❌ Cannot create requests |
| **approver_jennifer** | jennifer@advana.mil | `marketplace-approver` | ✅ View all requests<br>✅ Approve/Deny requests<br>✅ View reports<br>❌ Cannot create requests |
| **kberres** (custom) | kberres@advana.mil | `marketplace-approver`<br>`marketplace-requestor` | ✅ **Full Access**<br>✅ Create requests<br>✅ Approve/Deny<br>✅ View everything |

### How Mock Tokens Work

**Technical Flow:**

1. **Frontend** generates a mock JWT token in format: `mock.{base64-payload}.signature`
2. **Token payload** contains:
   - User email
   - First/last name
   - Roles array
3. **Frontend** sends token via `Authorization: Bearer {mock-token}` header
4. **Backend** detects the `mock.` prefix
5. **Backend** decodes the base64 payload (skips Keycloak introspection)
6. **Backend** extracts user info and roles from payload
7. **Request proceeds** with authenticated user context

**No external authentication server is contacted** - everything runs locally!

---

## Testing the Complete Workflow

Let's walk through the full request → approval workflow:

### 1. Create a Request (as Requestor)

1. **Switch to Requestor User:**
   - Click the Mock User Switcher panel
   - Select **`requestor_vinoth`**

2. **Browse and Add Products:**
   - Navigate to the **Marketplace** or **Products** page
   - Browse available tools/products
   - Click **"Add to Cart"** for desired items

3. **Fill Out Request Form:**
   - Navigate to **Cart** or **Submit Request**
   - Fill in required fields:
     - Tool/Product name
     - Description and use case
     - Organization details
     - Point of contact information
   - Review cart items

4. **Submit Request:**
   - Click **"Submit Request"**
   - You'll see a success message with a **request number** (e.g., `REQ-2026-001`)
   - Note this number for verification

### 2. View Pending Requests (as Approver)

1. **Switch to Approver User:**
   - Click the Mock User Switcher panel
   - Select **`approver_joanna`**

2. **Navigate to Pending Requests:**
   - Go to **Pending Requests** or **Requests** page
   - You should see the request you just created

3. **View Request Details:**
   - Click on the request to see full details
   - Review:
     - Requestor information
     - Products requested
     - Description and justification

### 3. Approve or Deny Request

1. **Make Decision:**
   - While viewing the request details, choose **Approve** or **Deny**
   - Add **comments** explaining your decision

2. **Submit Decision:**
   - Click **"Submit"** or **"Approve"** button
   - You'll see a success message with a **decision number** (e.g., `DEC-2026-001`)

3. **Verify Status Change:**
   - Request status should update to **APPROVED** or **DENIED**
   - Notification may appear for the requestor

### 4. Verify Database Storage

Open a **new terminal** and connect to PostgreSQL:

```bash
psql -U postgres advana-marketplace-monolith-db
```

**View all requests:**
```sql
SELECT request_number, requested_tool_name, created_at FROM use_case_requests;
```

**Expected Output:**
```
 request_number |  requested_tool_name  |       created_at
----------------+-----------------------+------------------------
 REQ-2026-001   | Data Analytics Tool   | 2026-02-12 10:30:00
```

**View all decisions:**
```sql
SELECT decision_number, comments, created_at FROM decisions;
```

**Expected Output:**
```
 decision_number |          comments          |       created_at
-----------------+----------------------------+------------------------
 DEC-2026-001    | Approved for mission use   | 2026-02-12 10:35:00
```

**Exit PostgreSQL:**
```sql
\q
```

✅ **Workflow Complete!** Data is successfully stored in your local database.

---

## Development Tools

### Browser Console Debugging

The frontend provides helpful debugging utilities accessible via the browser console (press **F12** or **Cmd+Option+I**):

#### Available Commands

```javascript
// View all API configuration
window.debugAdvana.logApiConfig()

// Get environment information
window.debugAdvana.getEnvironmentInfo()

// Debug authentication state
window.debugAdvana.debugAuth()

// Get API URL for a path
window.debugAdvana.getApiUrl('/api/requests')

// Access Keycloak instance
window.keycloak

// View current token
window.keycloak.token

// View user info
window.keycloak.tokenParsed
```

#### Example Debug Session

```javascript
// Check authentication status
> window.debugAdvana.debugAuth()

{
  isAuthenticated: true,
  user: {
    email: "vinoth@advana.mil",
    firstName: "Vinoth",
    lastName: "Requestor",
    roles: ["marketplace-requestor"]
  },
  token: "mock.eyJlbWFpbCI6InZpbm90aEBhZHZhbmEubWlsIiwicm9sZXMiOlsibWFya2V0cGxhY2UtcmVxdWVzdG9yIl19.sig",
  bypassAuthEnabled: true
}
```

### Backend Logs

**Console Output:**
- The backend terminal shows all HTTP requests, database queries, and errors
- Log format: `[timestamp] [level] message`

**Log Files:**
- Location: `logs/` directory in backend repository
- Rotation: Daily with automatic cleanup
- Levels: `error`, `warn`, `info`, `debug`

**Example:**
```
[2026-02-12 10:30:15] INFO: POST /api/requests - 201 Created
[2026-02-12 10:30:15] DEBUG: Created request REQ-2026-001 for user vinoth@advana.mil
```

### Hot Module Replacement (HMR)

**Frontend (Vite):**
- ✅ **Automatic** - File changes trigger instant browser updates
- No manual refresh needed
- Preserves application state

**Backend (Express.js):**
- ❌ **No HMR** - Manual restart required after code changes
- Stop server: **Ctrl+C** in backend terminal
- Restart: `npm start`

---

## Troubleshooting

### Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::8082
```

**Solution:**
```bash
# Kill process on port 8082 (backend)
lsof -ti:8082 | xargs kill -9

# Kill process on port 8080 (frontend)
lsof -ti:8080 | xargs kill -9

# Then restart the server
npm start
```

---

### PostgreSQL Not Running

**Error Message:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Start PostgreSQL (Homebrew - macOS)
brew services start postgresql@16

# Or manually
pg_ctl -D /opt/homebrew/var/postgresql@16 start

# Verify it's running
pg_isready
```

**Expected Output:**
```
/tmp:5432 - accepting connections
```

---

### Database Connection Error

**Error Message:**
```
SequelizeConnectionError: database "advana-marketplace-monolith-db" does not exist
```

**Solution:**
```bash
# Verify PostgreSQL is running
psql -U postgres -l

# Create the database
createdb -U postgres advana-marketplace-monolith-db

# Retry migrations
npm run db:migrate
```

---

### Migration Failed

**Error Message:**
```
ERROR: relation "XXX" already exists
```

**Solution:**
```bash
# Undo last migration
npm run db:migrate:undo

# Or undo all migrations
npm run db:migrate:undo:all

# Then retry
npm run db:migrate
```

---

### CORS Errors in Browser Console

**Error Message:**
```
Access to fetch at 'http://localhost:8082/api/requests' from origin 'http://localhost:8080' has been blocked by CORS policy
```

**Solution:**

1. Check backend `.env` file:
   ```bash
   grep CORS_ORIGIN /Users/kberres/dev/CDAO/advana-marketplace-monolith-node/.env
   ```

2. Ensure it includes frontend port:
   ```
   CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:8080
   ```

3. Restart backend server:
   ```bash
   # In backend terminal: Ctrl+C then
   npm start
   ```

4. Clear browser cache and hard reload:
   - **Mac:** Cmd+Shift+R
   - **Windows/Linux:** Ctrl+Shift+R

---

### Mock Token Not Working

**Symptoms:**
- 401 Unauthorized errors
- Can't switch users
- Mock User Switcher not visible

**Solution:**

1. **Verify frontend bypass auth:**
   ```bash
   grep VITE_BYPASS_AUTH /Users/kberres/dev/CDAO/advana-marketplace/frontend/.env.development
   ```
   Should be: `VITE_BYPASS_AUTH=true`

2. **Verify backend bypass auth:**
   ```bash
   grep KEYCLOAK_BYPASS_AUTH /Users/kberres/dev/CDAO/advana-marketplace-monolith-node/.env
   ```
   Should be: `KEYCLOAK_BYPASS_AUTH=true`

3. **Check browser console:**
   ```javascript
   window.keycloak
   window.debugAdvana.debugAuth()
   ```

4. **Hard refresh browser:**
   - **Mac:** Cmd+Shift+R
   - **Windows/Linux:** Ctrl+Shift+R

---

### Frontend Can't Connect to Backend

**Error Message:**
```
Failed to fetch
Network request failed
```

**Solution:**

1. **Verify backend is running:**
   ```bash
   curl http://localhost:8082/actuator/health
   ```

2. **Check frontend API URL:**
   ```bash
   grep VITE_API_BASE_URL /Users/kberres/dev/CDAO/advana-marketplace/frontend/.env.development
   ```
   Should be: `VITE_API_BASE_URL=http://localhost:8082`

3. **Check backend port:**
   ```bash
   grep PORT /Users/kberres/dev/CDAO/advana-marketplace-monolith-node/.env
   ```
   Should be: `PORT=8082`

4. **Restart both servers** if ports were changed

---

### No Mock User Switcher Visible

**Symptoms:**
- Can't see the user switcher panel in bottom-left corner

**Solution:**

1. **Verify bypass auth is enabled:**
   ```bash
   grep VITE_BYPASS_AUTH /Users/kberres/dev/CDAO/advana-marketplace/frontend/.env.development
   ```
   Must be: `VITE_BYPASS_AUTH=true`

2. **Check browser console for errors:**
   - Press F12 or Cmd+Option+I
   - Look for JavaScript errors in Console tab

3. **Hard refresh:**
   - **Mac:** Cmd+Shift+R
   - **Windows/Linux:** Ctrl+Shift+R

4. **Verify Vite loaded the correct mode:**
   - Check browser console for: "Mock Auth Enabled" or similar message

---

## Running Tests

### Backend Tests

Navigate to backend repository:
```bash
cd /Users/kberres/dev/CDAO/advana-marketplace-monolith-node
```

**Run All Tests:**
```bash
npm test
```

**Run Unit Tests Only:**
```bash
npm run test:unit
```

**Run Integration Tests Only:**
```bash
npm run test:int
```

**Expected Output:**
```
Test Suites: X passed, X total
Tests:       X passed, X total
Snapshots:   0 total
Time:        Xs
```

---

### Frontend Tests

Navigate to frontend repository:
```bash
cd /Users/kberres/dev/CDAO/advana-marketplace/frontend
```

**Run All Tests:**
```bash
npm test
```

**Run Tests in Watch Mode:**
```bash
npm run test:watch
```

**Run Tests with Coverage:**
```bash
npm run test:coverage
```

**Run Accessibility Tests Only:**
```bash
npm run test:a11y
```

**Expected Output:**
```
✓ src/components/Example.test.tsx (X tests)
   ✓ renders correctly
   ✓ handles user interaction

Test Files  X passed (X)
     Tests  X passed (X)
```

---

## Next Steps

### Explore the Codebase

Now that everything is running, you can explore:

**Frontend Code:**
- `/frontend/src/` - All React components and logic
- `/frontend/src/components/` - Reusable UI components
- `/frontend/src/pages/` - Page-level components
- `/frontend/src/services/` - API and auth services
- `/frontend/src/contexts/` - React contexts (including MockKeycloak)

**Backend Code:**
- `/src/main/` - All backend logic
- `/src/main/web/controllers/` - Request handlers
- `/src/main/service/` - Business logic
- `/src/main/rdbms/entities/` - Database models
- `/src/main/config/authConfig.ts` - Authentication middleware

### Learn About Production Setup

This guide focused on **local development with mock authentication**. For production deployment with **real Keycloak**, see:

**Frontend Documentation:**
- [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) - Comprehensive auth guide
- [PRODUCTION_AUTH_SETUP.md](PRODUCTION_AUTH_SETUP.md) - Production configuration
- [TOKEN_PASSING_GUIDE.md](TOKEN_PASSING_GUIDE.md) - Token handling details
- [USER_ROLES_SETUP.md](USER_ROLES_SETUP.md) - Role configuration

**Backend Documentation:**
- [MARKETPLACE_KEYCLOAK.md](../marketplace-monolith-node/MARKETPLACE_KEYCLOAK.md) - Backend Keycloak integration
- [README.md](../marketplace-monolith-node/README.md) - Backend setup and deployment

### Additional Documentation

**API & Data:**
- [API_CONFIG_GUIDE.md](API_CONFIG_GUIDE.md) - API configuration system
- [DATA_ARCHITECTURE.md](DATA_ARCHITECTURE.md) - Data structure and models

**Development:**
- [ROLE_BASED_RENDERING.md](ROLE_BASED_RENDERING.md) - Conditional UI by role
- [REDUX_CART_IMPLEMENTATION.md](REDUX_CART_IMPLEMENTATION.md) - State management

**Testing & Quality:**
- [HOW_TO_ADD_TEST_COVERAGE.md](HOW_TO_ADD_TEST_COVERAGE.md) - Testing guide
- [TEST_COVERAGE_SUMMARY.md](TEST_COVERAGE_SUMMARY.md) - Coverage report
- [SONARQUBE_COMPLETE_GUIDE.md](SONARQUBE_COMPLETE_GUIDE.md) - Code quality

### Contributing

Before making changes:

1. **Run Linter:**
   ```bash
   npm run lint
   ```

2. **Run Tests:**
   ```bash
   # Frontend
   npm run beforepush

   # Backend
   npm test
   ```

3. **Follow Existing Patterns:**
   - Use TypeScript types
   - Match existing code style
   - Write tests for new features

---

## Quick Reference

### TL;DR - Get Running in 2 Minutes

**Terminal 1 - Backend:**
```bash
cd /Users/kberres/dev/CDAO/advana-marketplace-monolith-node
npm install
createdb -U postgres advana-marketplace-monolith-db
npm run db:migrate
npm start
```

**Terminal 2 - Frontend:**
```bash
cd /Users/kberres/dev/CDAO/advana-marketplace/frontend
npm install
npm run dev
```

**Then open:** http://localhost:8080

---

### Common Commands

**Database:**
```bash
# Create database
createdb -U postgres advana-marketplace-monolith-db

# Connect to database
psql -U postgres advana-marketplace-monolith-db

# View requests
SELECT * FROM use_case_requests;

# View decisions
SELECT * FROM decisions;

# Exit PostgreSQL
\q
```

**Backend:**
```bash
# Start server
npm start

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Run tests
npm test
```

**Frontend:**
```bash
# Start dev server
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Build for production
npm run build
```

---

### Port Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend Dev Server | 8080 | http://localhost:8080 |
| Backend API | 8082 | http://localhost:8082 |
| PostgreSQL Database | 5432 | localhost:5432 |

---

### Environment Files

| File | Location | Purpose |
|------|----------|---------|
| `.env.development` | `frontend/` | Frontend development config |
| `.env` | Backend root | Backend configuration |

---

## Need Help?

**Documentation Issues?**
- Check existing documentation in `/frontend/` and `/backend/` directories
- Look for `*.md` files related to your issue

**Technical Issues?**
- Review the [Troubleshooting](#troubleshooting) section above
- Check browser console (F12) for errors
- Check backend terminal for error logs

**Questions?**
- Refer to comprehensive guides in the repository
- Check the [Next Steps](#next-steps) section for specific topics

---

**Happy Coding! 🚀**
