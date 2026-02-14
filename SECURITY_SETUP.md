# 보안 설정 가이드

## 🔐 환경 변수 설정

프로덕션 배포 전 반드시 환경 변수를 설정하세요.

### `.env.local` 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수를 설정:

```env
# 관리자 비밀번호 (절대 공개하지 마세요!)
ADMIN_PASSWORD=강력한_비밀번호_여기에_입력

# 세션 시크릿 (자동 생성되지만 고정값 권장)
SESSION_SECRET=랜덤_32자_이상_문자열

# 전화번호 (선택사항)
NEXT_PUBLIC_PHONE_NUMBER=010-1234-5678
```

### 비밀번호 생성 방법

강력한 비밀번호를 생성하려면:
- 최소 12자 이상
- 대소문자, 숫자, 특수문자 포함
- 예측 불가능한 조합

온라인 도구: https://passwordsgenerator.net/

### SESSION_SECRET 생성

터미널에서 실행:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

또는:
```bash
openssl rand -hex 32
```

---

## 🚨 보안 체크리스트

배포 전 확인:

- [ ] `ADMIN_PASSWORD` 설정 (기본값 "admin" 사용 금지)
- [ ] `SESSION_SECRET` 설정
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 프로덕션 환경 변수 설정 (Vercel, Netlify 등)
- [ ] HTTPS 강제 설정
- [ ] 파일 업로드 크기 제한 확인 (10MB)
- [ ] 관리자 API 인증 테스트

---

## 📝 주요 보안 개선 사항

### ✅ 완료된 개선

1. **서버 사이드 인증**
   - 클라이언트 사이드 인증 제거
   - JWT/세션 기반 인증 구현
   - HTTP-only 쿠키 사용

2. **비밀번호 해싱**
   - SHA-256 해싱 적용
   - 평문 저장 금지

3. **API 인증 미들웨어**
   - 모든 관리자 API에 인증 체크 추가
   - 인증 실패 시 401 응답

4. **파일 업로드 검증**
   - 파일 타입 검증 (JPG, PNG, PDF만 허용)
   - 파일 크기 제한 (10MB)
   - 파일 이름 검증 (경로 탐색 공격 방지)

### ⚠️ 추가 권장 사항

1. **bcrypt 사용** (현재는 SHA-256)
   ```bash
   npm install bcrypt
   npm install --save-dev @types/bcrypt
   ```

2. **Rate Limiting**
   - 로그인 시도 제한
   - API 호출 제한

3. **데이터베이스 전환**
   - JSON 파일 대신 안전한 DB 사용
   - 암호화된 연결

4. **2단계 인증 (2FA)**
   - 관리자 계정에 2FA 추가

---

## 🔧 프로덕션 배포 시 환경 변수 설정

### Vercel

1. 프로젝트 → Settings → Environment Variables
2. 다음 변수 추가:
   - `ADMIN_PASSWORD` = (강력한 비밀번호)
   - `SESSION_SECRET` = (랜덤 문자열)
   - `NEXT_PUBLIC_PHONE_NUMBER` = (전화번호, 선택)

### Netlify

1. Site settings → Environment variables
2. 동일한 변수 추가

### 자체 서버

`.env.local` 파일을 서버에 업로드하거나 환경 변수로 설정

---

## 🧪 보안 테스트

배포 후 다음을 테스트:

1. **인증 테스트**
   - 잘못된 비밀번호로 로그인 시도 → 실패해야 함
   - 인증 없이 API 호출 → 401 에러

2. **파일 업로드 테스트**
   - 10MB 초과 파일 → 거부
   - 허용되지 않은 파일 타입 → 거부
   - 정상 파일 → 성공

3. **세션 테스트**
   - 로그인 후 24시간 경과 → 세션 만료
   - 로그아웃 후 API 호출 → 401 에러

---

## 📞 문제 발생 시

보안 문제 발견 시:
1. 즉시 서비스 중단
2. 비밀번호 변경
3. 세션 무효화
4. 로그 확인
5. 필요시 전문가 상담
