-- ClaimYourPlanet / V16 account-owned cloud journal
-- Run once in your Supabase SQL Editor. Enable authentication and Google provider separately.
create table if not exists public.explorer_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  journal jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint journal_object_check check (jsonb_typeof(journal) = 'object')
);
alter table public.explorer_saves enable row level security;
revoke all on public.explorer_saves from anon;
grant select, insert, update, delete on public.explorer_saves to authenticated;
drop policy if exists "Read own explorer save" on public.explorer_saves;
drop policy if exists "Create own explorer save" on public.explorer_saves;
drop policy if exists "Update own explorer save" on public.explorer_saves;
drop policy if exists "Delete own explorer save" on public.explorer_saves;
create policy "Read own explorer save"
  on public.explorer_saves for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own explorer save"
  on public.explorer_saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own explorer save"
  on public.explorer_saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own explorer save"
  on public.explorer_saves for delete to authenticated using ((select auth.uid()) = user_id);
