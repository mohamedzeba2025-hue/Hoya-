# HOYA — Language Learning

Mobile-first language-learning app. Initial languages: English, Spanish, Italian. React + Vite, Supabase planned/connected backend.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Supabase account groundwork

The Supabase client, email/password auth helpers, and account-progress CRUD helpers are prepared in `src/lib/supabase.js`. The login/signup UI is not wired to the app yet.

1. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and **publishable key** (never put a service-role key in the frontend).
2. Apply `supabase/migrations/001_hoya_user_progress.sql` in the Supabase SQL Editor.
3. Install dependencies and run the app: `npm install`, then `npm run dev`.

The progress table uses row-level security so each authenticated learner can only read, insert, and update their own row. The account UI and merging local progress with cloud progress remain to be implemented and tested.