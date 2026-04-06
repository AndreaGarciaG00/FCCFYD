import { createClient } from '@supabase/supabase-js'

const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined

const supabaseUrl =
  viteEnv?.VITE_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL

const supabaseKey =
  viteEnv?.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Faltan SUPABASE_URL y SUPABASE_ANON_KEY (CLI) o VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY (Vite).'
  )
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase