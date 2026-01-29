-- Create admin stats function
create or replace function public.get_admin_stats()
returns json
language plpgsql
security definer
as $$
declare
  total_users integer;
  total_products integer;
  new_products_7d integer;
  new_products_30d integer;
  total_conversations integer;
  total_messages integer;
begin
  select count(*) into total_users from auth.users;
  select count(*) into total_products from public.products where status != 'deleted';
  select count(*) into new_products_7d from public.products where created_at > (now() - interval '7 days');
  select count(*) into new_products_30d from public.products where created_at > (now() - interval '30 days');
  select count(*) into total_conversations from public.conversations;
  select count(*) into total_messages from public.messages;

  return json_build_object(
    'total_users', total_users,
    'total_products', total_products,
    'products_last_7_days', new_products_7d,
    'products_last_30_days', new_products_30d,
    'total_conversations', total_conversations,
    'total_messages', total_messages
  );
end;
$$;

-- Create products per day function
create or replace function public.get_products_per_day(days_back integer default 30)
returns table (date text, count bigint)
language sql
security definer
as $$
  select
    to_char(created_at, 'YYYY-MM-DD') as date,
    count(*) as count
  from public.products
  where created_at > (now() - make_interval(days := days_back))
  group by 1
  order by 1;
$$;

-- Create products by category function
create or replace function public.get_products_by_category()
returns table (category text, count bigint)
language sql
security definer
as $$
  select
    category::text,
    count(*) as count
  from public.products
  where status != 'deleted'
  group by 1
  order by 2 desc;
$$;
