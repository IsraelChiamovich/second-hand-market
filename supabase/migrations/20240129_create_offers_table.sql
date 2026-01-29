-- Create offers table
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid not null references public.products(id) on delete cascade,
  buyer_id uuid not null references auth.users(id),
  seller_id uuid not null references auth.users(id),
  amount numeric not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  message text -- Optional message with the offer
);

-- Enable RLS
alter table public.offers enable row level security;

-- Policies
create policy "Users can view offers they made or received"
  on public.offers for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Users can create offers"
  on public.offers for insert
  with check (auth.uid() = buyer_id);

create policy "Users can update offers they made or received"
  on public.offers for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Realtime
alter publication supabase_realtime add table public.offers;
