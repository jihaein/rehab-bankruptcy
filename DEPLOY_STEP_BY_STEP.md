# 배포 단계별 가이드

## 🚀 Vercel 배포 (가장 쉬운 방법)

### 1단계: Git 저장소 초기화

터미널에서 다음 명령어를 실행하세요:

```bash
# Git 저장소 초기화
git init

# 모든 파일 추가 (민감한 정보는 자동 제외됨)
git add .

# 첫 커밋
git commit -m "Initial commit: 회생파산 자가진단 웹사이트"
```

### 2단계: GitHub 저장소 생성

1. **GitHub 접속**: https://github.com
2. **새 저장소 생성**:
   - 우측 상단 "+" 버튼 클릭 → "New repository"
   - Repository name: `rehab-bankruptcy` (또는 원하는 이름)
   - Public 또는 Private 선택 (Private 권장 - 민감한 정보 포함)
   - "Create repository" 클릭

3. **로컬 저장소 연결**:
   ```bash
   # GitHub에서 제공하는 명령어 사용 (HTTPS 방식)
   git remote add origin https://github.com/사용자명/저장소명.git
   git branch -M main
   git push -u origin main
   ```

   또는 SSH 방식:
   ```bash
   git remote add origin git@github.com:사용자명/저장소명.git
   git branch -M main
   git push -u origin main
   ```

### 3단계: Vercel 배포

1. **Vercel 접속**: https://vercel.com
2. **계정 생성/로그인**:
   - "Sign Up" 클릭
   - GitHub 계정으로 로그인 (권장)
3. **프로젝트 추가**:
   - 대시보드에서 "Add New Project" 클릭
   - "Import Git Repository"에서 방금 만든 GitHub 저장소 선택
   - "Import" 클릭
4. **프로젝트 설정**:
   - Framework Preset: **Next.js** (자동 감지됨)
   - Root Directory: `./` (기본값 유지)
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)
   - Install Command: `npm install` (기본값)
5. **환경 변수 설정** (중요!):
   - "Environment Variables" 섹션 클릭
   - 다음 변수들을 추가:
   
     ```
     ADMIN_PASSWORD=여기에_설정한_강력한_비밀번호
     SESSION_SECRET=여기에_생성한_세션_시크릿
     NEXT_PUBLIC_PHONE_NUMBER=010-1234-5678
     ```
   
   - 각 변수 추가 후 "Save" 클릭
6. **배포 시작**:
   - "Deploy" 버튼 클릭
   - 배포가 완료될 때까지 대기 (약 2-3분)

### 4단계: 배포 확인

1. **배포 완료 후**:
   - Vercel 대시보드에서 "Visit" 버튼 클릭
   - 또는 생성된 URL로 접속 (예: `https://your-project.vercel.app`)

2. **기능 테스트**:
   - ✅ 메인 페이지 접속
   - ✅ 자가진단 폼 제출
   - ✅ 관리자 로그인 (설정한 비밀번호로)
   - ✅ 고객 등록
   - ⚠️ 파일 업로드 (Vercel은 파일 저장이 제한적 - 아래 참고)

---

## ⚠️ 중요: 파일 저장 제한사항

**Vercel은 서버리스 환경**이므로:
- ✅ 진단 내역, 고객 정보는 저장됨 (JSON 파일)
- ⚠️ 업로드된 서류 파일은 **영구 저장되지 않음** (재배포 시 삭제됨)

### 해결 방법

**옵션 1: 클라우드 스토리지 사용** (권장)
- AWS S3, Cloudinary, Supabase Storage 등
- 파일을 클라우드에 저장

**옵션 2: VPS 서버 사용**
- DigitalOcean, AWS EC2 등
- 파일 시스템 저장 가능

**옵션 3: 데이터베이스 전환**
- Supabase, MongoDB 등
- 파일을 데이터베이스에 저장

---

## 🔧 배포 후 추가 설정

### 도메인 연결 (선택사항)

1. Vercel 대시보드 → Settings → Domains
2. 원하는 도메인 입력
3. DNS 설정 안내에 따라 도메인 제공업체에서 설정

### 환경 변수 수정

1. Vercel 대시보드 → Settings → Environment Variables
2. 변수 수정 후 자동 재배포됨

---

## 🐛 문제 해결

### 빌드 실패
- 로컬에서 `npm run build` 실행하여 에러 확인
- 에러 메시지를 확인하고 수정

### 환경 변수 적용 안 됨
- Vercel에서 환경 변수 설정 후 재배포
- 변수 이름 확인 (대소문자 구분)

### 파일 업로드 안 됨
- Vercel은 파일 시스템 저장을 지원하지 않음
- 클라우드 스토리지로 전환 필요

---

## 📋 배포 체크리스트

배포 전:
- [ ] `.env.local` 파일 생성 및 설정
- [ ] 로컬에서 `npm run build` 성공 확인
- [ ] Git 저장소에 커밋 완료
- [ ] GitHub에 푸시 완료
- [ ] Vercel에 환경 변수 설정 완료

배포 후:
- [ ] 웹사이트 접속 확인
- [ ] 자가진단 폼 테스트
- [ ] 관리자 로그인 테스트
- [ ] 고객 등록 테스트
