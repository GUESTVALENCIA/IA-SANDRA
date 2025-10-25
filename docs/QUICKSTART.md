# Quickstart Guide

## Setup

1. Clone the repository and install dependencies:

```bash
git clone git@github.com:GUESTVALENCIA/IA-SANDRA.git
cd IA-SANDRA
npm install
```

2. Copy `.env.example` to `.env` and fill in required variables (see `config/env.js` for details).

3. Start the backend server for health checks and metrics:

```bash
npm start
```

4. Run the orchestrator bridge:

```bash
node sandra-mcp-bridge.js
```

5. Access the health endpoint at `http://localhost:3000/health` to verify the service is running.

## Running Tests

Run unit and integration tests:

```bash
npm test
```

## Building & Deploying

Build for production:

```bash
npm run build:production
```

Deploy to Netlify:

```bash
npm run deploy
```

For more details, see `docs/QUALITY-PASS-1.md` and `docs/QUALITY-PASS-2.md`.
