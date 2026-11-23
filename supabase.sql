-- Run in Supabase SQL Editor. Public table access is disabled by RLS.
create table if not exists public.drafts (
 id uuid primary key default gen_random_uuid(),
 store text not null check (store in ('gongdo','jinsa')),
 topic text not null default '',
 kind text not null,
 content text not null,
 status text not null default '검수 대기',
 created_at timestamptz not null default now()
);
alter table public.drafts enable row level security;
-- No anonymous policies: only the server's service-role key can access drafts.
create index if not exists drafts_store_created_idx on public.drafts(store,created_at desc);
