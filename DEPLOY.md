# 웹사이트 배포 가이드

이 가이드는 개인 회생파산 자가진단 웹사이트를 실제로 게시하는 방법을 안내합니다.

## 배포 옵션

### 방법 1: Vercel (가장 쉬움, 추천) ⭐

Vercel은 Next.js를 만든 회사이며, 무료 플랜을 제공합니다.

#### 단계별 가이드:

1. **GitHub 저장소 생성**
   ```bash
   # Git 저장소 초기화
   git init
   git add .
   git commit -m "Initial commit"
   
   # GitHub에 새 저장소를 만들고 아래 명령어 실행
   git remote add origin https://github.com/사용자명/저장소명.git
   git branch -M main
   git push -u origin main
   ```

2. **Vercel 계정 생성 및 배포**
   - https://vercel.com 접속
   - GitHub 계정으로 로그인
   - "Add New Project" 클릭
   - GitHub 저장소 선택
   - 프로젝트 설정:
     - Framework Preset: Next.js (자동 감지됨)
     - Root Directory: `./` (기본값)
   - "Deploy" 클릭

3. **환경 변수 설정** (중요!)
   Vercel 대시보드에서:
   - Settings → Environment Variables
   - 다음 변수 추가:
     ```
     ADMIN_PASSWORD=여기에_설정한_강력한_비밀번호
     SESSION_SECRET=여기에_생성한_세션_시크릿
     NEXT_PUBLIC_PHONE_NUMBER=010-1234-5678
     ```
   - ⚠️ `ADMIN_PASSWORD`는 `.env.local`에 설정한 값과 동일하게 설정
   - ⚠️ `SESSION_SECRET`도 `.env.local`에 설정한 값과 동일하게 설정

4. **배포 완료**
   - 배포가 완료되면 자동으로 URL이 생성됩니다 (예: `https://your-project.vercel.app`)
   - 이 URL을 공유하면 누구나 접속할 수 있습니다

#### ⚠️ 중요: 파일 저장 문제

현재 코드는 로컬 파일 시스템(`data/`, `public/uploads/`)을 사용합니다. 
Vercel은 서버리스 환경이므로 파일이 영구 저장되지 않습니다.

**해결 방법:**
- **옵션 A**: 데이터베이스 사용 (Supabase, MongoDB 등)
- **옵션 B**: 클라우드 스토리지 사용 (AWS S3, Cloudinary 등)
- **옵션 C**: VPS 서버 사용 (아래 방법 2 참고)

---

### 방법 2: VPS 서버 (자체 서버)

파일 저장이 필요한 경우 자체 서버를 사용할 수 있습니다.

#### 추천 서비스:
- **AWS EC2** (Amazon)
- **DigitalOcean** (월 $6부터)
- **Linode** (월 $5부터)
- **Naver Cloud Platform** (국내 서비스)

#### 단계:
1. 서버 인스턴스 생성 (Ubuntu 20.04+ 권장)
2. Node.js 설치
3. 프로젝트 클론 및 빌드
4. PM2로 프로세스 관리
5. Nginx로 리버스 프록시 설정
6. 도메인 연결 (선택사항)

---

### 방법 3: Netlify

Vercel과 유사한 서비스입니다.

1. https://netlify.com 접속
2. GitHub 저장소 연결
3. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. 환경 변수 설정
5. 배포

---

## 배포 전 체크리스트

- [ ] `package.json`의 빌드 스크립트 확인
- [ ] 환경 변수 정리 (`.env.local` 파일 확인)
- [ ] `.gitignore`에 민감한 정보가 제외되어 있는지 확인
- [ ] 프로덕션 빌드 테스트 (`npm run build`)
- [ ] 관리자 비밀번호 변경 (기본값 "admin" 사용 금지)

## 배포 후 확인사항

1. 웹사이트 접속 테스트
2. 자가진단 폼 제출 테스트
3. 관리자 로그인 테스트
4. 파일 업로드 테스트 (Vercel 사용 시 제한적)

## 도메인 연결 (선택사항)

Vercel/Netlify에서:
- Settings → Domains
- 원하는 도메인 입력
- DNS 설정 안내에 따라 도메인 제공업체에서 설정

---

## 문제 해결

### 빌드 에러
- `npm run build` 로컬에서 먼저 테스트
- 에러 메시지 확인

### 파일 업로드 안 됨
- Vercel은 파일 시스템 저장을 지원하지 않음
- 데이터베이스 또는 클라우드 스토리지로 전환 필요

### 환경 변수 적용 안 됨
- Vercel에서 환경 변수 설정 후 재배포 필요
- `NEXT_PUBLIC_` 접두사 확인
