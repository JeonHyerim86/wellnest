# SPEC-01 · 구글 로그인 (Google OAuth)

| 항목 | 내용 |
|---|---|
| **기능명** | 구글 로그인 / 로그아웃 |
| 관련 화면 | `/login`, 전체 보호 라우트, `/profile` |
| 관련 테이블 | `auth.users`(Supabase 관리), `public.profiles` |
| 우선순위 | P0 (필수) |

---

## 1. 기능 목적

- 별도 회원가입 절차 없이 **구글 계정 한 번의 탭으로** 서비스를 시작하게 한다.
- 사용자를 식별해 **본인의 할 일·루틴·기록만** 안전하게 조회·수정하도록 보장한다.
- 비밀번호를 직접 다루지 않아 **자체 비밀번호 저장·복구 로직을 제거**한다.

---

## 2. 동작 방식

### 2.1 인증 흐름

```
[비로그인 사용자]
      │
      │ 보호 라우트 접근 (예: /)
      ▼
 middleware.ts ── 세션 없음 ──▶ /login 리다이렉트
      │
      ▼
 /login 화면 : "Google로 시작하기" 버튼
      │ 클릭
      ▼
 supabase.auth.signInWithOAuth({
   provider: 'google',
   options: { redirectTo: `${origin}/auth/callback?next=/` }
 })
      │
      ▼
 Google 계정 선택 / 동의 화면
      │
      ▼
 Supabase /auth/v1/callback (code 발급)
      │
      ▼
 앱의 /auth/callback  (Route Handler)
   └─ exchangeCodeForSession(code) → 세션 쿠키 설정
      │
      ▼
 next 파라미터 경로(기본 `/`)로 리다이렉트
```

### 2.2 세션 관리

- 세션은 **HttpOnly 쿠키**로 저장한다 (`@supabase/ssr`의 `createServerClient`).
- `src/middleware.ts`가 모든 요청에서 `supabase.auth.getUser()`를 호출해 **토큰을 갱신**한다.
- 브라우저를 닫았다 열어도 세션이 유지되며, 만료 시 자동으로 `/login`으로 이동한다.

### 2.3 라우트 접근 규칙

| 경로 | 비로그인 | 로그인 |
|---|---|---|
| `/login` | 접근 가능 | `/`로 리다이렉트 |
| `/auth/*` | 접근 가능 (콜백 처리) | 접근 가능 |
| `/`, `/routines`, `/logs`, `/profile` | `/login`으로 리다이렉트 | 접근 가능 |

### 2.4 프로필 자동 생성

`auth.users`에 새 레코드가 삽입되면 DB 트리거 `on_auth_user_created`가 실행되어 `public.profiles`에 행을 만든다.

| profiles 컬럼 | 초기값 |
|---|---|
| `id` | `auth.users.id` |
| `email` | 구글 계정 이메일 |
| `display_name` | `raw_user_meta_data.full_name` → `name` → 이메일 로컬파트 순으로 채움 |
| `avatar_url` | `raw_user_meta_data.avatar_url` (구글 프로필 사진) |

> 트리거는 `security definer`로 실행되며 `on conflict (id) do nothing`으로 중복 삽입을 방지한다.

### 2.5 로그아웃

`/profile` → **로그아웃** → `supabase.auth.signOut()` → 세션 쿠키 삭제 → `/login`으로 이동.

### 2.6 환경별 리디렉션 URI

| 환경 | Google Cloud Console 승인된 리디렉션 URI |
|---|---|
| 공통 | `https://<project-ref>.supabase.co/auth/v1/callback` |

| 환경 | Supabase → Auth → URL Configuration |
|---|---|
| 로컬 | Site URL `http://localhost:3000` / Redirect URLs `http://localhost:3000/**` |
| 배포 | Site URL `https://<vercel-domain>` / Redirect URLs `https://<vercel-domain>/**` |

---

## 3. 예외 처리

| # | 상황 | 처리 |
|---|---|---|
| E1 | 사용자가 구글 동의 화면에서 **취소** | `/auth/callback`에 `error` 파라미터 도착 → `/login?error=cancelled` 이동 → *"로그인이 취소되었어요. 다시 시도해 주세요."* 안내 |
| E2 | `code` 파라미터 누락 / 변조 | `exchangeCodeForSession` 실패 → `/login?error=invalid` → *"로그인 처리 중 문제가 생겼어요."* |
| E3 | **리디렉션 URI 불일치** (`redirect_uri_mismatch`) | 구글 오류 화면이 뜸. `/login`에 *"관리자 설정 오류입니다"* 안내 문구 노출 + 콘솔에 원인 로깅 |
| E4 | 네트워크 오류로 OAuth 요청 실패 | 버튼 로딩 해제 + 토스트 *"네트워크 연결을 확인해 주세요."* · 재시도 가능 |
| E5 | 세션 만료 상태로 보호 라우트 접근 | 미들웨어가 `/login`으로 리다이렉트 (에러 메시지 없이 조용히 처리) |
| E6 | 프로필 트리거 실패로 `profiles` 행 없음 | 앱 진입 시 프로필 조회 결과가 없으면 클라이언트에서 `upsert`로 보정 |
| E7 | 로그인 버튼 **연타** | 버튼을 `disabled` + 로딩 스피너로 전환해 중복 요청 차단 |
| E8 | 환경변수 미설정 (`NEXT_PUBLIC_SUPABASE_URL` 등) | 빌드/런타임에 명시적 에러 throw — 무증상 실패 방지 |

---

## 4. 완료 조건 (Definition of Done)

- [ ] `/login`에서 "Google로 시작하기" 클릭 시 구글 계정 선택 화면이 뜬다.
- [ ] 로그인 성공 후 `/`(오늘 화면)로 이동한다.
- [ ] 최초 로그인 시 `public.profiles`에 행이 자동 생성되고, 구글 이름·프로필 사진이 채워진다.
- [ ] 비로그인 상태로 `/`, `/routines`, `/logs`, `/profile` 접근 시 `/login`으로 리다이렉트된다.
- [ ] 로그인 상태로 `/login` 접근 시 `/`로 리다이렉트된다.
- [ ] 브라우저 새로고침 후에도 로그인 상태가 유지된다.
- [ ] `/profile`에서 로그아웃하면 `/login`으로 이동하고, 뒤로가기로 보호 라우트에 재진입할 수 없다.
- [ ] **배포된 Vercel URL에서** 위 항목이 모두 동작한다.
