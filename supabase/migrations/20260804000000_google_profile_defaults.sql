-- =====================================================================
-- 구글 로그인 시 프로필 기본값 정리
--
-- 문제 1) 프로필 사진 기본값이 "구글 사진" 이었다.
--   앱의 기본 프로필 이미지(person 아이콘)를 기본값으로 쓰기로 했다.
--   구글 사진을 profiles.avatar_url 에 복사해 두면
--     - 사용자가 사진을 지워도 값의 출처가 둘(구글/업로드)로 갈리고
--     - "사진의 유일한 출처는 profiles.avatar_url" 이라는 규칙이 깨진다.
--   avatar_url = null 이면 화면이 앱 기본 이미지를 그린다.
--
-- 문제 2) display_name 에 이메일 앞부분을 넣고 있었다.
--   OAuth 가입은 auth.users INSERT 시점에 raw_user_meta_data 가 아직
--   비어 있을 수 있다. 그때 이메일 앞부분을 넣어버리면
--   "구글 이름을 못 읽은 상태" 와 "사용자가 정한 닉네임" 을 구분할 수 없어
--   나중에 구글 이름으로 보정할 수가 없다.
--   그래서 못 읽으면 null 로 두고, 로그인 콜백의 ensureProfile() 이 채운다.
--   (콜백이 받는 user 에는 메타데이터가 확실히 들어 있다)
-- =====================================================================

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
    nullif(
      trim(coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        ''
      )),
      ''
    ),
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 기존 행 보정: 구글에서 복사해 온 사진만 비운다.
-- 사용자가 직접 업로드한 사진은 우리 Storage 경로에 있으므로 그대로 둔다.
update public.profiles
   set avatar_url = null
 where avatar_url is not null
   and avatar_url not like '%/storage/v1/object/public/avatars/%';
