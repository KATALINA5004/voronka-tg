-- Выполните в SQL Editor проекта Supabase (https://supabase.com/dashboard).
-- Затем в Vercel / локально задайте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.

create table if not exists public.funnel_workspace (
  login text not null,
  slot text not null,
  app_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (login, slot)
);

alter table public.funnel_workspace enable row level security;

-- Внимание: любой с anon-ключом может читать/писать все строки.
-- Для продакшена замените на свои политики или серверный слой.
create policy "funnel_workspace_anon_all"
  on public.funnel_workspace
  for all
  using (true)
  with check (true);
