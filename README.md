# 🌿 Wellnest

> 할 일과 루틴을 관리하면서 식단·운동 기록까지 한곳에 남기는 **웰니스 투두 웹앱**

투두 앱 · 식단 앱 · 운동 앱을 오가느라 기록이 끊기는 문제를 해결합니다.
오늘 할 일을 체크하는 그 화면에서 아침 식사와 저녁 운동을 함께 남길 수 있습니다.

---

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) · React 19 · TypeScript |
| 스타일 | Tailwind CSS v4 (디자인 토큰 기반) · Pretendard |
| 인증 | Supabase Auth (Google OAuth) |
| 데이터베이스 | Supabase Postgres + RLS |
| 파일 저장소 | Supabase Storage |
| 배포 | Vercel |

---

## 주요 기능

| 화면 | 기능 |
|---|---|
| `/login` | 구글 계정 로그인 |
| `/` 오늘 | 오늘의 루틴 체크 · 할 일 관리 · 기록 요약 · 달성률 |
| `/routines` | 반복 루틴 생성 / 수정 / 삭제 / 활성 토글 (요일 지정) |
| `/logs` | 식단·운동 통합 기록 생성 / 수정 / 삭제 · 사진 첨부 · 타입 필터 |
| `/profile` | 프로필 사진 업로드 · 닉네임 수정 · 통계 · 로그아웃 |

### 설계 포인트

- **루틴 → 할 일 자동 연결** — 반복 요일을 지정하면 해당 요일에 오늘 화면으로 자동 노출됩니다. 체크하면 `todos` 레코드가 생성/토글되며, 부분 유니크 인덱스로 하루 중복 생성을 DB 레벨에서 차단합니다.
- **식단·운동 단일 테이블** — 두 기록은 "언제 / 무엇을 / 사진 / 메모"라는 골격이 같아 `logs` 하나로 통합하고 `log_type`으로 구분합니다. 타입별 필드 정합성은 `CHECK` 제약으로 강제합니다. 추후 '수면', '수분' 같은 타입을 테이블 추가 없이 확장할 수 있습니다.
- **본인 데이터 격리** — 모든 테이블에 RLS를 적용해 `auth.uid()`가 일치하는 행만 접근 가능합니다. Storage도 경로 첫 폴더가 본인 `user_id`일 때만 쓰기를 허용합니다.
- **타임존 고정** — "오늘"의 기준은 항상 `Asia/Seoul`로 계산해 서버(UTC)와 클라이언트의 날짜가 어긋나지 않게 했습니다.
- **모바일 퍼스트** — 375px 기준으로 설계하고 하단 탭 내비게이션, 44px 터치 타깃을 적용했습니다. 로직을 `lib/`·`features/*/actions.ts`에 분리해 추후 React Native 전환 시 재사용할 수 있습니다.

---

## 폴더 구조

```
mid-term/
├── docs/                       # 기획 문서 (제출물)
│   ├── PRD.md                  # 배경·문제정의·목표·사용자·핵심기능·시나리오·MVP 범위
│   └── specs/                  # 기능별 스펙 (기능명·목적·동작방식·예외처리·완료조건)
│       ├── 01-auth-google-login.md
│       ├── 02-today-dashboard.md
│       ├── 03-todo-crud.md
│       ├── 04-routine-crud.md
│       ├── 05-wellness-log-crud.md
│       ├── 06-image-upload.md
│       └── 07-profile.md
│
├── design/                     # 디자인 (제출물)
│   ├── wellnest.pen            # 컬러·타이포·컴포넌트·화면 UI
│   └── DESIGN-SYSTEM.md        # 디자인 시스템 명세서
│
├── supabase/
│   └── migrations/
│       └── 20260803000000_init.sql   # 테이블 · RLS · Storage 버킷/정책
│
├── src/
│   ├── app/
│   │   ├── (app)/              # 하단 탭이 있는 보호 라우트
│   │   │   ├── page.tsx        # 오늘
│   │   │   ├── routines/
│   │   │   ├── logs/
│   │   │   └── profile/
│   │   ├── login/
│   │   ├── auth/callback/      # OAuth 콜백 핸들러
│   │   └── layout.tsx
│   │
│   ├── components/ui/          # 공통 UI 컴포넌트
│   ├── features/               # 도메인별 서버 액션 + 화면 컴포넌트
│   │   ├── todos/
│   │   ├── routines/
│   │   ├── logs/
│   │   └── profile/
│   ├── lib/
│   │   ├── supabase/           # 클라이언트 · 서버 · 세션 갱신 · 타입
│   │   ├── auth.ts             # requireUser (서버에서 user_id 주입)
│   │   ├── date.ts             # Asia/Seoul 기준 날짜 유틸
│   │   └── storage.ts          # 이미지 검증 · 경로 생성
│   └── proxy.ts                # 세션 갱신 + 보호 라우트 차단
│
└── CHECKLIST.md                # 작업 체크리스트
```

---

## 로컬 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 프로젝트 준비

1. [Supabase](https://supabase.com/dashboard)에서 새 프로젝트 생성
2. **SQL Editor**에서 `supabase/migrations/20260803000000_init.sql` 전체를 실행
   → 테이블 4개 + RLS 정책 + Storage 버킷 2개가 한 번에 생성됩니다.
3. **Authentication → Providers → Google** 활성화
   - Google Cloud Console에서 OAuth 클라이언트 ID 생성
   - 승인된 리디렉션 URI: `https://<project-ref>.supabase.co/auth/v1/callback`
   - 발급받은 Client ID / Secret을 Supabase에 입력
4. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

### 3. 환경 변수

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon 또는 publishable key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. 실행

```bash
npm run dev     # http://localhost:3000
npm run build   # 프로덕션 빌드
npm run lint    # ESLint
```

---

## 데이터 모델

```
auth.users (Supabase 관리)
   │
   ├─1:1─ profiles   id · email · display_name · avatar_url
   │
   ├─1:N─ routines   title · emoji · category · repeat_days[] · is_active
   │         │
   │         └─1:N─ todos  (routine_id로 연결 — 루틴에서 파생된 오늘의 할 일)
   │
   ├─1:N─ todos      title · memo · due_date · priority · is_done · completed_at
   │
   └─1:N─ logs       log_type(meal|workout) · logged_on · title · memo · image_url
                     meal_type · calories          (식단)
                     duration_min                  (운동)
```

**Storage 버킷**

| 버킷 | 용도 | 경로 규칙 |
|---|---|---|
| `avatars` | 프로필 사진 | `{user_id}/avatar-{timestamp}.{ext}` |
| `log-images` | 기록 사진 | `{user_id}/{timestamp}-{random}.{ext}` |

읽기는 공개, 쓰기·삭제는 경로 첫 폴더가 본인 `user_id`일 때만 허용합니다.
