// Supabase 클라이언트 설정
// 이 파일은 Supabase 데이터베이스와 연결하기 위한 "전화기" 역할을 합니다

import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 가져오기
// .env.local 파일에 이 값들을 설정해야 합니다!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 환경 변수 확인 (에러 대신 경고)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Supabase 환경 변수가 설정되지 않았습니다!\n' +
    '.env.local 파일에 다음을 추가하세요:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=...\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=...\n' +
    'SUPABASE_SERVICE_ROLE_KEY=...'
  );
}

// 클라이언트 사이드용 (브라우저에서 사용)
// 공개 키를 사용하므로 제한된 권한만 가짐
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 서버 사이드용 (API 라우트에서 사용)
// 서비스 키를 사용하므로 모든 권한을 가짐 (관리자 권한)
// ⚠️ 이 키는 절대 브라우저에 노출되면 안 됩니다!
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// supabaseAdmin이 없으면 경고 (선택사항)
if (!supabaseAdmin) {
  console.warn(
    '⚠️ SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.\n' +
    '서버 사이드 기능이 제한될 수 있습니다.'
  );
}
