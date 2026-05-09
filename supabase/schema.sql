-- Kitchen Notebook schema
-- Run this in the Supabase SQL Editor before anything else
-- Note: RLS is disabled — this app has no auth and is single-user

create table recipe_type (
  id text primary key
);
insert into recipe_type (id) values ('starter'), ('main'), ('dessert'), ('italian'), ('asian');

create table recipes (
  id          bigint generated always as identity primary key,
  uid         uuid not null default gen_random_uuid() unique,
  title       text not null,
  description text not null default '',
  notes       text not null default '',
  created_at  timestamptz not null default now()
);

create table recipe_types (
  recipe_id bigint not null references recipes(id),
  type_id   text   not null references recipe_type(id),
  primary key (recipe_id, type_id)
);

create table ingredients (
  id        bigint generated always as identity primary key,
  recipe_id bigint not null references recipes(id),
  amount    text not null,
  name      text not null
);

create table steps (
  id          bigint generated always as identity primary key,
  recipe_id   bigint not null references recipes(id),
  "order"     integer not null,
  description text not null
);

create table shopping_items (
  id            bigint generated always as identity primary key,
  recipe_id     bigint not null references recipes(id),
  recipe_uid    uuid not null,
  recipe_title  text not null,
  ingredient_id bigint not null references ingredients(id),
  name          text not null,
  amount        text not null,
  checked       boolean not null default false,
  added_at      timestamptz not null default now()
);

-- Disable RLS on all tables (single-user app, no auth required)
alter table recipe_type    disable row level security;
alter table recipes        disable row level security;
alter table recipe_types   disable row level security;
alter table ingredients    disable row level security;
alter table steps          disable row level security;
alter table shopping_items disable row level security;

grant usage on schema public to anon, authenticated;
grant all privileges on all tables in schema public to anon, authenticated;
grant all privileges on all sequences in schema public to anon, authenticated;