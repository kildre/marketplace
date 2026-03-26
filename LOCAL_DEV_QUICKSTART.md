# Local Dev Quickstart

Follow these steps in order: start the backend first, then the frontend.

## 1) Start Backend (`advana-marketplace-monolith-node`)

```bash
cd /Users/kberres/dev/CDAO/advana-marketplace-monolith-node
```

1. Create your environment file:

```bash
cp .env.example .env
```

2. Start local dependencies (Postgres/Redis):

```bash
docker compose up
```

3. In a second terminal, start the backend server:

```bash
cd /Users/kberres/dev/CDAO/advana-marketplace-monolith-node
npm install
npm run start
```

Backend is now running.

## 2) Start Frontend (`advana-marketplace/frontend`)

In a new terminal:

```bash
cd /Users/kberres/dev/CDAO/advana-marketplace/frontend
npm install
npm run dev
```

Frontend runs on port `8080` by default.
Open http://localhost:8080 in your browser.
