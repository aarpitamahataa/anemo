-- ANEMO — Supabase schema. Run in the SQL editor (or as a migration).
-- Enable Auth > Providers > Email. For quick demos, turn off "Confirm email".

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  data jsonb not null default '{}'::jsonb,   -- {realms:[], viewed:[], chapter:"", cart:[], wishlist:[]}
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  realm text,
  stars int not null check (stars between 1 and 5),
  text text not null check (char_length(text) between 3 and 500),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  items jsonb not null,
  total int not null,
  status text not null default 'placed',
  created_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;
alter table public.reviews enable row level security;
alter table public.orders enable row level security;

create policy "own progress read"   on public.user_progress for select using (auth.uid() = user_id);
create policy "own progress insert" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "own progress update" on public.user_progress for update using (auth.uid() = user_id);

create policy "reviews are public"  on public.reviews for select using (true);
create policy "members add reviews" on public.reviews for insert with check (auth.uid() = user_id);

create policy "own orders read"     on public.orders for select using (auth.uid() = user_id);
create policy "own orders insert"   on public.orders for insert with check (auth.uid() = user_id);
