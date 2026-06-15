# CE DocuSeal Proxy

Backend proxy for the Concept Engineers Word Add-in.
Receives proposal data from the Add-in and sends it to DocuSeal API.

## Why this exists

The Word Add-in runs in a browser context and cannot call the DocuSeal API
directly due to CORS restrictions. This proxy sits in between:

```
Word Add-in → localhost:5000/api/send-proposal → api.docuseal.com
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in:

```
DOCUSEAL_API_KEY=your_key_here        ← DocuSeal → Settings → API → Create API Key
DOCUSEAL_TEMPLATE_ID=4298532          ← from your template URL
DOCUSEAL_ROLE=First Party             ← must match role name in your template exactly
PORT=5000
CORS_ORIGIN=https://localhost:3000
```

### 3. Run

**Development (auto-restart on file changes):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

You should see:
```
─────────────────────────────────────────
  CE DocuSeal Proxy — Running
  URL:      http://localhost:5000
  Health:   http://localhost:5000/health
  Endpoint: POST http://localhost:5000/api/send-proposal
─────────────────────────────────────────
```

---

## API

### GET /health
Check the server is running.

**Response:**
```json
{ "status": "ok", "timestamp": "...", "service": "CE DocuSeal Proxy" }
```

---

### POST /api/send-proposal
Send a proposal to a client via DocuSeal.

**Request body:**
```json
{
  "client_name": "John Smith",
  "client_email": "john@email.com",
  "project_type": "Residential",
  "project_address": "123 Example St, Sydney NSW 2000",
  "fee": "2500"
}
```

**project_type** must be one of: `Residential`, `Commercial`, `Subdivision`

**Success response (200):**
```json
{
  "success": true,
  "message": "Proposal sent to john@email.com",
  "signingUrl": "https://docuseal.com/s/XXXXXX",
  "submissionId": 12345
}
```

**Error response (400 / 500):**
```json
{
  "error": "client_email is required."
}
```

---

## Project structure

```
ce-proxy/
├── src/
│   ├── server.js      ← Express app, middleware, startup
│   ├── routes.js      ← API route handlers
│   ├── docuseal.js    ← DocuSeal API calls
│   ├── validator.js   ← Request body validation
│   └── config.js      ← Environment config
├── .env.example       ← Copy to .env and fill in values
├── package.json
└── README.md
```

---

## Keep running while using the Add-in

This proxy must be running in a terminal whenever staff use the Word Add-in.
Leave the terminal open. If the machine restarts, run `npm start` again.
