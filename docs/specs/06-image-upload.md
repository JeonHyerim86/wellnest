# SPEC-06 · 이미지 업로드 (Supabase Storage)

| 항목 | 내용 |
|---|---|
| **기능명** | 기록 사진 / 프로필 아바타 업로드 |
| 관련 화면 | `/logs/new`, `/logs/[id]/edit`, `/profile` |
| 관련 리소스 | Storage 버킷 `log-images`, `avatars` · 컬럼 `logs.image_url`, `profiles.avatar_url` |
| 우선순위 | P0 (필수) |

---

## 1. 기능 목적

- 식단 기록에 **사진을 함께 남겨** 텍스트만으로는 기억나지 않는 문제(P5)를 해결한다.
- 프로필 아바타를 설정해 서비스에 **개인화된 소속감**을 준다.
- 업로드한 이미지는 기기·세션과 무관하게 **서비스 화면에서 항상 확인** 가능해야 한다.

---

## 2. 버킷 설계

| 버킷 | 용도 | 공개 | 경로 규칙 |
|---|---|---|---|
| `avatars` | 프로필 사진 | public read | `{user_id}/avatar-{timestamp}.{ext}` |
| `log-images` | 기록 사진 | public read | `{user_id}/{timestamp}-{random}.{ext}` |

### 2.1 접근 정책 (RLS on `storage.objects`)

| 작업 | 정책 |
|---|---|
| SELECT (읽기) | 두 버킷 모두 공개 — 이미지 `<img src>` 직접 사용 가능 |
| INSERT / UPDATE / DELETE | `authenticated` 이면서 **경로 첫 폴더명이 본인 `user_id`** 일 때만 허용 |

```sql
(storage.foldername(name))[1] = auth.uid()::text
```

→ 다른 사용자의 폴더에 쓰거나 남의 파일을 지울 수 없다.

---

## 3. 동작 방식

### 3.1 업로드 흐름

```
[파일 선택]
     │  <input type="file" accept="image/*">
     ▼
[클라이언트 검증]  형식 · 용량 확인
     │
     ▼
[로컬 미리보기]  URL.createObjectURL() 로 즉시 프리뷰
     │
     ▼
[저장 버튼 클릭]
     │
     ▼
supabase.storage.from(bucket).upload(path, file, { upsert: false })
     │
     ▼
getPublicUrl(path) → 공개 URL 확보
     │
     ▼
DB 저장 (logs.image_url 또는 profiles.avatar_url)
     │
     ▼
화면 반영 (기록 카드 썸네일 / 프로필 아바타 / 오늘 화면 헤더)
```

### 3.2 검증 규칙

| 항목 | 규칙 |
|---|---|
| 허용 형식 | `image/jpeg`, `image/png`, `image/webp`, `image/heic` |
| 최대 용량 | **5MB** |
| 최대 개수 | 기록당 1장, 프로필당 1장 |

### 3.3 파일명 생성

원본 파일명은 사용하지 않는다 (한글·공백·중복 문제 회피).

```
`${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`
```

### 3.4 교체 / 삭제

| 동작 | 처리 |
|---|---|
| **교체** | 새 파일 업로드 → DB `image_url` 갱신 → **이전 파일 Storage 삭제** |
| **삭제** | DB `image_url = null` → Storage 파일 삭제 |
| **레코드 삭제** | 기록/프로필 삭제 시 연결된 Storage 파일도 삭제 |

### 3.5 화면 노출

| 위치 | 노출 형태 |
|---|---|
| `/logs` 목록 | 카드 우측 정사각 썸네일 (64×64, `object-cover`) |
| `/logs/[id]/edit` | 상단 대형 프리뷰 (16:9) + 교체/삭제 버튼 |
| `/` 오늘 화면 | 기록 요약 카드의 작은 썸네일 |
| `/profile` | 원형 아바타 (96×96) |
| AppBar | 원형 아바타 (32×32) |

> `next.config.ts`의 `images.remotePatterns`에 Supabase Storage 도메인을 등록해 `next/image` 최적화를 사용한다.

---

## 4. 예외 처리

| # | 상황 | 처리 |
|---|---|---|
| E1 | 이미지가 아닌 파일 선택 (PDF, 동영상 등) | 업로드 차단 + 토스트 *"이미지 파일만 올릴 수 있어요 (JPG, PNG, WebP)"* |
| E2 | 5MB 초과 | 업로드 차단 + *"5MB 이하 이미지를 선택해 주세요. (현재 {n}MB)"* |
| E3 | 업로드 중 네트워크 끊김 | 진행 표시 중단 + *"업로드에 실패했어요. 다시 시도해 주세요."* + 선택한 파일 유지 |
| E4 | Storage 업로드 성공 → DB 저장 실패 | 업로드된 파일을 **즉시 삭제(롤백)** 해 고아 파일 방지 |
| E5 | DB 저장 성공 → 이전 파일 삭제 실패 | 사용자 흐름은 그대로 진행. 콘솔 경고만 남김 (데이터 정합성에 영향 없음) |
| E6 | 파일명 충돌 | 타임스탬프 + 랜덤 8자로 사실상 충돌 없음. 그래도 실패하면 재생성 1회 재시도 |
| E7 | 업로드 중 페이지 이탈 | `beforeunload` 경고 — *"업로드가 진행 중이에요. 나가시겠어요?"* |
| E8 | 이미지 URL이 깨짐 (파일 삭제됨 등) | `onError`로 플레이스홀더 이미지 대체, 레이아웃 깨짐 방지 |
| E9 | 다른 사용자 폴더에 업로드 시도 | Storage RLS가 차단 → *"권한이 없어요"* |
| E10 | 업로드 버튼 연타 | 진행 중 입력 비활성화 + 진행률 표시 |
| E11 | 비로그인 상태 업로드 시도 | 미들웨어가 `/login`으로 리다이렉트 |

---

## 5. 완료 조건

- [ ] Supabase Storage에 `avatars`, `log-images` 버킷이 생성되어 있다.
- [ ] 기록 생성 시 사진을 첨부하면 Storage에 업로드되고 `logs.image_url`에 URL이 저장된다.
- [ ] 업로드한 기록 사진이 `/logs` 목록과 오늘 화면에서 **보인다**.
- [ ] 프로필에서 아바타를 업로드하면 `/profile`과 AppBar에 **즉시 반영**된다.
- [ ] 새로고침·재로그인·다른 기기에서도 동일한 이미지가 보인다.
- [ ] 5MB 초과 파일과 이미지가 아닌 파일은 거부된다.
- [ ] 사진 교체 시 이전 파일이 Storage에서 정리된다.
- [ ] 다른 사용자 폴더에는 업로드·삭제할 수 없다.
