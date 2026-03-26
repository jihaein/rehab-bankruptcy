# 지산 법무사사무소 웹사이트 보안 설정 가이드

감사 대비 및 법적 리스크 최소화를 위한 Supabase 보안 체크리스트입니다.

---

## 1. 데이터베이스 마이그레이션

### 1-1. 동의 컬럼 추가
`supabase_add_consent_columns.sql` 파일을 Supabase Dashboard → SQL Editor에서 실행하세요.

### 1-2. password_plain 컬럼 삭제 (필수!)
⚠️ **평문 비밀번호 저장은 개인정보보호법 위반 소지가 있습니다.**

Supabase Dashboard → SQL Editor에서 아래를 실행하세요:

```sql
-- 기존 평문 비밀번호를 해싱된 비밀번호로 마이그레이션 (이미 해싱된 경우 생략)
-- 그 후 평문 비밀번호 컬럼 완전 삭제
ALTER TABLE public.customers DROP COLUMN IF EXISTS password_plain;
```

> ⚡ 이 작업 후 기존에 평문으로만 저장된 비밀번호로는 로그인이 불가합니다.
> 관리자 페이지에서 해당 고객의 비밀번호를 재설정해주세요.

---

## 2. Row Level Security (RLS) - 완료 여부 확인

### RLS 활성화 + anon 접근 차단 (모든 테이블)
```sql
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 anon 차단
DROP POLICY IF EXISTS "anon_select" ON public.customers;
DROP POLICY IF EXISTS "anon_insert" ON public.customers;
DROP POLICY IF EXISTS "anon_update" ON public.customers;
DROP POLICY IF EXISTS "anon_delete" ON public.customers;
DROP POLICY IF EXISTS "anon_select" ON public.documents;
DROP POLICY IF EXISTS "anon_insert" ON public.documents;
DROP POLICY IF EXISTS "anon_update" ON public.documents;
DROP POLICY IF EXISTS "anon_delete" ON public.documents;
DROP POLICY IF EXISTS "anon_select" ON public.submissions;
DROP POLICY IF EXISTS "anon_insert" ON public.submissions;
DROP POLICY IF EXISTS "anon_update" ON public.submissions;
DROP POLICY IF EXISTS "anon_delete" ON public.submissions;

REVOKE ALL ON public.customers FROM anon;
REVOKE ALL ON public.documents FROM anon;
REVOKE ALL ON public.submissions FROM anon;
```

---

## 3. Storage 보안

### Supabase Storage 버킷을 Private으로 설정
Supabase Dashboard → Storage → documents 버킷 → Settings에서:
- **Public** 옵션이 **OFF** 인지 확인 (중요!)
- Public이 ON이면 누구나 파일 URL로 접근 가능

### 파일 접근 방식
- ✅ **Signed URL**: 1시간 만료 시한부 URL로 파일 접근 (코드에 적용 완료)
- ✅ **관리자 인증**: `/api/documents/file` 엔드포인트는 관리자 로그인 필수

---

## 4. 반드시 확인할 사항

| 항목 | 상태 | 비고 |
|------|------|------|
| password_plain 컬럼 삭제 | ⬜ | 위 SQL 실행 |
| RLS 활성화 (3개 테이블) | ⬜ | 이미 실행했으면 ✅ |
| Storage 버킷 Private 확인 | ⬜ | Dashboard에서 확인 |
| Service Role Key는 서버(.env)에만 | ⬜ | GitHub에 절대 업로드 금지 |
| HTTPS 강제 | ⬜ | Vercel 기본 적용 |
| Supabase 콘솔 2FA | ⬜ | Dashboard → Account → 2FA 설정 |
| ADMIN_PASSWORD 강력한 비밀번호 | ⬜ | .env.local에서 변경 |

---

## 5. .env.local 예시

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# 절대 공개 금지 (서버 전용)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_PASSWORD=강력한비밀번호여기에
SESSION_SECRET=랜덤문자열여기에
```

`.env.local`은 `.gitignore`에 포함되어 있어야 합니다. (확인 완료 ✅)

---

## 6. 참고

- 동의서 3개(필수 2 + 선택 1) 및 강화형 처리방침 반영 완료
- Signed URL 적용 완료 (1시간 만료)
- 파일 프록시 엔드포인트 관리자 인증 추가 완료
- 상담 미진행 데이터 3개월 자동 삭제는 별도 스케줄러/크론 필요 (추후 구현 가능)
