# AI Interview Training System

## Quickstart

1) Env vars

Create a `.env` in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# Frontend → API base
VITE_API_BASE=http://localhost:4000

# Backend API
API_PORT=4000
```

2) Install & run

```
npm install
npm run api   # start Express API (http://localhost:4000)
npm run dev   # start Vite frontend (http://localhost:5174)
```

Open the printed Local URL.

## Supabase configuration

- Authentication → URL Configuration:
  - Site URL: http://localhost:5175
  - Redirect URLs: add http://localhost:5175
- Authentication → Providers:
  - Email: Enable. Configure SMTP in Project Settings → SMTP.
  - Phone: Enable. Configure SMS provider (e.g., Twilio) in Authentication → SMS.

## OTP Login

- On /login, switch to "Phone OTP".
- Enter phone in E.164 format (e.g., +15551234567), Send OTP, then Verify OTP.

### Authentication

- Standard email + password via the existing auth provider (no OTP).

### Resume and GitHub Analysis

- Upload a PDF resume and provide your GitHub profile URL on `Resume` page.
- Backend extracts basic skills from the PDF and fetches public repos to generate personalized questions.
- Endpoints:
  - POST `/uploads/resume` form-data: resume (pdf)
  - POST `/analyze/resume-github` { resumePath, githubUrl }

### Recording Interviews

- On `Live Interview`, use Start/Stop to record audio+video via MediaRecorder.
- Recording is saved locally by the backend in `recordings/` when stopping.
- Endpoint:
  - POST `/uploads/recording` form-data: recording (webm/mp4)

## Build

```
npm run build
```


