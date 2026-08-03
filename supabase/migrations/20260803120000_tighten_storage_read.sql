-- =====================================================================
-- Storage 읽기 정책 강화
--
-- 문제: 기존 "wellnest public read" 정책에 `to` 절이 없어 기본 role 이 public
--       (= anon 포함) 이었다. anon 키는 클라이언트 번들에 노출되므로 누구나
--         supabase.storage.from('log-images').list('')
--       로 전체 사용자 폴더와 파일명을 열거할 수 있었다.
--
-- 핵심: 두 버킷 모두 public = true 라서 <img> 렌더링은
--       /storage/v1/object/public/... 경로가 RLS 를 우회해 처리한다.
--       즉 이 SELECT 정책은 화면 표시에 전혀 필요 없고, list() 열거만 열어줬다.
-- =====================================================================

drop policy if exists "wellnest public read" on storage.objects;

create policy "wellnest read own folder" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('avatars', 'log-images')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE 정책에 with check 를 명시한다.
-- Postgres 는 with check 가 없으면 using 을 대신 쓰지만, 암묵적 동작에
-- 의존하지 않도록 동일 조건을 명시적으로 건다.
drop policy if exists "wellnest update own folder" on storage.objects;
create policy "wellnest update own folder" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('avatars', 'log-images')
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id in ('avatars', 'log-images')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 버킷 자체에도 용량/형식 제한을 건다.
-- 앱 검증(validateImageFile)은 클라이언트가 Storage API 를 직접 호출하면
-- 우회되므로, 우회 불가능한 지점에 한 번 더 건다.
update storage.buckets
   set file_size_limit = 5242880,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
 where id in ('avatars', 'log-images');
