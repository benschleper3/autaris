create table if not exists public.healthchecks (
  id bigint generated always as identity primary key,
  note text not null,
  created_at timestamptz not null default now()
);

insert into public.healthchecks (note) values ('First ping from Lovable!');