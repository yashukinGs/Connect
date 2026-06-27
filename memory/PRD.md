# CivicConnect — PRD & Build Log

## Original Problem Statement
Build CivicConnect — a Smart Citizen Issue Reporting Platform. A full-stack responsive web application that lets citizens report local civic issues (potholes, garbage, broken streetlights, water leakage, drainage issues, road damage, traffic signal faults, public property damage) and tracks them through to resolution. Premium dark-theme UI (black + navy blue), glassmorphism cards, framer-motion animations. Logo: location pin + shield + city skyline. Tagline: "Connecting Citizens. Solving Problems." User chose defaults: FastAPI + React + MongoDB stack, JWT auth, Emergent Object Storage, OpenStreetMap, core MVP feature set.

## Architecture
- **Backend**: FastAPI (Python) at `/app/backend/server.py` — JWT auth (httpOnly cookie + Bearer fallback), MongoDB via motor, Emergent Object Storage for images.
- **Frontend**: React (CRA) at `/app/frontend/src/` — Outfit + Plus Jakarta Sans fonts, Tailwind + custom CSS variables for dark theme, framer-motion, recharts, sonner toasts.
- **DB**: MongoDB — collections: `users`, `issues`, `notifications`, `officers`, `files`, `counters`, `contact_messages`, `password_reset_tokens`.

## User Personas
- **Citizen**: Registers, reports issues, tracks them, earns points + badges.
- **Administrator**: One-time registration with secret code; manages all complaints, assigns officers, updates status, monitors analytics.

## Pre-seeded Accounts
- Citizen: `citizen@civicconnect.in` / `Citizen@123`
- Admin: `admin@civicconnect.in` / `Admin@123`
- Admin secret code: `CIVIC-ADMIN-2026`

## Implemented (June 2026 - Initial MVP)
- Landing page with hero, features, how-it-works, stats, success stories, CTA
- Auth: citizen register/login + one-time admin register with secret code
- User Dashboard: stat cards (total/resolved/pending/under-review), recent activity, rewards/badge card
- Report Issue: title/category/priority/description, GPS detection, multi-photo upload, address
- Track Issue: search by Complaint ID (`CC-YYYY-NNNNN`), status timeline, progress bar, before/after photos
- Issue Detail page (authenticated)
- Admin Dashboard: 5 KPI cards, filters (status/category/priority/search), table, Manage modal with status update + officer assignment + resolution photo upload
- Analytics page: bar (by category), pie (by status), line (last 7 days) using recharts
- Community feed: resolved issues with before/after grid
- Leaderboard: top 20 contributors, badges (Bronze/Silver/Gold/City Hero)
- Notifications: bell icon, polling every 20s, unread badge, mark-all-read
- About / Contact / Works pages with OSM iframe embed
- Reward system: +10 pts on report, +25 pts on resolution
- E2E tested via testing subagent: 100% backend (25 pytest), 100% frontend

## P1 Backlog (Next)
- Forgot password full flow (reset-password endpoint to consume token)
- Tighten CORS to explicit origins, rate limiting on login
- Pagination for /issues
- Officer performance dashboard with assigned/resolved counts
- Multi-language toggle (English/Hindi/Marathi)
- Email notifications (Resend integration)

## P2 Backlog
- AI image verification + duplicate detection (Claude)
- Voice complaint recording (Whisper)
- SMS notifications (Twilio)
- PDF complaint export + QR code
- Chat support bot
- AWS migration playbook (S3/SNS/Lambda)
