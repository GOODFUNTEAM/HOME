-- ============================================================
-- GOODFUN TEAM 商店 — Phase 1 資料表結構
-- 使用方式：在 Supabase 專案的 SQL Editor 貼上整段執行
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  image_url text,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 庫存歸零時自動下架（單向：只會自動關閉，不會自動重新上架，
-- 補貨後要重新上架請自己在後台把「上架中」打開）
create or replace function products_auto_deactivate()
returns trigger as $$
begin
  if new.stock <= 0 then
    new.is_active := false;
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_auto_deactivate on products;
create trigger trg_products_auto_deactivate
  before insert or update on products
  for each row execute function products_auto_deactivate();

-- ============================================================
-- Row Level Security：
-- 任何人（含未登入訪客）都可以「讀取」已上架商品 → 給 shop.html 用
-- 只有登入的帳號（你們自己）可以新增/修改/刪除 → 給 admin.html 用
-- ============================================================

alter table products enable row level security;

drop policy if exists "public can read active products" on products;
create policy "public can read active products"
  on products for select
  using (is_active = true);

drop policy if exists "authenticated can read all products" on products;
create policy "authenticated can read all products"
  on products for select
  to authenticated
  using (true);

drop policy if exists "authenticated can insert products" on products;
create policy "authenticated can insert products"
  on products for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update products" on products;
create policy "authenticated can update products"
  on products for update
  to authenticated
  using (true);

drop policy if exists "authenticated can delete products" on products;
create policy "authenticated can delete products"
  on products for delete
  to authenticated
  using (true);
