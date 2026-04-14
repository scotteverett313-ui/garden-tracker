import { ICON_LIBRARY } from "./constants.js";

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = new Date() - new Date(dateStr);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function calcHarvestDate(dateStarted, dtm) {
  if (!dateStarted || !dtm) return null;
  const d = new Date(dateStarted);
  d.setDate(d.getDate() + parseInt(dtm));
  return d.toISOString().split("T")[0];
}

export function getAutoIcon(plantName) {
  if (!plantName) return null;
  const lower = plantName.toLowerCase();
  return ICON_LIBRARY.find(icon =>
    icon.name.toLowerCase() === lower ||
    icon.tags.some(tag => lower.includes(tag) || tag.includes(lower))
  ) || null;
}

// localStorage helpers (with Supabase sync handled at App level)
export async function loadData(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

export async function saveLocalData(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
