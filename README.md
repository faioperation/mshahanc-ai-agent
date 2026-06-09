# 🍽️ Catering Agent — AI Outreach Platform

An AI-powered lead generation and outreach automation platform for catering businesses. Automatically finds qualified leads, generates personalized outreach messages using GPT-4o, sends emails and SMS, and tracks replies — all from a single dashboard.

---

## ✨ Features

- **Lead Generation** — Scrapes Google Places via Apify to find nearby businesses
- **AI Message Generation** — GPT-4o writes personalized email + SMS for each lead
- **Automated Outreach** — Sends via Gmail (n8n) and Twilio SMS
- **Campaign Management** — Run event-based outreach campaigns for all qualified leads at once
- **Reply Detection** — Automatically detects email and SMS replies via n8n workflows
- **Review Queue** — Approve or reject AI-generated messages before sending
- **Real-time Dashboard** — Live pipeline overview with auto-refresh every 30 seconds

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TailwindCSS + Zustand |
| Backend | FastAPI + Python |
| Database | Airtable |
| AI | OpenAI GPT-4o |
| Automation | n8n (cloud) |
| SMS | Twilio |
| Email | Gmail via n8n |
| Lead Scraping | Apify (Google Places) |

---

## 📁 Project Structure

```
catering-agent/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── airtable/     # Airtable repos
│   │   ├── constants/    # Status enums
│   │   ├── models/       # Data models
│   │   ├── routers/      # API endpoints
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helpers
│   ├── .env              # Environment variables
│   └── requirements.txt
└── frontend/             # React frontend
    ├── src/
    │   ├── api/          # API clients
    │   ├── components/   # UI components
    │   ├── hooks/        # Custom hooks
    │   ├── pages/        # Page components
    │   └── store/        # Zustand stores
    └── package.json
```

---

## ⚙️ Prerequisites

- Python 3.10+
- Node.js 18+
- n8n cloud account
- Airtable account
- OpenAI API key
- Twilio account
- Apify account
- ngrok (for local development)

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/catering-agent.git
cd catering-agent
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create `.env` file in the `backend` folder:

```env
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8000

AIRTABLE_TOKEN=your_airtable_token
AIRTABLE_BASE_ID=your_airtable_base_id

OPENAI_API_KEY=your_openai_api_key

APIFY_TOKEN=your_apify_token
APIFY_ACTOR_ID=compass~crawler-google-places

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
GMAIL_SENDER_EMAIL=your@gmail.com

N8N_EMAIL_WEBHOOK_URL=https://your-n8n.app.n8n.cloud/webhook/send-email
N8N_SMS_WEBHOOK_URL=https://your-n8n.app.n8n.cloud/webhook/sms-data

TEST_MODE=false
TEST_EMAIL=
TEST_PHONE=
```

Initialize Airtable tables:

```bash
# Tables are auto-created on first backend start
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

Create `.env` file in the `frontend` folder:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### 4. n8n Workflow Setup

Import the two workflow JSON files into your n8n cloud instance:

- `mshahanc - test.json` — Email send + SMS send workflows
- `reply_detection_workflow.json` — Gmail reply detection + Twilio incoming SMS

After import, activate both workflows.

---

## ▶️ Running the Project

### Start Backend

```bash
cd backend
venv\Scripts\activate   # Windows
# or
source venv/bin/activate  # Mac/Linux

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Start ngrok (for n8n reply detection)

```bash
ngrok http 8000
```

Update the ngrok URL in n8n's reply detection workflow HTTP Request nodes.

---

## 🔧 Initial Configuration

After starting the project, configure settings via Postman or the Settings page:

```
PATCH http://localhost:8000/api/settings
```

```json
{
  "restaurant_name": "Your Restaurant Name",
  "contact_name": "Your Name",
  "restaurant_address": "123 Main St, Los Angeles, CA 90001",
  "restaurant_lat": 34.0522,
  "restaurant_lng": -118.2437,
  "default_radius_miles": 10,
  "auto_send": false
}
```

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/leads/generate` | Generate leads from Google Places |
| GET | `/api/leads` | List all leads |
| GET | `/api/messages/review-queue` | Get pending messages |
| POST | `/api/messages/approve` | Approve a message |
| GET | `/api/events/all` | Get all events |
| POST | `/api/campaigns/` | Create a campaign |
| GET | `/api/dashboard/overview` | Get dashboard stats |
| PATCH | `/api/settings` | Update settings |

Full API docs: `http://localhost:8000/docs`

---

## 📝 License

MIT

---

## 🌐 Production Deployment

### Backend Deployment

**Option 1 — Railway (Recommended)**

```bash
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```

Set all `.env` variables in Railway dashboard → Variables tab.

**Option 2 — Render**

1. Create new **Web Service** on render.com
2. Connect your GitHub repo
3. Root directory: `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add all environment variables in Environment tab

**Option 3 — VPS (Ubuntu)**

```bash
sudo apt update && sudo apt install python3-pip python3-venv nginx
git clone https://github.com/your-username/catering-agent.git
cd catering-agent/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

### Frontend Deployment

**Option 1 — Vercel (Recommended)**

```bash
npm install -g vercel
cd frontend
vercel
```

Set environment variable in Vercel dashboard:
```
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

**Option 2 — Netlify**

```bash
cd frontend
npm run build
# Deploy dist/ folder to Netlify
```

---

### After Deployment — Update n8n Workflows

1. Open `Reply Detection - Gmail & SMS` workflow in n8n
2. `Send to Backend (Gmail)` node → Update URL:
```
https://your-backend-url/api/replies/gmail-webhook
```
3. `Send to Backend (SMS)` node → Update URL:
```
https://your-backend-url/api/replies/twilio-webhook
```
4. Remove `ngrok-skip-browser-warning` header from both nodes
5. Save and keep workflow Published

---

### Production Environment Variables Checklist

| Variable | Notes |
|----------|-------|
| `APP_ENV` | Change to `production` |
| `AIRTABLE_TOKEN` | Same as local |
| `OPENAI_API_KEY` | Same as local |
| `N8N_EMAIL_WEBHOOK_URL` | Same n8n URL |
| `N8N_SMS_WEBHOOK_URL` | Same n8n URL |
| `TEST_MODE` | Keep as `false` |
| `TEST_EMAIL` | Leave empty |
| `TEST_PHONE` | Leave empty |