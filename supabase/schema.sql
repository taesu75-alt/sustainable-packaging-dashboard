-- 영업 파이프라인 스키마
-- Supabase SQL Editor에서 실행하세요.

create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  company     text not null,
  product     text not null,
  rep         text not null,
  created_at  timestamptz not null default now()
);

create table if not exists lead_categories (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references leads(id) on delete cascade,
  name       text not null,
  light      text not null default 'gray'
               check (light in ('gray','red','yellow','green')),
  sort_order int  not null
);

create table if not exists sub_items (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references lead_categories(id) on delete cascade,
  title       text not null,
  detail      text not null default '',
  created_at  timestamptz not null default now()
);

-- RLS: 이 프로젝트는 인증 없이 사용하므로 anon 키로 전체 접근 허용
alter table leads           enable row level security;
alter table lead_categories enable row level security;
alter table sub_items       enable row level security;

create policy "anon_all_leads"      on leads           for all using (true) with check (true);
create policy "anon_all_categories" on lead_categories for all using (true) with check (true);
create policy "anon_all_sub_items"  on sub_items       for all using (true) with check (true);
