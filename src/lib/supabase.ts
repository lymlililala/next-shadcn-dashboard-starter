import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * 懒加载客户端 Supabase 实例（使用 anon key，受 RLS 控制）
 * 延迟到运行时才创建，避免构建阶段因缺少环境变量而崩溃
 */
let _supabase: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error(
        'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
      );
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

/** @deprecated 使用 getSupabase() 代替直接导入实例 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  }
});

/**
 * 懒加载服务端管理员 Supabase 实例（使用 service_role key，绕过 RLS）
 * 仅在服务端使用：Server Components、Route Handlers、Server Actions
 * ⚠️ 绝对不能暴露给浏览器
 */
let _supabaseAdmin: SupabaseClient | null = null;
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required'
      );
    }
    _supabaseAdmin = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return _supabaseAdmin;
}

/** @deprecated 使用 getSupabaseAdmin() 代替直接导入实例 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[prop];
  }
});
