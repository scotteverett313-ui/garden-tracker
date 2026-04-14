import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Data helpers ─────────────────────────────────────────────────────────────
const USER_ID = 'default';

export async function dbLoad(key) {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('data')
      .eq('key', key)
      .eq('user_id', USER_ID)
      .single();
    if (error || !data) return null;
    return data.data;
  } catch {
    return null;
  }
}

export async function dbSave(key, value) {
  try {
    await supabase
      .from('app_data')
      .upsert({ key, user_id: USER_ID, data: value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  } catch (e) {
    console.error('dbSave error:', e);
  }
}

export async function dbLoadPlants() {
  try {
    const { data, error } = await supabase
      .from('plants')
      .select('id, data')
      .eq('user_id', USER_ID);
    if (error || !data) return null;
    return data.map(row => ({ ...row.data, id: row.id }));
  } catch {
    return null;
  }
}

export async function dbSavePlants(plants) {
  try {
    // Upsert all plants
    if (plants.length > 0) {
      await supabase.from('plants').upsert(
        plants.map(p => ({ id: p.id, user_id: USER_ID, data: p, updated_at: new Date().toISOString() })),
        { onConflict: 'id' }
      );
    }
    // Delete removed plants — get all IDs in DB, delete ones not in current list
    const { data: existing } = await supabase.from('plants').select('id').eq('user_id', USER_ID);
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
  try {
    const { data, error } = await supabase
      .from('seeds')
      .select('id, data')
      .eq('user_id', USER_ID);
    if (error || !data) return null;
    return data.map(row => ({ ...row.data, id: row.id }));
  } catch {
    return null;
  }
}

export async function dbSaveSeeds(seeds) {
  try {
    if (seeds.length > 0) {
      await supabase.from('seeds').upsert(
        seeds.map(s => ({ id: s.id, user_id: USER_ID, data: s, updated_at: new Date().toISOString() })),
        { onConflict: 'id' }
      );
    }
    const { data: existing } = await supabase.from('seeds').select('id').eq('user_id', USER_ID);
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
