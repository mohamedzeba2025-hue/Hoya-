import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export async function signUpWithEmail(email, password) {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase.auth.signUp({ email, password });
}

export async function signInWithEmail(email, password) {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase.auth.signOut();
}

export async function loadAccountProgress(userId) {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase
    .from('hoya_user_progress')
    .select('progress, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
}

export async function saveAccountProgress(userId, progress) {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase
    .from('hoya_user_progress')
    .upsert({ user_id: userId, progress, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
}
