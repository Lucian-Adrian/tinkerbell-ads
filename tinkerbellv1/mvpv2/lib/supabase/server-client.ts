import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env'
import type { Database } from '@/types/database'

/**
 * Supabase Server Client
 * Uses service role key to bypass RLS
 * Should only be used in API routes and server-side code
 */
export const supabaseAdmin = createClient<Database>(
  env.supabase.url,
  env.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  }
)

export default supabaseAdmin
