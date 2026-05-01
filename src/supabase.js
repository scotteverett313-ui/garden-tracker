import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ─── Auth ─────────────────────────────────────────────────────────────────────

let _userId = 'default';
export function setUserId(id) { _userId = id || 'default'; }

export async function authSignUp(email, password, name) {
  if (!supabase) return { error: { message: "Supabase not configured" } };
  return supabase.auth.signUp({ email, password, options: { data: { name } } });
}

export async function authSignIn(email, password) {
  if (!supabase) return { error: { message: "Supabase not configured" } };
  return supabase.auth.signInWithPassword({ email, password });
}

export async function authSignOut() {
  if (!supabase) return;
  return supabase.auth.signOut();
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

export async function dbLoad(key) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('data')
      .eq('key', key)
      .eq('user_id', _userId)
      .single();
    if (error || !data) return null;
    return data.data;
  } catch {
    return null;
  }
}

export async function dbSave(key, value) {
  if (!supabase) return;
  try {
    await supabase
      .from('app_data')
      .upsert({ key, user_id: _userId, data: value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  } catch (e) {
    console.error('dbSave error:', e);
  }
}

export async function dbLoadPlants() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('plants')
      .select('id, data')
      .eq('user_id', _userId);
    if (error || !data) return null;
    return data.map(row => ({ ...row.data, id: row.id }));
  } catch {
    return null;
  }
}

export async function dbSavePlants(plants) {
  if (!supabase) return;
  try {
    if (plants.length > 0) {
      await supabase.from('plants').upsert(
        plants.map(p => ({ id: p.id, user_id: _userId, data: p, updated_at: new Date().toISOString() })),
        { onConflict: 'id' }
      );
    }
    const { data: existing } = await supabase.from('plants').select('id').eq('user_id', _userId);
    if (existing) {
      const currentIds = new Set(plants.map(p => p.id));
      const toDelete = existing.filter(r => !currentIds.has(r.id)).map(r => r.id);
      if (toDelete.length > 0) {
        await supabase.from('plants').delete().in('id', toDelete);
      }
    }
  } catch (e) {
    console.error('dbSavePlants error:', e);
  }
}

export async function dbLoadSeeds() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('seeds')
      .select('id, data')
      .eq('user_id', _userId);
    if (error || !data) return null;
    return data.map(row => ({ ...row.data, id: row.id }));
  } catch {
    return null;
  }
}

export async function dbSaveSeeds(seeds) {
  if (!supabase) return;
  try {
    if (seeds.length > 0) {
      await supabase.from('seeds').upsert(
        seeds.map(s => ({ id: s.id, user_id: _userId, data: s, updated_at: new Date().toISOString() })),
        { onConflict: 'id' }
      );
    }
    const { data: existing } = await supabase.from('seeds').select('id').eq('user_id', _userId);
    if (existing) {
      const currentIds = new Set(seeds.map(s => s.id));
      const toDelete = existing.filter(r => !currentIds.has(r.id)).map(r => r.id);
      if (toDelete.length > 0) {
        await supabase.from('seeds').delete().in('id', toDelete);
      }
    }
  } catch (e) {
    console.error('dbSaveSeeds error:', e);
  }
}
