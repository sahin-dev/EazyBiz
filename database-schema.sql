-- Production-oriented PostgreSQL schema draft for BizOS Bangladesh.
-- This is intended as the starting point for a NestJS + Prisma implementation.

create table tenants (
  id uuid primary key,
  name text not null,
  business_type text not null check (business_type in ('restaurant', 'pharmacy', 'grocery', 'retail')),
  plan text not null default 'Starter',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table branches (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  name text not null,
  address text,
  phone text,
  is_active boolean not null default true
);

create table modules (
  id text primary key,
  name text not null,
  monthly_price numeric(12, 2) not null default 0,
  description text not null
);

create table tenant_modules (
  tenant_id uuid not null references tenants(id),
  module_id text not null references modules(id),
  status text not null default 'active',
  activated_at timestamptz not null default now(),
  primary key (tenant_id, module_id)
);

create table users (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  branch_id uuid references branches(id),
  name text not null,
  email text,
  phone text,
  role text not null,
  pin_hash text,
  status text not null default 'active'
);

create table products (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  name text not null,
  category text not null,
  sale_price numeric(12, 2) not null,
  cost_price numeric(12, 2) not null default 0,
  unit text not null default 'piece',
  barcode text,
  featured boolean not null default false,
  is_active boolean not null default true
);

create table product_pharmacy_details (
  product_id uuid primary key references products(id),
  generic_name text,
  manufacturer text,
  batch_no text,
  expiry_date date,
  requires_prescription boolean not null default false
);

create table inventory_balances (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  branch_id uuid not null references branches(id),
  product_id uuid not null references products(id),
  quantity numeric(12, 3) not null default 0,
  low_stock_quantity numeric(12, 3) not null default 0,
  unique (branch_id, product_id)
);

create table suppliers (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  name text not null,
  category text,
  phone text,
  address text,
  due_amount numeric(12, 2) not null default 0,
  status text not null default 'active'
);

create table purchases (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  branch_id uuid not null references branches(id),
  supplier_id uuid references suppliers(id),
  invoice_no text,
  total numeric(12, 2) not null default 0,
  paid numeric(12, 2) not null default 0,
  status text not null default 'received',
  purchased_at timestamptz not null default now()
);

create table orders (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  branch_id uuid references branches(id),
  order_no text not null,
  order_type text not null,
  source text not null default 'pos',
  subtotal numeric(12, 2) not null,
  tax_amount numeric(12, 2) not null default 0,
  service_charge numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  payment_status text not null default 'paid',
  sync_status text not null default 'synced',
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key,
  order_id uuid not null references orders(id),
  product_id uuid references products(id),
  name text not null,
  quantity numeric(12, 3) not null,
  unit_price numeric(12, 2) not null,
  total numeric(12, 2) not null,
  note text
);

create table payments (
  id uuid primary key,
  order_id uuid not null references orders(id),
  method text not null,
  amount numeric(12, 2) not null,
  reference text,
  status text not null default 'captured'
);

create table staff_profiles (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  branch_id uuid references branches(id),
  name text not null,
  role text not null,
  shift_label text,
  salary numeric(12, 2) not null default 0,
  status text not null default 'active'
);

create table storefronts (
  id uuid primary key,
  tenant_id uuid not null references tenants(id),
  slug text not null unique,
  hero_title text not null,
  tagline text,
  theme jsonb not null default '{}',
  sections jsonb not null default '[]',
  is_published boolean not null default true
);

create table audit_logs (
  id uuid primary key,
  tenant_id uuid references tenants(id),
  user_id uuid references users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
