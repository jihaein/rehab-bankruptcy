-- submissions 테이블에 동의 관련 컬럼 추가
-- Supabase SQL Editor에서 실행하세요.

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS privacy_consent boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS overseas_transfer_consent boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false;
