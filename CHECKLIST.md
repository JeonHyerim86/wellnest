# 중간고사 프로젝트 체크리스트 — 웰니스 투두 (가칭: Wellnest)

> 총 50점 · 목표: 오늘(2026-08-03) 안에 배포까지 완주
> 스택: Next.js 15 (App Router) + TypeScript + Tailwind CSS + Supabase + Vercel

---

## 📌 서비스 개요

**한 줄 정의**: 할 일과 루틴을 관리하면서, 식단·운동 기록까지 한곳에서 남기는 웰니스 투두 웹앱.

**핵심 엔티티 3개**
| 엔티티 | 설명 | CRUD 채점 대상 |
|---|---|---|
| `routines` | 반복 루틴 (요일 지정, 예: 월수금 스트레칭) | ✅ |
| `todos` | 오늘의 할 일 (루틴에서 파생 가능) | ✅ **메인** |
| `logs` | 식단·운동 통합 기록 (`type: meal / workout`) | ✅ (+이미지 업로드) |
| `profiles` | 사용자 프로필 (아바타 이미지) | (이미지 업로드) |

**화면 5개** (모바일 퍼스트 · 하단 탭 내비게이션 · 375px 기준)
1. `/login` — 구글 로그인
2. `/` (오늘) — 오늘 할 일 + 루틴 체크 + 오늘 기록 요약
3. `/routines` — 루틴 목록 / 생성 / 수정 / 삭제
4. `/logs` — 식단·운동 기록 목록 / 생성 / 수정 / 삭제 (사진 업로드)
5. `/profile` — 프로필 (아바타 업로드, 로그아웃)

---

## 🎯 채점 항목 → 산출물 매핑

| 채점 항목 | 배점 | 산출물 | 담당 |
|---|---|---|---|
| PRD 작성 | 5 | `docs/PRD.md` | Claude |
| 스펙 정의 | 5 | `docs/specs/*.md` (기능별 개별 파일) | Claude |
| 컬러 파운데이션 | 2 | `design/wellnest.pen` | Claude 초안 → 혜림 |
| 타이포그래피 | 2 | `design/wellnest.pen` | Claude 초안 → 혜림 |
| 공통 UI 컴포넌트 | 5 | `design/wellnest.pen` | Claude 초안 → 혜림 |
| 서비스 화면 UI | 5 | `design/wellnest.pen` + 실제 배포 화면 | Claude 초안 → 혜림 |
| 구글 로그인 | 6 | Supabase Auth + Google OAuth | **혜림(설정)** + Claude(구현) |
| CRUD 생성/조회/수정/삭제 | 10 | Supabase Postgres | Claude |
| 이미지 업로드 | 5 | Supabase Storage | Claude |
| Vercel 배포 | 5 | 공개 URL | **혜림(계정)** + Claude(설정) |

---

## ✅ 작업 체크리스트

### Phase 0 — 사전 준비 (병렬)

**🙋 혜림님이 직접** (Claude가 대신 못 하는 계정·인증 작업)
- [ ] **H-1** Supabase 프로젝트 생성 → `Project URL` / `anon public key` 확보
- [ ] **H-2** Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성 → `Client ID` / `Client Secret` 확보
- [ ] **H-3** Supabase Dashboard → Authentication → Providers → Google 활성화 + 위 키 입력
- [ ] **H-4** Vercel 계정 로그인 확인 (`npm i -g vercel` 후 `vercel login`)

**🤖 Claude가 진행**
- [x] **C-1** Next.js 16 + TypeScript + Tailwind v4 프로젝트 스캐폴딩
- [x] **C-2** 폴더 구조 정리 (`docs/`, `design/`, `src/`, `supabase/`)
- [x] **C-3** Supabase 클라이언트 · 미들웨어 · 환경변수 템플릿(`.env.example`) 세팅
- [x] **C-3b** DB 마이그레이션 SQL 선작성 (`supabase/migrations/0001_init.sql`)

### Phase 1 — 기획 문서 (10점) · Phase 2 디자인과 병렬

- [x] **C-4** `docs/PRD.md` 작성 (배경 / 문제정의 / 목표 / 대상사용자 / 핵심기능 / 사용자시나리오 / MVP 범위)
- [x] **C-5** `docs/specs/` 기능별 스펙 문서 작성 — 각 문서에 *기능명 / 목적 / 동작방식 / 예외처리 / 완료조건* 포함
  - [x] `01-auth-google-login.md`
  - [x] `02-today-dashboard.md`
  - [x] `03-todo-crud.md`
  - [x] `04-routine-crud.md`
  - [x] `05-wellness-log-crud.md`
  - [x] `06-image-upload.md`
  - [x] `07-profile.md`
- [ ] **🙋 H-5** 기획 문서 검토 및 피드백

### Phase 2 — 디자인 시스템 (14점) · Phase 1과 병렬

- [x] **C-5b** 디자인 명세서 작성 (`design/DESIGN-SYSTEM.md`)
- [x] **H-6** 혜림님이 레퍼런스 2화면 제작 (Today · Log Detail) + 톤앤매너 확정
- [x] **C-6** 컬러 파운데이션 (.pen) — Brand/Surface/Text/State/Mood 5그룹 19토큰
- [x] **C-7** 타이포그래피 (.pen) — Nunito 기반 10단계 스케일
- [x] **C-8** 공통 UI 컴포넌트 (.pen) — 재사용 컴포넌트 18종 + 변형/상태 쇼케이스
- [x] **C-9** 서비스 화면 UI 8종 (.pen) — Login/Today/Routines/Logs/Log Detail/Log Form/Profile/Todo Sheet
- [x] **C-9b** 코드 디자인 토큰을 .pen 값으로 전면 교체 (컬러·폰트·radius·탭바·카드)
- [ ] **🙋 H-6** 디자인 검토 및 톤앤매너 피드백 (컬러/폰트 취향 반영)

### Phase 3 — DB & 인프라 (H-1~H-3 완료 후)

- [ ] **C-10** DB 스키마 마이그레이션 (`profiles`, `routines`, `todos`, `logs`)
- [ ] **C-11** RLS 정책 (본인 데이터만 접근)
- [ ] **C-12** Storage 버킷 생성 (`avatars`, `log-images`) + 정책
- [ ] **C-13** `.env.local` 작성 (혜림님 키 입력)

### Phase 4 — 구현

- [x] **C-14** 디자인 토큰 → Tailwind 테마 반영 + 공통 컴포넌트 16종 코드화
- [x] **C-15** 구글 로그인 / 로그아웃 / 세션 프록시 (6점)
- [x] **C-16** 투두 CRUD (10점 핵심 — 특히 **수정 4점**)
- [x] **C-17** 루틴 CRUD + 오늘 화면 자동 노출 연동
- [x] **C-18** 웰니스 기록 CRUD + 이미지 업로드/교체/삭제 + 실패 롤백 (5점)
- [x] **C-19** 프로필 화면 + 아바타 업로드 + 통계
- [x] **C-20** 로딩/에러/빈 상태 처리, 모바일 퍼스트 반응형
- [x] **C-20b** `tsc --noEmit` · `eslint --max-warnings=0` · `next build` 전부 통과

### Phase 5 — 배포 (5점)

- [ ] **C-21** Vercel 프로젝트 연결 + 환경변수 등록
- [ ] **🙋 H-7** Vercel 배포 승인 (계정 인증 필요)
- [ ] **🙋 H-8** 배포 URL을 Supabase Auth `Redirect URLs`와 Google OAuth `승인된 리디렉션 URI`에 추가
- [ ] **C-22** 배포 환경에서 구글 로그인 → CRUD → 이미지 업로드 전 시나리오 검증

### Phase 6 — 제출

- [ ] **C-23** 최종 폴더 정리 (`docs/`, `design/`, `.env` 제외 확인)
- [ ] **C-24** `node_modules` 제외하고 zip 압축
- [ ] **🙋 H-9** Google 클래스룸에 zip 파일 + 배포 링크 제출

---

## ⚠️ 리스크 & 주의사항

| 리스크 | 대응 |
|---|---|
| 노션 공지 폴더명이 `desgin`(오타) | `design/` 생성 후, 필요 시 `desgin/`도 복제 |
| Google OAuth 리디렉션 URI 불일치로 배포 후 로그인 실패 | Phase 5에서 배포 URL 확정 직후 H-8 즉시 수행 |
| RLS 미설정 시 데이터 노출 / 조회 실패 | Phase 3에서 정책 먼저 검증 |
| 로컬스토리지 CRUD는 0점 | 모든 상태는 Supabase 왕복으로 처리 |
| `.env.local` 커밋 사고 | `.gitignore` 확인 후 커밋 |
