import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * 客户端 Supabase 实例（使用 anon key，受 RLS 控制）
 * 可在客户端和服务端通用
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 服务端管理员 Supabase 实例（使用 service_role key，绕过 RLS）
 * 仅在服务端使用：Server Components、Route Handlers、Server Actions
 * ⚠️ 绝对不能暴露给浏览器
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
