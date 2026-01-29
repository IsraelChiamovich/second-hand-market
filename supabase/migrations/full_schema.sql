-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create ENUMS
create type public.app_role as enum ('admin', 'moderator', 'user');
create type public.product_category as enum ('furniture', 'electronics', 'home', 'books');
create type public.product_status as enum ('active', 'sold', 'deleted');

-- Create PROFILES table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null
);
alter table public.profiles enable row level security;

-- Create PRODUCTS table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  price numeric not null,
  location text not null,
  latitude numeric,
  longitude numeric,
  category public.product_category not null,
  images text[] default array[]::text[],
  user_id uuid references auth.users(id) not null,
  status public.product_status default 'active'::public.product_status not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_featured boolean default false,
  formatted_address text
);
alter table public.products enable row level security;

-- Create CONVERSATIONS table
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  product_id uuid references public.products(id),
  buyer_id uuid references auth.users(id) not null,
  seller_id uuid references auth.users(id) not null,
  last_message_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.conversations enable row level security;

-- Create MESSAGES table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references auth.users(id) not null,
  content text not null,
  read_at timestamp with time zone
);
alter table public.messages enable row level security;

-- Create FAVORITES table
create table public.favorites (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  product_id uuid references public.products(id) on delete cascade not null
);
alter table public.favorites enable row level security;

-- Create USER_ROLES table
create table public.user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  role public.app_role default 'user'::public.app_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.user_roles enable row level security;

-- Create OFFERS table
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
alter table public.offers enable row level security;

-- RLS POLICIES

-- Profiles
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Products
create policy "Products are viewable by everyone" on public.products for select using (true);
create policy "Users can insert their own products" on public.products for insert with check (auth.uid() = user_id);
create policy "Users can update own products" on public.products for update using (auth.uid() = user_id);
create policy "Users can delete own products" on public.products for delete using (auth.uid() = user_id);

-- Conversations
create policy "Users can view their own conversations" on public.conversations for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Users can insert their own conversations" on public.conversations for insert with check (auth.uid() = buyer_id);
create policy "Users can update their own conversations" on public.conversations for update using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- Messages
create policy "Users can view messages in their conversations" on public.messages for select using (exists (select 1 from public.conversations where conversations.id = messages.conversation_id and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())));
create policy "Users can insert messages" on public.messages for insert with check (auth.uid() = sender_id);
create policy "Users can update messages (read status)" on public.messages for update using (auth.uid() = sender_id or exists (select 1 from public.conversations where conversations.id = messages.conversation_id and (conversations.buyer_id = auth.uid() or conversations.seller_id = auth.uid())));

-- Favorites
create policy "Users can view their own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users can insert their own favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete their own favorites" on public.favorites for delete using (auth.uid() = user_id);

-- Offers
create policy "Users can view offers they made or received" on public.offers for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Users can create offers" on public.offers for insert with check (auth.uid() = buyer_id);
create policy "Users can update offers they made or received" on public.offers for update using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- User Roles
create policy "User roles are viewable by everyone" on public.user_roles for select using (true);

-- Realtime
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.offers;

-- Storage Buckets (Optional - usually requires Storage API calls, but listing here for completeness if you use SQL for buckets)
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict do nothing;
