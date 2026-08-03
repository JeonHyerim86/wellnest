-- =====================================================================
-- Wellnest 초기 스키마
-- Supabase Dashboard → SQL Editor 에 전체를 붙여넣고 실행하세요.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 공통: updated_at 자동 갱신 트리거 함수
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles : auth.users 와 1:1
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 신규 가입 시 프로필 자동 생성 (구글 프로필 이름/사진을 초기값으로)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- routines : 반복 루틴
-- ---------------------------------------------------------------------
create table if not exists public.routines (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 60),
  emoji       text,
  category    text not null default 'life' check (category in ('health', 'meal', 'mind', 'life')),
  -- 0(일) ~ 6(토). 빈 배열이면 매일 반복.
  repeat_days smallint[] not null default '{}',
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists routines_user_id_idx on public.routines (user_id, sort_order);

-- ---------------------------------------------------------------------
-- todos : 날짜별 할 일 (루틴에서 파생될 수 있음)
-- ---------------------------------------------------------------------
create table if not exists public.todos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  routine_id   uuid references public.routines (id) on delete set null,
  title        text not null check (char_length(title) between 1 and 120),
  memo         text,
  due_date     date not null default current_date,
  priority     text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  is_done      boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists todos_user_due_idx on public.todos (user_id, due_date desc);
-- 같은 날짜에 같은 루틴이 두 번 생성되지 않도록 보장
create unique index if not exists todos_routine_per_day_uidx
  on public.todos (user_id, routine_id, due_date)
  where routine_id is not null;

-- ---------------------------------------------------------------------
-- logs : 식단 / 운동 통합 기록
-- ---------------------------------------------------------------------
create table if not exists public.logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  log_type     text not null check (log_type in ('meal', 'workout')),
  logged_on    date not null default current_date,
  title        text not null check (char_length(title) between 1 and 120),
  memo         text,
  image_url    text,
  -- log_type = 'meal'
  meal_type    text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  calories     integer check (calories is null or calories >= 0),
  -- log_type = 'workout'
  duration_min integer check (duration_min is null or duration_min >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- 타입별 필드 정합성 보장
  constraint logs_type_fields_chk check (
    (log_type = 'meal'    and duration_min is null)
    or
    (log_type = 'workout' and meal_type is null and calories is null)
  )
);

create index if not exists logs_user_logged_on_idx on public.logs (user_id, logged_on desc);

-- ---------------------------------------------------------------------
-- updated_at 트리거 연결
-- ---------------------------------------------------------------------
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists routines_set_updated_at on public.routines;
create trigger routines_set_updated_at before update on public.routines
  for each row execute function public.set_updated_at();

drop trigger if exists todos_set_updated_at on public.todos;
create trigger todos_set_updated_at before update on public.todos
  for each row execute function public.set_updated_at();

drop trigger if exists logs_set_updated_at on public.logs;
create trigger logs_set_updated_at before update on public.logs
  for each row execute function public.set_updated_at();

-- =====================================================================
-- RLS : 본인 데이터만 읽고 쓸 수 있다
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.routines enable row level security;
alter table public.todos    enable row level security;
alter table public.logs     enable row level security;

-- profiles
drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- routines
drop policy if exists "routines all own" on public.routines;
create policy "routines all own" on public.routines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- todos
drop policy if exists "todos all own" on public.todos;
create policy "todos all own" on public.todos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- logs
drop policy if exists "logs all own" on public.logs;
create policy "logs all own" on public.logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =====================================================================
-- Storage : 프로필 이미지 / 기록 이미지
-- 읽기는 공개, 쓰기는 본인 폴더(<user_id>/...)만 허용
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('log-images', 'log-images', true)
on conflict (id) do nothing;

drop policy if exists "wellnest public read" on storage.objects;
create policy "wellnest public read" on storage.objects
  for select using (bucket_id in ('avatars', 'log-images'));

drop policy if exists "wellnest upload own folder" on storage.objects;
create policy "wellnest upload own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('avatars', 'log-images')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "wellnest update own folder" on storage.objects;
create policy "wellnest update own folder" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('avatars', 'log-images')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "wellnest delete own folder" on storage.objects;
create policy "wellnest delete own folder" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('avatars', 'log-images')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
