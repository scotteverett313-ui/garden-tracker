import { ICON_LIBRARY } from "./constants.js";

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function localNoon(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(12, 0, 0, 0);
  return Math.round((localNoon(dateStr) - today) / 86400000);
}

export function daysSince(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(12, 0, 0, 0);
  return Math.round((today - localNoon(dateStr)) / 86400000);
}

export function formatDate(dateStr) {
  if (!dateStr) return null;
  return localNoon(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function calcHarvestDate(dateStarted, dtm) {
  if (!dateStarted || !dtm) return null;
  const d = localNoon(dateStarted);
  d.setDate(d.getDate() + parseInt(dtm));
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getAutoIcon(plantName) {
  if (!plantName) return null;
  const lower = plantName.toLowerCase();
  return ICON_LIBRARY.find(icon =>
    icon.name.toLowerCase() === lower ||
    icon.tags.some(tag => lower.includes(tag) || tag.includes(lower))
  ) || null;
}

export function compressImage(file, maxSize = 900, quality = 0.75) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = url;
  });
}

// localStorage helpers (with Supabase sync handled at App level)
export async function loadData(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}
