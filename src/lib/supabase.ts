/**
 * Supabase Client — Guarded Initialization
 *
 * Env var'lar tanımlı değilse createClient() CHAMP atar (Supabase v2).
 * Bu durumu yakalayıp null dönüyoruz ki uygulama sessizce localStorage-only
 * moda düşsün. Öğretmen sayfaları null kontrolü yapmalı.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Supabase client — env yoksa null.
 * KULLANIM: `if (supabase) { await supabase.from(...) }`
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export const isSupabaseConfigured = (): boolean => supabase !== null
