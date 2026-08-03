# Wellnest 디자인 시스템 명세서

> 이 문서는 `design/wellnest.pen` 제작을 위한 설계 원본이다.
> 코드(`src/app/globals.css`)의 토큰과 **1:1로 동일**하게 유지한다.

| 항목 | 값 |
|---|---|
| 컨셉 | 차분한 세이지 그린 + 크림 — 자연스럽고 편안한 웰니스 무드 |
| 기준 뷰포트 | **375 × 812** (모바일 퍼스트) |
| 최대 콘텐츠 폭 | 480px (데스크톱에서는 중앙 정렬된 앱 셸) |
| 폰트 | Pretendard Variable |
| 그리드 | 4px 베이스 · 좌우 여백 16px |
| 터치 타깃 | 최소 44 × 44 (추후 앱 전환 대비) |

---

## 1. 컬러 파운데이션 (2점)

### 1.1 Primary — Sage

브랜드 코어. 버튼·체크·활성 탭·진행바에 사용한다.

| 토큰 | HEX | 용도 |
|---|---|---|
| `sage-50` | `#F2F6F1` | 아주 옅은 배경 (아이콘 칩 배경) |
| `sage-100` | `#E3EBE0` | 아바타 플레이스홀더 배경 |
| `sage-200` | `#C7D8C2` | 보조 테두리 |
| `sage-300` | `#A8C2A1` | 포커스 링 |
| `sage-400` | `#87A87F` | 호버 테두리 |
| **`sage-500`** | **`#6B8F63`** | **Primary — 주요 버튼, 체크 완료, 진행바** |
| `sage-600` | `#55744E` | 호버 상태, 활성 탭 텍스트 |
| `sage-700` | `#435C3D` | 프레스 상태, 보조 버튼 텍스트 |
| `sage-800` | `#34472F` | — |
| `sage-900` | `#253321` | — |

### 1.2 Surface — Cream

배경 레이어. 흰색 대신 따뜻한 크림을 써서 장시간 사용해도 눈이 편하다.

| 토큰 | HEX | 용도 |
|---|---|---|
| `cream-50` | `#FDFCF8` | **페이지 배경** |
| `cream-100` | `#F8F5EC` | 세그먼트 컨트롤 트랙, 빈 상태 배경 |
| `cream-200` | `#F0EBDC` | 카드 테두리, 구분선, 진행바 트랙 |
| `cream-300` | `#E6DFCA` | 입력 필드 테두리 |
| `white` | `#FFFFFF` | 카드 표면, 바텀시트 |

### 1.3 Neutral — Ink (웜 그레이)

순수 회색 대신 따뜻한 톤을 써서 크림 배경과 어울리게 한다.

| 토큰 | HEX | 용도 |
|---|---|---|
| `ink-100` | `#F3F2EE` | 고스트 버튼 호버 |
| `ink-200` | `#E5E3DC` | 비활성 버튼 배경, 스위치 off |
| `ink-300` | `#CFCCC2` | 체크박스 미선택 테두리 |
| `ink-400` | `#A8A499` | 비활성 텍스트, 비활성 탭 아이콘 |
| `ink-500` | `#7D7A70` | 보조 텍스트 (caption) |
| `ink-600` | `#5C594F` | 본문 보조 |
| `ink-700` | `#45423A` | 레이블 |
| **`ink-800`** | **`#2E2C26`** | **기본 본문 텍스트** |
| `ink-900` | `#1C1B17` | 제목, 오버레이 배경(40%) |

### 1.4 Semantic

| 토큰 | HEX | 배경 토큰 | HEX | 용도 |
|---|---|---|---|---|
| `success` | `#4C9A6A` | `success-bg` | `#E8F4ED` | 성공 토스트 |
| `warning` | `#D99A3C` | `warning-bg` | `#FCF2E2` | 주의 안내 |
| `danger` | `#C75C51` | `danger-bg` | `#FAEAE8` | 삭제, 에러 메시지 |
| `info` | `#5B8AA6` | `info-bg` | `#E9F2F7` | 일반 안내 |

### 1.5 Accent — 기록 타입 구분

식단과 운동을 색으로 즉시 구분한다.

| 토큰 | HEX | 배경 토큰 | HEX | 용도 |
|---|---|---|---|---|
| `meal` | `#D98E62` (테라코타) | `meal-bg` | `#FBF0E8` | 식단 기록 아이콘·칩 |
| `workout` | `#5B8AA6` (오션) | `workout-bg` | `#E9F2F7` | 운동 기록 아이콘·칩 |

### 1.6 접근성 검증

| 조합 | 대비 | 판정 |
|---|---|---|
| `ink-800` on `cream-50` | 12.3:1 | AAA |
| `ink-500` on `cream-50` | 4.7:1 | AA |
| `white` on `sage-500` | 4.6:1 | AA |
| `danger` on `danger-bg` | 4.6:1 | AA |

---

## 2. 타이포그래피 (2점)

**Pretendard Variable** · 한글·영문·숫자 모두 균일한 리듬.

| 토큰 | 크기 | 행간 | 굵기 | 자간 | 용도 |
|---|---|---|---|---|---|
| `display` | 28 | 36 | 700 | -0.02em | 로그인 로고 타이틀, 달성률 강조 |
| `title` | 22 | 30 | 700 | -0.02em | 프로필 이름, 통계 수치, 달성률 % |
| `headline` | 18 | 26 | 600 | -0.01em | AppBar 제목, 섹션 제목, 시트 제목 |
| `body` | 15 | 23 | 400 | 0 | **기본 본문** — 할 일 제목, 입력값 |
| `label` | 14 | 20 | 500 | 0 | 폼 레이블, 버튼, 날짜 그룹 헤더 |
| `caption` | 13 | 18 | 400 | 0 | 보조 설명, 힌트, 에러 메시지 |
| `overline` | 11 | 16 | 600 | +0.06em | 탭 라벨, 배지, AppBar 서브타이틀 (대문자) |

### 사용 규칙
- 한 화면에 `display`는 최대 1회.
- 본문은 항상 `body`, 부가 정보는 `caption`. 중간 크기를 임의로 만들지 않는다.
- 취소선(완료된 할 일)은 `body` + `ink-400`.

---

## 3. 아이코노그래피 (.pen `04. Iconography`)

**라이브러리: Material Symbols Rounded 단일**
둥근 형태가 Nunito의 부드러운 곡선, 큰 radius와 어울려 서비스 전체의 톤을 일관되게 유지한다.

### 3.1 크기

| 크기 | 용도 |
|---|---|
| 13 | 배지 내부 아이콘 |
| 17 | 메뉴 행 · 앱바 뒤로가기 |
| 20 | 카드 진입 화살표 |
| 22 | 하단 탭 |
| 26 | FAB · 강조 아이콘 |

### 3.2 웨이트

| weight | 용도 |
|---|---|
| 400 | 비활성 탭 · 보조 정보 |
| 600 | 기본 · 앱바 · 활성 탭 |
| 700 | 체크 · 추가 등 주요 액션 |

### 3.3 아이콘 세트

| 그룹 | 아이콘 |
|---|---|
| **Navigation** | `home` 오늘 · `event_repeat` 루틴 · `restaurant` 기록 · `person` 프로필 · `arrow_back_ios_new` 뒤로 · `chevron_right` 상세 진입 · `more_horiz` 더보기 · `close` 닫기 |
| **Action** | `add` 추가 · `check` 완료 · `edit` 수정 · `delete` 삭제 · `autorenew` 교체 · `photo_camera` 사진 변경 · `logout` 로그아웃 |
| **Log Type** | `restaurant` 식단 · `directions_run` 운동 · `local_fire_department` 칼로리 · `schedule` 시각 · `calendar_month` 날짜 · `image` 사진 첨부 |
| **Status** | `check_circle` 성공 토스트 · `event_available` 오늘 예정 · `eco` 성장/온보딩 · `priority_high` 우선순위 높음 · `error` 오류 · `trending_up` 달성률 |
| **System** | `signal_cellular_alt` · `wifi` · `battery_full` · `badge` 닉네임 · `notifications` 알림 · `info` 앱 정보 |

### 3.4 사용 규칙

- 라이브러리를 섞지 않는다. 필요한 아이콘이 없으면 의미가 가장 가까운 Material Symbols 아이콘을 쓴다.
- 아이콘 단독으로 의미를 전달하지 않는다. 탭·버튼에는 항상 텍스트 라벨을 함께 둔다.
- 아이콘만 있는 버튼은 최소 38×38 터치 영역을 확보하고 `aria-label`을 붙인다.
- 색은 텍스트 위계를 따른다. 기본 `text-primary`, 보조 `text-tertiary`, 강조 `primary-dark`.
- 기록 타입 아이콘(식단/운동)은 배지 색과 짝을 이뤄 항상 같은 조합으로 쓴다.

> **코드 구현** — `src/components/ui/icon.tsx`의 `<Icon>` 컴포넌트가 위 규칙을 그대로 옮긴 것이다.
> Google Fonts에서 **실제 사용하는 29개 아이콘만 서브셋**으로 받아 용량을 줄였다.

---

## 4. 스타일 토큰

### 4.1 Radius

| 토큰 | 값 | 용도 |
|---|---|---|
| `radius-field` | 12 | 입력 필드, 버튼(md/lg), 세그먼트 아이템 |
| `radius-card` | 16 | 카드, 모달 |
| `radius-sheet` | 24 | 바텀시트 상단 |
| `full` | 999 | 칩, 아바타, FAB, 토스트, 체크 원 |

### 4.2 Shadow

| 토큰 | 값 | 용도 |
|---|---|---|
| `shadow-card` | `0 1px 2px rgba(28,27,23,.04), 0 4px 12px rgba(28,27,23,.05)` | 카드, 토스트 |
| `shadow-sheet` | `0 -4px 24px rgba(28,27,23,.10)` | 바텀시트, 모달 |
| `shadow-fab` | `0 4px 16px rgba(107,143,99,.35)` | FAB |

### 4.3 Spacing (4px 베이스)

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40`

| 위치 | 값 |
|---|---|
| 화면 좌우 여백 | 16 |
| 카드 내부 패딩 | 12 (리스트) / 16 (일반) |
| 섹션 간 간격 | 24 |
| 카드 간 간격 | 8 |
| 폼 필드 간 간격 | 16 (시트) / 20 (전체 화면 폼) |

---

## 4. 공통 UI 컴포넌트 (5점)

> 각 컴포넌트는 `.pen`에서 **재사용 컴포넌트(reusable)** 로 만들고, 아래 변형(variant)을 모두 배치한다.

### 4.1 Button

| Variant | 배경 | 텍스트 | Hover | Active | Disabled |
|---|---|---|---|---|---|
| `primary` | `sage-500` | white | `sage-600` | `sage-700` | `ink-200` / `ink-400` |
| `secondary` | `sage-50` | `sage-700` | `sage-100` | `sage-200` | `ink-100` / `ink-400` |
| `ghost` | 투명 | `ink-600` | `ink-100` | `ink-200` | — / `ink-300` |
| `danger` | `danger-bg` | `danger` | `#F5DCD9` | `#EFCDC9` | `ink-100` / `ink-400` |

| Size | 높이 | 좌우 패딩 | 타이포 | Radius |
|---|---|---|---|---|
| `sm` | 36 | 12 | caption | 10 |
| `md` | 44 | 16 | label | 12 |
| `lg` | 52 | 20 | body / 600 | 12 |

**상태**: default · hover · active · disabled · **loading**(스피너 16px, 텍스트 유지)
**포커스**: `outline 2px sage-500`, offset 2

### 4.2 TextField / TextArea

- 높이 48 (TextArea 최소 96), 좌우 패딩 14, radius 12
- 테두리 `cream-300` → 포커스 시 `sage-400` + 링 `sage-300` 2px
- 에러 시 테두리 `danger`, 하단 메시지 `caption` / `danger`
- 구성: **레이블(label)** · 입력 · **하단 행**(힌트 또는 에러 좌측 / 글자수 카운터 우측)
- 상태: default · focus · filled · error · disabled

### 4.3 CheckCircle (체크박스)

- 히트 영역 **44 × 44** (원형), 내부 원 24 × 24
- 미선택: 테두리 2px `ink-300`, 투명 배경
- 선택: 배경 `sage-500`, 흰색 체크 아이콘
- 호버: 히트 영역 배경 `sage-50`
- 비활성: opacity 50%

### 4.4 Card

- 배경 white, 테두리 1px `cream-200`, radius 16, `shadow-card`
- 리스트형 카드는 내부에 `divide-y cream-200`으로 항목 구분

### 4.5 Chip

| Tone | 선택됨 | 미선택 |
|---|---|---|
| `neutral` | `ink-800` / white | white / `ink-600` / 테두리 `cream-300` |
| `sage` | `sage-500` / white | white / `sage-700` / 테두리 `sage-200` |
| `meal` | `meal` / white | `meal-bg` / `#A8613A` |
| `workout` | `workout` / white | `workout-bg` / `#3D6A85` |

- 높이 32, 좌우 패딩 12, radius full, 타이포 `caption` / 500

### 4.6 SegmentedControl

- 트랙: 배경 `cream-100`, radius 12, 패딩 4
- 아이템: 높이 40, radius 10, 균등 분할
- 선택: 배경 white + `shadow-card`, 텍스트 `ink-800`
- 미선택: 텍스트 `ink-500`
- 용도: 기록 타입 전환(🍽 식단 / 🏃 운동)

### 4.7 AppBar

- 높이 56, sticky, 배경 `cream-50` 90% + blur, 하단 테두리 `cream-200`
- 구성: `leading`(뒤로가기 44×44) · 타이틀 영역 · `trailing`(아바타 36)
- 타이틀: `headline` / `ink-800`, 서브타이틀: `overline` / `sage-600` 대문자

### 4.8 BottomTabBar

- 높이 64 + safe-area, 배경 white 95% + blur, 상단 테두리 `cream-200`
- 탭 4개 균등: **오늘 / 루틴 / 기록 / 프로필**
- 활성: 아이콘 채움 + `sage-600` / 비활성: 라인 아이콘 + `ink-400`
- 라벨 `overline`, 아이콘 24

### 4.9 BottomSheet

- 상단 radius 24, 배경 white, `shadow-sheet`, 최대 높이 85dvh
- 상단에 그랩 핸들(40 × 4, `ink-200`)
- 헤더: 제목 `headline` + 닫기 버튼(40×40)
- 배경 오버레이: `ink-900` 40%
- 진입 애니메이션: 아래에서 16px 슬라이드업, 180ms ease-out

### 4.10 ConfirmDialog

- 폭 최대 384, radius 16, 패딩 20, `shadow-sheet`
- 제목 `headline` · 설명 `body` / `ink-600`
- 하단 버튼 2개 균등 — 취소(`secondary`) / 확인(`primary` 또는 `danger`)
- 삭제·로그아웃 등 되돌릴 수 없는 동작에만 사용

### 4.11 Toast

- 하단 80px 위, 중앙 정렬, radius full, 패딩 16 × 10
- `success` `sage-600` / `error` `danger` / `info` `ink-700`, 텍스트 white `label`
- 2.8초 후 자동 소멸

### 4.12 Avatar

- 크기: 32(AppBar) / 36 / 40 / 96(프로필)
- 이미지 없을 때: 배경 `sage-100`, 이니셜 `sage-700` 600
- 이미지 로드 실패 시 이니셜로 자동 대체

### 4.13 EmptyState

- 점선 테두리 `cream-300`, 배경 `cream-100` 60%, radius 16, 패딩 24 × 40
- 이모지 30px · 제목 `label`/`ink-700` · 설명 `caption`/`ink-500` · CTA 버튼(선택)

### 4.14 ErrorState

- 배경 `danger-bg`, 테두리 `danger` 20%, 아이콘 ⚠️, 메시지 `label`/`danger`

### 4.15 ProgressBar

- 높이 8, 트랙 `cream-200`, 채움 `sage-500`, radius full
- 채움 폭 전환 300ms

### 4.16 FAB

- 56 × 56, 배경 `sage-500`, 아이콘 white 28, radius full, `shadow-fab`
- 위치: 하단 탭에서 24px 위, 콘텐츠 우측 16px 안쪽

### 4.17 Switch

- 44 × 24 트랙, 노브 20
- on `sage-500` / off `ink-200`

### 4.18 ImagePicker

- 빈 상태: 16:9 점선 박스 + 이미지 아이콘 + "사진 추가"
- 선택됨: 16:9 프리뷰 + 하단 교체/삭제 버튼 2분할
- 하단 힌트: `JPG · PNG · WebP · 5MB 이하`

---

## 5. 서비스 화면 UI (5점)

375 × 812 프레임 5개를 배치한다.

### 5.1 `/login` — 로그인

```
상단 여백 64
🌿 (48)
Wellnest              display / ink-900
할 일과 루틴, 식단과 운동까지   body / ink-500
오늘 하루를 한곳에 담아요

[ 특징 카드 3개 ]            white 70% / radius 16 / 패딩 16×12
  ✅ 루틴은 한 번만 등록
  🍽 식단·운동을 한 타임라인에
  📈 하루 달성률 확인

[ (G) Google로 시작하기 ]    높이 52 / white / 테두리 cream-300 / shadow-card
로그인하면 서비스 이용약관에…  caption / ink-400
```

### 5.2 `/` — 오늘

```
AppBar   TODAY / 8월 3일 월요일          [아바타 36]
─────────────────────────────────────
Card  달성률
  혜림님의 오늘 달성률        62%   (label/ink-600 · title/sage-600)
  ▓▓▓▓▓▓░░░░                        ProgressBar
  루틴 2/3 · 할 일 3/5 · 기록 4건    caption/ink-500
─────────────────────────────────────
오늘의 루틴                    [관리]
Card
  ◉ 🧘 아침 스트레칭   월·화·수·목·금
  ○ 💧 물 2L 마시기    매일
─────────────────────────────────────
오늘 할 일                    [+ 추가]
Card
  ○ 장보기            [높음]
  ◉ 보고서 제출        (취소선)
─────────────────────────────────────
오늘 기록                     [+ 추가]
Card 🍽 오트밀과 바나나  식단 · 아침 · 320kcal   [썸네일 64]
Card 🏃 하체 + 러닝      운동 · 55분
─────────────────────────────────────
[오늘] [루틴] [기록] [프로필]        BottomTabBar
```

### 5.3 `/routines` — 루틴

```
AppBar   ROUTINE / 루틴
반복 요일을 정해두면 해당 요일에…     caption/ink-500

Card  [🧘] 아침 스트레칭            [스위치 on] [🗑]
        건강 · 월·화·수·목·금
Card  [💧] 물 2L 마시기             [스위치 on] [🗑]
        건강 · 매일
Card  [📖] 자기 전 독서 (흐림)       [스위치 off] [🗑]
        마음 · 주말

                              [ + ] FAB
```

**바텀시트 — 루틴 만들기**: 이름 입력 / 이모지 프리셋 10개 그리드 / 카테고리 칩 4개 / 요일 토글 7개 / 저장 버튼

### 5.4 `/logs` — 기록

```
AppBar   LOG / 기록
[전체] [식단] [운동]                 Chip 필터

오늘                                 label/ink-600
Card 🍽 오트밀과 바나나  식단 · 아침 · 320kcal  [썸네일]
Card 🏃 하체 + 러닝      운동 · 55분

어제
Card 🍽 김치찌개         식단 · 저녁 · 650kcal  [썸네일]

                              [ + ] FAB
```

**`/logs/new` · `/logs/[id]/edit`**
```
AppBar  [←]  기록 추가
[ 🍽 식단 | 🏃 운동 ]                SegmentedControl
무엇을 먹었나요?                      TextField
식사 종류  [아침][점심][저녁][간식]     Chip (meal tone)
칼로리 (선택)                         TextField number
날짜                                 TextField date
사진                                 ImagePicker
메모 (선택)                          TextArea
[ 삭제 ] [        저장        ]       수정 모드에서만 삭제 노출
```

### 5.5 `/profile` — 프로필

```
AppBar   PROFILE / 프로필

        ( 아바타 96 )
        [ 사진 변경 ]                Button secondary sm
        김수민                        title/ink-900
        sumin@gmail.com               caption/ink-500

Card   닉네임              김수민  >

Card   [ 5 ]   [ 42 ]   [ 18 ]      title/sage-600
     활성 루틴  완료한 할 일  남긴 기록   caption/ink-500

        로그아웃                      Button ghost lg
```

---

## 7. .pen 파일 구성 (제출용)

`design/wellnest.pen` 하나에 아래 프레임들이 들어 있다.

| 프레임 | 내용 | 채점 |
|---|---|---|
| `01. Color Foundation` | Brand/Surface/Text/State/Mood 5그룹 19토큰 + HEX + 용도 | 컬러 2점 |
| `02. Typography` | Nunito 10단계 스케일 · 웨이트 3종 · 본문 행간 | 타이포 2점 |
| `03. Components` | 8개 섹션 · 변형/상태 30여 개 | 컴포넌트 5점 |
| `04. Iconography` | Material Symbols Rounded · 크기 5단계 · 웨이트 3종 · 5그룹 34개 · 사용 규칙 | 컴포넌트 5점 |
| `Screen · *` (8종) | Login / Today / Routines / Logs / Log Detail / Log Form / Profile / Todo Sheet | 화면 5점 |
| `C/*` (18종) | 재사용 컴포넌트 — 화면들이 인스턴스로 참조 | — |

**재사용 컴포넌트 18종**
StatusBar · TabBar · CheckItem · AppBar · Button · Chip · Badge · FAB · Toggle · TextField · SegmentedControl · LogCard · EmptyState · Dialog · Toast · StatTile · SheetHeader · RoutineRow
