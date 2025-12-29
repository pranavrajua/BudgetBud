Supabase setup for Budget Bud (free tier)

1) Create a free Supabase project
- Go to https://app.supabase.com and create a free project. Note the project URL and anon/public API key.

2) Add env vars to your Vite project
- Create a file `web/.env` with:

VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

- Restart the dev server after adding `.env`.

3) Create the `transactions` table
Run the SQL in the Supabase SQL editor:

-- Enable the pgcrypto extension if not already
create extension if not exists "pgcrypto";

create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  category text,
  merchant text,
  amount numeric,
  inserted_at timestamptz default now()
);

4) Secure the table (Row Level Security)
- In the Table Editor, enable RLS for `transactions`, then run these policies in SQL editor:

-- allow owners to insert
create policy "Insert own" on public.transactions
  for insert using (auth.role() = 'authenticated') with check (auth.uid() = user_id);

-- allow owners to select
create policy "Select own" on public.transactions
  for select using (auth.uid() = user_id);

-- allow owners to delete
create policy "Delete own" on public.transactions
  for delete using (auth.uid() = user_id);

5) Notes
- The app uses Supabase's magic-link email sign-in. Users must sign in via the email link to persist/see their data across devices.
- If you prefer password-based auth or OAuth, configure Auth providers in Supabase.
- After creating the table and policies, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` locally and restart `npm run dev` in `web`.

6) Troubleshooting
- If requests fail, check browser console for Supabase errors and ensure RLS policies are correct.
- For local testing without Supabase, the app still uses localStorage.
