import { createClient } from '@supabase/supabase-js'

// 클라이언트 사이드용 Supabase 클라이언트 (공개 키 사용)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// 서버 사이드용 Supabase 클라이언트 (서비스 롤 키 사용)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
