-- Kitchen Notebook schema

create schema if not exists app;

create table app.recipe_type (
  id text primary key
);
insert into app.recipe_type (id) values ('starter'), ('main'), ('dessert'), ('italian'), ('asian');

create table app.recipes (
  id          bigint generated always as identity primary key,
  uid         uuid not null default gen_random_uuid() unique,
  title       text not null,
  description text not null default '',
  notes       text not null default '',
  created_at  timestamptz not null default now()
);

create table app.recipe_types (
  recipe_id bigint not null references app.recipes(id),
  type_id   text   not null references app.recipe_type(id),
  primary key (recipe_id, type_id)
);

create table app.ingredients (
  id        bigint generated always as identity primary key,
  recipe_id bigint not null references app.recipes(id),
  amount    text not null,
  name      text not null
);

create table app.steps (
  id          bigint generated always as identity primary key,
  recipe_id   bigint not null references app.recipes(id),
  "order"     integer not null,
  description text not null
);

create table app.shopping_items (
  id            bigint generated always as identity primary key,
  recipe_id     bigint not null references app.recipes(id),
  recipe_uid    uuid not null,
  recipe_title  text not null,
  ingredient_id bigint not null references app.ingredients(id),
  name          text not null,
  amount        text not null,
  checked       boolean not null default false,
  added_at      timestamptz not null default now()
);

-- Grant schema + table access
grant usage on schema app to anon, authenticated;
grant all privileges on all tables in schema app to anon, authenticated;
grant all privileges on all sequences in schema app to anon, authenticated;

-- Enable RLS (Supabase best practice)
alter table app.recipe_type    enable row level security;
alter table app.recipes        enable row level security;
alter table app.recipe_types   enable row level security;
alter table app.ingredients    enable row level security;
alter table app.steps          enable row level security;
alter table app.shopping_items enable row level security;

-- Permissive policies for anon (no auth — allow everything)
create policy "anon_all" on app.recipe_type    for all to anon using (true) with check (true);
create policy "anon_all" on app.recipes        for all to anon using (true) with check (true);
create policy "anon_all" on app.recipe_types   for all to anon using (true) with check (true);
create policy "anon_all" on app.ingredients    for all to anon using (true) with check (true);
create policy "anon_all" on app.steps          for all to anon using (true) with check (true);
create policy "anon_all" on app.shopping_items for all to anon using (true) with check (true);
