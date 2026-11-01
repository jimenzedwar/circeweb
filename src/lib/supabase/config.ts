export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Supabase ahora la llama "publishable key"; se acepta también el nombre antiguo (anon key).
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
/** Sin variables de Supabase el sitio funciona en "modo demo" con los datos de src/data. */
export const supabaseConfigurado = Boolean(SUPABASE_URL && SUPABASE_KEY);
