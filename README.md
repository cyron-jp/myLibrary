# MyLibrary

React + Vite + Tailwind + React Router + Zustand + Axios, with Supabase as the database/backend.

## Setup
1. Make a free project at supabase.com. In Authentication > Providers > Email, turn OFF "Confirm email".
2. Open SQL Editor, paste everything from `supabase.sql`, and run it.
3. Copy `.env.example` to `.env` and fill in the Project URL and anon key (Project Settings > API).
4. `npm install` then `npm run dev`.

## Making the admin account
1. Sign up normally on the site with the email you want for admin.
2. In the SQL Editor run: `update profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR_EMAIL');`
3. On the login page, click the logo 5 times. The dark "Staff access" form appears. Log in there.

## Deploy to Vercel
Push to GitHub, import the repo in Vercel, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` under Environment Variables, then deploy. `vercel.json` already handles page refreshes for React Router.
