create extension if not exists "pgcrypto";

create table bookings (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  event_type text,
  event_date date not null,
  time_slot text not null,
  status text not null,
  created_at timestamp with time zone default now()
);
