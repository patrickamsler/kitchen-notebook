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

-- Public read: anon + authenticated can SELECT every table
create policy "public_read" on app.recipe_type    for select to anon, authenticated using (true);
create policy "public_read" on app.recipes        for select to anon, authenticated using (true);
create policy "public_read" on app.recipe_types   for select to anon, authenticated using (true);
create policy "public_read" on app.ingredients    for select to anon, authenticated using (true);
create policy "public_read" on app.steps          for select to anon, authenticated using (true);
create policy "public_read" on app.shopping_items for select to anon, authenticated using (true);

-- Authenticated writes: INSERT / UPDATE / DELETE limited to logged-in users
create policy "auth_write_insert" on app.recipe_type    for insert to authenticated with check (true);
create policy "auth_write_update" on app.recipe_type    for update to authenticated using (true) with check (true);
create policy "auth_write_delete" on app.recipe_type    for delete to authenticated using (true);

create policy "auth_write_insert" on app.recipes        for insert to authenticated with check (true);
create policy "auth_write_update" on app.recipes        for update to authenticated using (true) with check (true);
create policy "auth_write_delete" on app.recipes        for delete to authenticated using (true);

create policy "auth_write_insert" on app.recipe_types   for insert to authenticated with check (true);
create policy "auth_write_update" on app.recipe_types   for update to authenticated using (true) with check (true);
create policy "auth_write_delete" on app.recipe_types   for delete to authenticated using (true);

create policy "auth_write_insert" on app.ingredients    for insert to authenticated with check (true);
create policy "auth_write_update" on app.ingredients    for update to authenticated using (true) with check (true);
create policy "auth_write_delete" on app.ingredients    for delete to authenticated using (true);

create policy "auth_write_insert" on app.steps          for insert to authenticated with check (true);
create policy "auth_write_update" on app.steps          for update to authenticated using (true) with check (true);
create policy "auth_write_delete" on app.steps          for delete to authenticated using (true);

create policy "auth_write_insert" on app.shopping_items for insert to authenticated with check (true);
create policy "auth_write_update" on app.shopping_items for update to authenticated using (true) with check (true);
create policy "auth_write_delete" on app.shopping_items for delete to authenticated using (true);
