# 개인 회생파산 자가진단 웹사이트

개인 회생파산 자가진단을 위한 웹 애플리케이션입니다.

## 주요 기능

1. **자가진단 폼**: 고객이 회생파산 진단에 필요한 정보를 입력
2. **AI 판단**: 입력된 정보를 바탕으로 회생파산 가능 여부 판단 (YES/NO + 상세 설명)
3. **관리자 대시보드**: 제출된 고객 정보 및 진단 결과 조회
4. **전화 상담 연결**: 진단 결과 후 바로 전화 상담 예약 가능

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Data Storage**: Supabase (PostgreSQL + Storage)

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정 (필수)

`.env.local` 파일을 생성하고 다음 변수를 설정해야 합니다:

```env
# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 관리자 비밀번호 (필수)
NEXT_PUBLIC_ADMIN_PASSWORD=your_password

# 세션 비밀번호 (필수)
SESSION_SECRET=your_random_session_secret

# 전화번호 (선택사항)
NEXT_PUBLIC_PHONE_NUMBER=010-1234-5678
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 사용 방법

### 고객용

1. 메인 페이지에서 "진단 시작하기" 버튼 클릭
2. 기본 정보 입력 (이름, 연락처, 나이, 고용 상태)
3. 재무 정보 입력 (부채, 소득, 지출, 자산 등)
4. 진단 결과 확인
5. 필요시 전화 상담 예약

### 관리자용

1. 메인 페이지 하단의 "관리자 로그인" 클릭
2. 비밀번호 입력 (기본: "admin")
3. 제출된 모든 고객 정보 및 진단 결과 확인
4. 각 고객에게 직접 전화 연결 가능

## 데이터 저장

모든 데이터는 Supabase 데이터베이스에 저장됩니다:
- 고객 정보: `customers` 테이블
- 진단 제출 내역: `submissions` 테이블
- 업로드된 문서: `documents` 테이블 및 Storage

## AI 판단 기준

현재 구현된 판단 로직은 다음 요소들을 고려합니다:

- 나이 (만 19세 이상)
- 부채 규모
- 소득 대비 부채 비율
- 월 소득 및 지출
- 자산 규모
- 고용 상태

## 향후 개선 사항

- 실제 AI API 연동 (OpenAI 등)
- 데이터베이스 연동 (PostgreSQL, MySQL 등)
- 더 정교한 판단 로직
- 이메일 알림 기능
- 상담 예약 시스템

## 라이선스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.
