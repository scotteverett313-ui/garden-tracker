import { useState, useEffect, useRef } from "react";

const ZONES = ["Basement Grow Station", "Greenhouse", "Raised Beds", "In-Ground Beds"];
const ZONE_ICONS = { "Basement Grow Station": "💡", "Greenhouse": "🏠", "Raised Beds": "🟫", "In-Ground Beds": "🌱" };
const ZONE_COLORS = { "Basement Grow Station": "#e8e4f0", "Greenhouse": "#d6f0e8", "Raised Beds": "#f5e8d6", "In-Ground Beds": "#ddf0d6" };

const STATUSES = [
  { label: "Seed", icon: "🌰" }, { label: "Germinating", icon: "🌱" }, { label: "Seedling", icon: "🌿" },
  { label: "Transplanted", icon: "🪴" }, { label: "Growing", icon: "🌾" }, { label: "Flowering", icon: "🌸" },
  { label: "Fruiting", icon: "🍅" }, { label: "Harvesting", icon: "🧺" }, { label: "Dormant", icon: "💤" },
  { label: "Harvested", icon: "✅" }, { label: "Dead", icon: "🪦" }
];

const STATUS_COLORS = {
  "Seed": "#f5e6c8", "Germinating": "#e8f0d8", "Seedling": "#d6e8d0",
  "Transplanted": "#fde8c8", "Growing": "#d8ecd8", "Flowering": "#f0d8e8",
  "Fruiting": "#fcd8d8", "Harvesting": "#d8e8c8", "Dormant": "#e8e8e8",
  "Harvested": "#d4edda", "Dead": "#e8e8e8"
};

const CARE_TYPES = ["Watering", "Fertilizing", "Pruning", "Pest Treatment", "Observation"];

// ─── Pixel Art Icon Library ───────────────────────────────────────────────────
const ICON_LIBRARY = [
  { name: "Tomato",    url: "https://raw.githubusercontent.com/scotteverett313-ui/dirt-rich-assets/main/Tomato.png",    tags: ["tomato"] },
  { name: "Carrot",   url: "https://raw.githubusercontent.com/scotteverett313-ui/dirt-rich-assets/main/Carrot.png",    tags: ["carrot"] },
  { name: "Eggplant", url: "https://raw.githubusercontent.com/scotteverett313-ui/dirt-rich-assets/main/Eggplant.png",  tags: ["eggplant", "aubergine"] },
  { name: "Lettuce",  url: "https://raw.githubusercontent.com/scotteverett313-ui/dirt-rich-assets/main/Lettuce.png",   tags: ["lettuce", "salad", "greens"] },
  { name: "Sunflower",url: "https://raw.githubusercontent.com/scotteverett313-ui/dirt-rich-assets/main/Sunflower.png", tags: ["sunflower", "flower"] },
];

function getAutoIcon(plantName) {
  if (!plantName) return null;
  const lower = plantName.toLowerCase();
  return ICON_LIBRARY.find(icon =>
    icon.name.toLowerCase() === lower ||
    icon.tags.some(tag => lower.includes(tag) || tag.includes(lower))
  ) || null;
}



const PLANT_DB = [
  { name: "Tomato", dtm: 75, water: "Regular", sun: "Full Sun", about: "Warm-season crop. Start indoors 6-8 weeks before last frost. Needs consistent moisture and support." },
  { name: "Pepper", dtm: 80, water: "Regular", sun: "Full Sun", about: "Slow starter. Begin indoors 8-10 weeks before last frost. Loves heat and well-drained soil." },
  { name: "Basil", dtm: 60, water: "Moderate", sun: "Full Sun", about: "Aromatic herb. Start indoors after last frost. Pinch flowers to extend harvest." },
  { name: "Lettuce", dtm: 45, water: "Regular", sun: "Partial Shade", about: "Cool-season crop. Direct sow or transplant. Bolt-resistant varieties last longer." },
  { name: "Cucumber", dtm: 55, water: "High", sun: "Full Sun", about: "Warm-season vine. Direct sow after frost. Needs trellis or ample space." },
  { name: "Zucchini", dtm: 50, water: "Regular", sun: "Full Sun", about: "Prolific producer. Direct sow after last frost. One or two plants go a long way." },
  { name: "Kale", dtm: 55, water: "Regular", sun: "Full Sun", about: "Cold-hardy green. Can be started indoors or direct sown. Flavor improves after frost." },
  { name: "Spinach", dtm: 40, water: "Regular", sun: "Partial Shade", about: "Fast-growing cool-season green. Direct sow in early spring or fall." },
  { name: "Broccoli", dtm: 70, water: "Regular", sun: "Full Sun", about: "Start indoors 6-8 weeks before transplant. Cool-season crop that tolerates light frost." },
  { name: "Carrot", dtm: 70, water: "Moderate", sun: "Full Sun", about: "Direct sow only. Loose, deep soil produces best roots. Thin to 3 inches apart." },
  { name: "Radish", dtm: 25, water: "Moderate", sun: "Full Sun", about: "Fastest garden crop. Direct sow every 2 weeks for continuous harvest." },
  { name: "Beet", dtm: 55, water: "Moderate", sun: "Full Sun", about: "Direct sow in cool weather. Thin seedlings — each seed is a cluster." },
  { name: "Peas", dtm: 60, water: "Moderate", sun: "Full Sun", about: "Cool-season climber. Direct sow as soon as soil can be worked. Needs trellis." },
  { name: "Beans", dtm: 55, water: "Moderate", sun: "Full Sun", about: "Direct sow after last frost. No thinning needed. Bush types need no support." },
  { name: "Squash", dtm: 50, water: "Regular", sun: "Full Sun", about: "Vigorous grower. Start indoors or direct sow after last frost. Needs space." },
  { name: "Pumpkin", dtm: 100, water: "Regular", sun: "Full Sun", about: "Long season crop. Start indoors 3-4 weeks before last frost. Needs lots of room." },
  { name: "Eggplant", dtm: 80, water: "Regular", sun: "Full Sun", about: "Heat-loving. Start indoors 8-10 weeks before last frost. Needs warm soil to thrive." },
  { name: "Cilantro", dtm: 50, water: "Moderate", sun: "Partial Shade", about: "Bolt-resistant varieties recommended. Direct sow succession plantings every 3-4 weeks." },
  { name: "Parsley", dtm: 70, water: "Moderate", sun: "Full Sun", about: "Slow germinator. Soak seeds overnight before planting. Biennial but grown as annual." },
  { name: "Dill", dtm: 40, water: "Low", sun: "Full Sun", about: "Direct sow only — doesn't transplant well. Self-seeds readily." },
  { name: "Thyme", dtm: 85, water: "Low", sun: "Full Sun", about: "Drought-tolerant perennial herb. Start indoors or from division." },
  { name: "Mint", dtm: 90, water: "Regular", sun: "Partial Shade", about: "Vigorous spreader. Grow in containers to prevent it taking over the garden." },
  { name: "Cosmos", dtm: 60, water: "Low", sun: "Full Sun", about: "Easy annual flower. Direct sow after last frost. Attracts pollinators all season." },
  { name: "Marigold", dtm: 50, water: "Low", sun: "Full Sun", about: "Companion planting staple. Deters pests. Direct sow or start indoors 4-6 weeks early." },
  { name: "Sunflower", dtm: 70, water: "Low", sun: "Full Sun", about: "Direct sow after last frost. Tall varieties need staking. Great for pollinators." },
  { name: "Borage", dtm: 55, water: "Low", sun: "Full Sun", about: "Edible flowers, great companion plant. Direct sow. Self-seeds aggressively." },
  { name: "Cabbage", dtm: 70, water: "Regular", sun: "Full Sun", about: "Cool-season crop. Start indoors 6-8 weeks before transplant. Tolerates frost." },
  { name: "Cauliflower", dtm: 75, water: "Regular", sun: "Full Sun", about: "Finicky cool-season crop. Blanch heads by tying leaves over forming heads." },
  { name: "Onion", dtm: 100, water: "Regular", sun: "Full Sun", about: "Start from sets, transplants, or seed. Long season. Stop watering when tops fall over." },
  { name: "Garlic", dtm: 240, water: "Moderate", sun: "Full Sun", about: "Plant cloves in fall for summer harvest. One of the easiest crops to grow." },
];

const COMPANION_DB = {
  "Tomato": { good: ["Basil", "Marigold", "Parsley", "Carrot", "Borage"], bad: ["Fennel", "Cabbage", "Corn"] },
  "Pepper": { good: ["Basil", "Marigold", "Carrot", "Tomato"], bad: ["Fennel", "Beans"] },
  "Basil": { good: ["Tomato", "Pepper", "Marigold"], bad: ["Sage", "Mint"] },
  "Lettuce": { good: ["Carrot", "Radish", "Strawberry", "Chives"], bad: ["Celery", "Parsley"] },
  "Cucumber": { good: ["Beans", "Peas", "Marigold", "Sunflower"], bad: ["Potato", "Sage"] },
  "Zucchini": { good: ["Beans", "Marigold", "Nasturtium"], bad: ["Potato"] },
  "Carrot": { good: ["Tomato", "Lettuce", "Rosemary", "Chives"], bad: ["Dill", "Parsnip"] },
  "Marigold": { good: ["Tomato", "Pepper", "Cucumber", "Squash"], bad: [] },
  "Beans": { good: ["Cucumber", "Carrot", "Squash", "Marigold"], bad: ["Onion", "Garlic"] },
  "Kale": { good: ["Beet", "Celery", "Cucumber", "Marigold"], bad: ["Tomato", "Beans"] },
  "Borage": { good: ["Tomato", "Squash", "Strawberry"], bad: [] },
};

const CALENDAR_DATA = [
  { name: "Tomato", type: "Vegetable", indoors: [2,3,4], transplant: [5,6], direct: [] },
  { name: "Pepper", type: "Vegetable", indoors: [1,2,3], transplant: [5,6], direct: [] },
  { name: "Eggplant", type: "Vegetable", indoors: [2,3], transplant: [5,6], direct: [] },
  { name: "Basil", type: "Herb", indoors: [3,4], transplant: [5,6], direct: [] },
  { name: "Lettuce", type: "Vegetable", indoors: [2,3], transplant: [4,5], direct: [8,9] },
  { name: "Spinach", type: "Vegetable", indoors: [], transplant: [], direct: [3,4,8,9] },
  { name: "Kale", type: "Vegetable", indoors: [2,3], transplant: [4,5], direct: [7,8] },
  { name: "Broccoli", type: "Vegetable", indoors: [2,3], transplant: [4,5], direct: [6,7] },
  { name: "Cabbage", type: "Vegetable", indoors: [2,3], transplant: [4,5], direct: [6,7] },
  { name: "Cucumber", type: "Vegetable", indoors: [4,5], transplant: [6], direct: [] },
  { name: "Squash", type: "Vegetable", indoors: [4,5], transplant: [6], direct: [] },
  { name: "Zucchini", type: "Vegetable", indoors: [4,5], transplant: [6], direct: [] },
  { name: "Pumpkin", type: "Vegetable", indoors: [4,5], transplant: [6], direct: [] },
  { name: "Beans", type: "Vegetable", indoors: [], transplant: [], direct: [5,6,7] },
  { name: "Peas", type: "Vegetable", indoors: [], transplant: [], direct: [3,4,8,9] },
  { name: "Carrot", type: "Vegetable", indoors: [], transplant: [], direct: [3,4,5,8] },
  { name: "Radish", type: "Vegetable", indoors: [], transplant: [], direct: [3,4,5,8,9] },
  { name: "Beet", type: "Vegetable", indoors: [], transplant: [], direct: [3,4,5,8] },
  { name: "Onion", type: "Vegetable", indoors: [1,2], transplant: [3,4], direct: [] },
  { name: "Garlic", type: "Vegetable", indoors: [], transplant: [], direct: [9,10] },
  { name: "Cilantro", type: "Herb", indoors: [3,4], transplant: [4,5], direct: [5,6] },
  { name: "Parsley", type: "Herb", indoors: [2,3], transplant: [4,5], direct: [] },
  { name: "Dill", type: "Herb", indoors: [], transplant: [], direct: [4,5,6] },
  { name: "Thyme", type: "Herb", indoors: [2,3], transplant: [4,5], direct: [] },
  { name: "Marigold", type: "Flower", indoors: [3,4], transplant: [5], direct: [5,6] },
  { name: "Cosmos", type: "Flower", indoors: [], transplant: [], direct: [5,6] },
  { name: "Sunflower", type: "Flower", indoors: [], transplant: [], direct: [5,6] },
  { name: "Borage", type: "Flower", indoors: [], transplant: [], direct: [4,5,6] },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = new Date() - new Date(dateStr);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function calcHarvestDate(dateStarted, dtm) {
  if (!dateStarted || !dtm) return null;
  const d = new Date(dateStarted);
  d.setDate(d.getDate() + parseInt(dtm));
  return d.toISOString().split("T")[0];
}

// ─── Toast system ─────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 560, zIndex: 999, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === "error" ? "#c0392b" : t.type === "warning" ? "#e67e22" : "#5c3d1e",
          color: "#fff", borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          animation: "slideUp 0.25s ease",
        }}>
          <span style={{ fontSize: 18 }}>{t.type === "error" ? "⚠️" : t.type === "warning" ? "⚡" : t.icon || "✓"}</span>
          <span>{t.message}</span>
        </div>
      ))}
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { 0% { transform:scale(0.92); opacity:0; } 60% { transform:scale(1.04); } 100% { transform:scale(1); opacity:1; } }
        @keyframes shimmer { 0% { opacity:1; } 50% { opacity:0.7; } 100% { opacity:1; } }

        /* Global press state for all buttons */
        button { transition: transform 0.12s ease, opacity 0.12s ease, background 0.15s ease; }
        button:active { transform: scale(0.95); opacity: 0.88; }

        /* Card press */
        .plant-card:active { transform: scale(0.97); box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
        .plant-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }

        /* CTA press — lime green buttons */
        .btn-cta:active { transform: scale(0.96); background: #8fcf45 !important; }
        .btn-cta { transition: transform 0.12s ease, background 0.12s ease !important; }

        /* Status pill */
        .status-pill { transition: transform 0.1s ease, background 0.15s ease; }
        .status-pill:active { transform: scale(0.93); }

        /* Nav tabs */
        .nav-tab { transition: transform 0.1s ease; }
        .nav-tab:active { transform: scale(0.88); }

        /* Icon picker */
        .icon-btn { transition: transform 0.12s ease, border-color 0.12s ease; }
        .icon-btn:active { transform: scale(0.9); }

        /* Toast entry */
        .toast-item { animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1); }

        /* Modal sheet */
        .modal-sheet { animation: sheetUp 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes sheetUp { from { transform:translateY(100%); opacity:0.5; } to { transform:translateY(0); opacity:1; } }

        /* Zone Add Plant dashed button */
        .add-zone-btn { transition: border-color 0.15s ease, color 0.15s ease; }
        .add-zone-btn:hover { border-color: #000; color: #000; }
        .add-zone-btn:active { transform: scale(0.98); background: #f5f5f3 !important; }

        /* Care type buttons */
        .care-type-btn { transition: all 0.15s ease; }
        .care-type-btn:active { transform: scale(0.94); }
      `}</style>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  function toast(message, { type = "success", icon, duration = 2500 } = {}) {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type, icon }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }
  return { toasts, toast };
}


async function loadData(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}
async function saveData(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── Components ──────────────────────────────────────────────────────────────

function Badge({ label, color }) {
  return (
    <span style={{ background: color || "#e8ede8", color: "#3a5a3a", fontSize: 12, padding: "2px 10px", borderRadius: 20, fontWeight: 500 }}>
      {label}
    </span>
  );
}

function Modal({ children, onClose, width = 560 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ background: "#fff", borderRadius: "16px 16px 0 0", width: "100%", maxWidth: width, maxHeight: "92vh", overflowY: "auto", position: "relative", display: "flex", flexDirection: "column" }}>
        {/* Sticky header with drag handle and close */}
        <div style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, padding: "12px 16px 8px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, background: "#ddd", borderRadius: 4, margin: "0 auto" }} />
          <button onClick={onClose} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "#f0f0f0", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#555" }}>×</button>
        </div>
        <div style={{ padding: "16px 16px 32px", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Icon Picker ─────────────────────────────────────────────────────────────
function IconPicker({ selected, onSelect, plantName }) {
  const [showPicker, setShowPicker] = useState(false);
  const autoIcon = getAutoIcon(plantName);
  const effectiveIcon = selected || autoIcon;

  return (
    <div>
      <label style={lbl}>Plant Icon</label>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Current icon preview */}
        <div style={{ width: 64, height: 64, background: "#f5f5f3", border: "2px solid #000", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
          {effectiveIcon
            ? <img src={effectiveIcon.url} alt={effectiveIcon.name} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
            : <span style={{ fontSize: 28 }}>🌱</span>
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
            {effectiveIcon ? effectiveIcon.name : "No icon selected"}
            {!selected && autoIcon && <span style={{ fontSize: 11, color: "#888", fontWeight: 400, marginLeft: 6 }}>(auto-matched)</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowPicker(v => !v)}
              style={{ padding: "6px 14px", background: "#a8e063", color: "#000", border: "2px solid #000", borderRadius: 50, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              {showPicker ? "Close" : "Choose Icon"}
            </button>
            {selected && (
              <button onClick={() => onSelect(null)}
                style={{ padding: "6px 12px", background: "#fff", border: "1.5px solid #ccc", borderRadius: 50, cursor: "pointer", fontSize: 12, color: "#888" }}>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Icon grid */}
      {showPicker && (
        <div style={{ marginTop: 12, background: "#f5f5f3", borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 10, fontWeight: 600 }}>
            {ICON_LIBRARY.length} icons available — more coming as you add pixel art
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 10 }}>
            {ICON_LIBRARY.map(icon => (
              <button key={icon.name} onClick={() => { onSelect(icon); setShowPicker(false); }} className="icon-btn"
                style={{ background: selected?.name === icon.name ? "#a8e063" : "#fff", border: `2px solid ${selected?.name === icon.name ? "#000" : "#e0e0e0"}`, borderRadius: 12, padding: 8, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={icon.url} alt={icon.name} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }}
                    onError={e => e.target.style.display = "none"} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#555" }}>{icon.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
function AddPlantModal({ onAdd, onClose, userDB, onSaveUserDB, prefill }) {
  const [form, setForm] = useState({
    name: prefill?.name || "",
    variety: prefill?.variety || "",
    about: prefill?.about || "",
    water: prefill?.water || "",
    sun: prefill?.sun || "",
    zone: ZONES[0],
    status: "Seed",
    dateStarted: new Date().toISOString().split("T")[0],
    dtm: prefill?.dtm || "",
    quantity: "",
    notes: "",
    imageUrl: prefill?.imageUrl || "",
  });
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);

  function handleNameChange(val) {
    setForm(f => ({ ...f, name: val }));
    if (!selectedIcon) {
      const auto = getAutoIcon(val);
      if (auto) setForm(f => ({ ...f, imageUrl: auto.url }));
    }
    if (val.length > 1) {
      const builtIn = PLANT_DB.filter(p => p.name.toLowerCase().startsWith(val.toLowerCase()));
      const custom = (userDB || []).filter(p => p.name.toLowerCase().startsWith(val.toLowerCase()) && !builtIn.find(b => b.name.toLowerCase() === p.name.toLowerCase()));
      const all = [...builtIn, ...custom.map(p => ({ ...p, isCustom: true }))];
      setSuggestions(all);
      setShowSugg(all.length > 0);
    } else {
      setShowSugg(false);
    }
  }

  function handleIconSelect(icon) {
    setSelectedIcon(icon);
    setForm(f => ({ ...f, imageUrl: icon ? icon.url : "" }));
  }

  function selectSuggestion(plant) {
    setForm(f => ({ ...f, name: plant.name, about: plant.about || "", water: plant.water || "", sun: plant.sun || "", dtm: plant.dtm || "" }));
    if (!selectedIcon) {
      const auto = getAutoIcon(plant.name);
      if (auto) setForm(f => ({ ...f, imageUrl: auto.url }));
    }
    setShowSugg(false);
  }

  function handleSubmit() {
    if (!form.name.trim()) return;
    const plant = { ...form, id: generateId(), companions: { good: [...(COMPANION_DB[form.name]?.good || [])], bad: [...(COMPANION_DB[form.name]?.bad || [])] }, careLog: [] };
    onAdd(plant);
    const inBuiltIn = PLANT_DB.find(p => p.name.toLowerCase() === form.name.toLowerCase());
    const inUserDB = (userDB || []).find(p => p.name.toLowerCase() === form.name.toLowerCase());
    if (!inBuiltIn && !inUserDB && form.name.trim()) {
      onSaveUserDB([...(userDB || []), { name: form.name.trim(), dtm: form.dtm, water: form.water, sun: form.sun, about: form.about, addedAt: new Date().toISOString() }]);
    } else if (!inBuiltIn && inUserDB) {
      onSaveUserDB((userDB || []).map(p => p.name.toLowerCase() === form.name.toLowerCase() ? { ...p, dtm: form.dtm || p.dtm, water: form.water || p.water, sun: form.sun || p.sun, about: form.about || p.about } : p));
    }
    onClose();
  }

  const input = (key, placeholder, type = "text") => (
    <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
  );

  return (
    <Modal onClose={onClose}>
      <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700 }}>Add New Plant</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <div style={{ position: "relative" }}>
          <label style={lbl}>Plant Name *</label>
          <input placeholder="e.g. Tomato" value={form.name} onChange={e => handleNameChange(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #3a7a4a", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
          {showSugg && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 10, zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxHeight: 200, overflowY: "auto" }}>
              {suggestions.map(p => (
                <div key={p.name} onClick={() => selectSuggestion(p)} style={{ padding: "10px 14px", cursor: "pointer", fontSize: 14, borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fdf6ee"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                  <span>{p.name}</span>
                  {p.isCustom && <span style={{ fontSize: 11, background: "#fff3cd", color: "#856404", padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>my db</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div><label style={lbl}>Variety</label>{input("variety", "e.g. Cherokee Purple")}</div>
        <div style={{ gridColumn: "span 2" }}>
          <IconPicker selected={selectedIcon} onSelect={handleIconSelect} plantName={form.name} />
        </div>
        <div style={{ gridColumn: "span 2" }}><label style={lbl}>About</label><textarea placeholder="Short description or growing tips..." value={form.about} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", minHeight: 70, resize: "vertical" }} /></div>
        <div><label style={lbl}>💧 Water</label>
          <select value={form.water} onChange={e => setForm(f => ({ ...f, water: e.target.value }))} style={sel}>
            <option value="">Select...</option>
            {["Low","Moderate","Regular","High"].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div><label style={lbl}>☀️ Sun</label>
          <select value={form.sun} onChange={e => setForm(f => ({ ...f, sun: e.target.value }))} style={sel}>
            <option value="">Select...</option>
            {["Full Sun","Partial Shade","Full Shade"].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Zone *</label>
          <select value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))} style={sel}>
            {ZONES.map(z => <option key={z}>{z}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={sel}>
            {STATUSES.map(s => <option key={s.label} value={s.label}>{s.icon} {s.label}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Date Started</label>{input("dateStarted", "", "date")}</div>
        <div><label style={lbl}>Days to Maturity</label>{input("dtm", "e.g. 75", "number")}</div>
        <div><label style={lbl}>Quantity</label>{input("quantity", "e.g. 4", "number")}</div>
        <div style={{ gridColumn: "span 2" }}><label style={lbl}>Notes</label><textarea placeholder="Optional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", minHeight: 70, resize: "vertical" }} /></div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid #ccc", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 14 }}>Cancel</button>
        <button onClick={handleSubmit} className="btn-cta" style={{ padding: "10px 24px", background: "#a8e063", color: "#000", border: "2px solid #000", borderRadius: 50, cursor: "pointer", fontSize: 14, fontWeight: 800 }}>+ Add Plant</button>
      </div>
    </Modal>
  );
}

function EditPlantModal({ plant, onSave, onClose }) {
  const [form, setForm] = useState({ ...plant });
  const [selectedIcon, setSelectedIcon] = useState(
    plant.imageUrl ? ICON_LIBRARY.find(i => i.url === plant.imageUrl) || { name: "Custom", url: plant.imageUrl } : null
  );

  function handleIconSelect(icon) {
    setSelectedIcon(icon);
    setForm(f => ({ ...f, imageUrl: icon ? icon.url : "" }));
  }

  function handleSubmit() {
    onSave(form);
    onClose();
  }

  const input = (key, placeholder, type = "text") => (
    <input type={type} placeholder={placeholder} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
  );

  return (
    <Modal onClose={onClose}>
      <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700 }}>Edit Plant</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <div><label style={lbl}>Plant Name</label>{input("name", "Plant name")}</div>
        <div><label style={lbl}>Variety</label>{input("variety", "Variety")}</div>
        <div style={{ gridColumn: "span 2" }}><label style={lbl}>About</label><textarea value={form.about || ""} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", minHeight: 70, resize: "vertical" }} /></div>
        <div><label style={lbl}>💧 Water</label>
          <select value={form.water || ""} onChange={e => setForm(f => ({ ...f, water: e.target.value }))} style={sel}>
            <option value="">Select...</option>
            {["Low","Moderate","Regular","High"].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div><label style={lbl}>☀️ Sun</label>
          <select value={form.sun || ""} onChange={e => setForm(f => ({ ...f, sun: e.target.value }))} style={sel}>
            <option value="">Select...</option>
            {["Full Sun","Partial Shade","Full Shade"].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Zone</label>
          <select value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))} style={sel}>
            {ZONES.map(z => <option key={z}>{z}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={sel}>
            {STATUSES.map(s => <option key={s.label} value={s.label}>{s.icon} {s.label}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Date Started</label>{input("dateStarted", "", "date")}</div>
        <div><label style={lbl}>Days to Maturity</label>{input("dtm", "e.g. 75", "number")}</div>
        <div><label style={lbl}>Quantity</label>{input("quantity", "e.g. 4", "number")}</div>
        <div style={{ gridColumn: "span 2" }}><label style={lbl}>Notes</label><textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", minHeight: 70, resize: "vertical" }} /></div>
        <div style={{ gridColumn: "span 2" }}>
          <IconPicker selected={selectedIcon} onSelect={handleIconSelect} plantName={form.name} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid #ccc", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 14 }}>Cancel</button>
        <button onClick={handleSubmit} className="btn-cta" style={{ padding: "10px 24px", background: "#a8e063", color: "#000", border: "2px solid #000", borderRadius: 50, cursor: "pointer", fontSize: 14, fontWeight: 800 }}>Save Changes</button>
      </div>
    </Modal>
  );
}

function FrostModal({ frostDates, onSave, onClose }) {
  const [lastSpring, setLastSpring] = useState(frostDates.lastSpring || "");
  const [firstFall, setFirstFall] = useState(frostDates.firstFall || "");
  return (
    <Modal onClose={onClose} width={480}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>❄️</span>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Frost Dates</h2>
      </div>
      <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>Set your local frost dates to get harvest timing warnings.</p>
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>Last Spring Frost</label>
        <input type="date" value={lastSpring} onChange={e => setLastSpring(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box" }} />
        <p style={{ color: "#888", fontSize: 12, marginTop: 4 }}>The last date frost typically occurs in spring.</p>
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={lbl}>First Fall Frost</label>
        <input type="date" value={firstFall} onChange={e => setFirstFall(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box" }} />
        <p style={{ color: "#888", fontSize: 12, marginTop: 4 }}>The first date frost typically occurs in fall.</p>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid #ccc", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 14 }}>Cancel</button>
        <button onClick={() => { onSave({ lastSpring, firstFall }); onClose(); }} style={{ padding: "10px 24px", background: "#5c3d1e", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Save Dates</button>
      </div>
    </Modal>
  );
}

function CareLogModal({ plant, onSave, onClose, toast }) {
  const [careType, setCareType] = useState("Watering");
  const [careDate, setCareDate] = useState(new Date().toISOString().split("T")[0]);
  const [careNote, setCareNote] = useState("");
  const harvestDate = calcHarvestDate(plant.dateStarted, plant.dtm);
  const daysLeft = harvestDate ? daysUntil(harvestDate) : null;
  const statusObj = STATUSES.find(s => s.label === plant.status) || STATUSES[0];

  function addEntry() {
    const entry = { id: generateId(), type: careType, date: careDate, notes: careNote };
    const updated = { ...plant, careLog: [...(plant.careLog || []), entry] };
    onSave(updated);
    setCareNote("");
    const icons = { Watering: "💧", Fertilizing: "🌿", Pruning: "✂️", "Pest Treatment": "🐛", Observation: "👁" };
    toast && toast(`${careType} logged for ${plant.name}`, { icon: icons[careType] || "✓" });
  }

  function deleteEntry(id) {
    const updated = { ...plant, careLog: (plant.careLog || []).filter(e => e.id !== id) };
    onSave(updated);
  }

  return (
    <Modal onClose={onClose} width={600}>
      <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700 }}>{plant.name} {plant.variety ? <span style={{ color: "#888", fontWeight: 400 }}>({plant.variety})</span> : null}</h2>
      
      <div style={{ background: "#fdf6ee", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#666", marginBottom: 12 }}>GROWING OVERVIEW</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { icon: statusObj.icon, label: "Status", value: plant.status },
            { icon: "📍", label: "Zone", value: plant.zone },
            { icon: "#️⃣", label: "Quantity", value: plant.quantity || "—" },
            { icon: "📅", label: "Days to Harvest", value: daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} days` : "Ready!") : "—" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#e8f0e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
              <div><div style={{ fontSize: 12, color: "#888" }}>{item.label}</div><div style={{ fontWeight: 600, fontSize: 14 }}>{item.value}</div></div>
            </div>
          ))}
        </div>
      </div>

      {plant.about && <div style={{ background: "#fafaf8", borderRadius: 12, padding: 14, marginBottom: 20, fontSize: 14, color: "#555", lineHeight: 1.5 }}>{plant.about}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label style={lbl}>Type</label>
          <select value={careType} onChange={e => setCareType(e.target.value)} style={sel}>
            {CARE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Date</label>
          <input type="date" value={careDate} onChange={e => setCareDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box" }} />
        </div>
      </div>
      <div style={{ marginBottom: 12 }}><label style={lbl}>Notes (optional)</label>
        <textarea placeholder="e.g. 1L water, added compost tea..." value={careNote} onChange={e => setCareNote(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", minHeight: 70, resize: "vertical" }} />
      </div>
      <button onClick={addEntry} style={{ width: "100%", padding: "12px", background: "#5c3d1e", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 600, marginBottom: 20 }}>+ Log Care</button>

      <div style={{ borderTop: "1px solid #eee", paddingTop: 16 }}>
        {(!plant.careLog || plant.careLog.length === 0) ? (
          <p style={{ textAlign: "center", color: "#aaa", fontSize: 14 }}>No care entries yet.</p>
        ) : (
          [...(plant.careLog || [])].reverse().map(entry => (
            <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{entry.type} <span style={{ color: "#888", fontWeight: 400, fontSize: 13 }}>— {formatDate(entry.date)}</span></div>
                {entry.notes && <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{entry.notes}</div>}
              </div>
              <button onClick={() => deleteEntry(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 18 }}>×</button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

// ─── Plant Detail Sheet ───────────────────────────────────────────────────────
function PlantDetailSheet({ plant, frostDates, onUpdate, onDelete, onClose, toast }) {
  const [showCompanions, setShowCompanions] = useState(false);
  const [showCare, setShowCare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [newGood, setNewGood] = useState("");
  const [newBad, setNewBad] = useState("");

  const statusObj = STATUSES.find(s => s.label === plant.status) || STATUSES[0];
  const harvestDate = calcHarvestDate(plant.dateStarted, plant.dtm);
  const daysLeft = harvestDate ? daysUntil(harvestDate) : null;
  const hasFrostWarning = harvestDate && frostDates.firstFall && new Date(harvestDate) > new Date(frostDates.firstFall);
  const nextZoneIdx = ZONES.indexOf(plant.zone) + 1;
  const nextZone = nextZoneIdx < ZONES.length ? ZONES[nextZoneIdx] : null;

  function updateStatus(status) {
    if (status === "Harvested" || status === "Dead") {
      setPendingStatus(status); setShowEndModal(true); setShowStatusPicker(false); return;
    }
    onUpdate({ ...plant, status });
    setShowStatusPicker(false);
    const s = STATUSES.find(x => x.label === status);
    toast && toast(`${plant.name} → ${status}`, { icon: s?.icon });
  }

  function addCompanion(type) {
    const val = type === "good" ? newGood.trim() : newBad.trim();
    if (!val) return;
    onUpdate({ ...plant, companions: { ...plant.companions, [type]: [...(plant.companions?.[type] || []), val] } });
    type === "good" ? setNewGood("") : setNewBad("");
    toast && toast(`${val} added`, { icon: "🌿" });
  }

  function removeCompanion(type, item) {
    onUpdate({ ...plant, companions: { ...plant.companions, [type]: (plant.companions?.[type] || []).filter(c => c !== item) } });
  }

  return (
    <Modal onClose={onClose}>
      {/* Plant name header */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h2 style={{ margin: "0 0 2px", fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>{plant.name}</h2>
        {plant.variety && <div style={{ color: "#888", fontSize: 15 }}>({plant.variety})</div>}
      </div>

      {/* Growing overview card */}
      <div style={{ background: "#f5f5f3", borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Growing Overview</span>
          {plant.dateStarted && <span style={{ fontSize: 13, color: "#888" }}>Started {formatDate(plant.dateStarted)}</span>}
        </div>
        {/* Water + sun badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {plant.water && <span style={{ border: "1px solid #ccc", borderRadius: 20, padding: "3px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>💧 {plant.water}</span>}
          {plant.sun && <span style={{ border: "1px solid #ccc", borderRadius: 20, padding: "3px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>☀️ {plant.sun}</span>}
        </div>
        {/* 2x2 grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Status", value: plant.status },
            { label: "Zone", value: plant.zone.replace(" Grow Station", "").replace("In-Ground ", "In-Ground\n") },
            { label: "Quantity", value: plant.quantity || "—" },
            { label: "Days to Harvest", value: daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} days` : "Ready!") : "—" },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 12, color: "#888" }}>{item.label}</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, borderTop: "1px solid #e0e0e0", paddingTop: 12 }}>
          <button onClick={() => setShowStatusPicker(v => !v)} className="status-pill"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: STATUS_COLORS[plant.status] || "#eee", border: "none", borderRadius: 20, padding: "5px 12px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {statusObj.icon} {plant.status} <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
          </button>
          {showStatusPicker && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, animation: "popIn 0.2s ease" }}>
              {STATUSES.map(s => (
                <button key={s.label} onClick={() => updateStatus(s.label)} className="status-pill"
                  style={{ background: s.label === plant.status ? STATUS_COLORS[s.label] : "#fff", border: `1px solid ${s.label === plant.status ? "#bbb" : "#e0e0e0"}`, borderRadius: 20, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontWeight: s.label === plant.status ? 700 : 400 }}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Zone move */}
        {nextZone && (
          <button onClick={() => { onUpdate({ ...plant, zone: nextZone }); toast && toast(`Moved to ${nextZone.split(" ")[0]}`, { icon: "📍" }); }}
            style={{ marginTop: 10, width: "100%", padding: "8px", background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            ⟫ Move to {nextZone}
          </button>
        )}
      </div>

      {/* Frost warning */}
      {hasFrostWarning && (
        <div style={{ background: "#e8f0ff", borderRadius: 10, padding: "8px 12px", fontSize: 13, color: "#3a5aaa", marginBottom: 12 }}>
          ❄️ Harvest may conflict with fall frost ({formatDate(frostDates.firstFall)})
        </div>
      )}

      {/* About */}
      {plant.about && (
        <div style={{ background: "#f5f5f3", borderRadius: 12, padding: 14, fontSize: 14, color: "#555", lineHeight: 1.5, marginBottom: 14 }}>
          {plant.about}
        </div>
      )}
      {plant.notes && <div style={{ fontSize: 13, color: "#666", marginBottom: 14, lineHeight: 1.4 }}>{plant.notes}</div>}

      {/* Companions */}
      <button onClick={() => setShowCompanions(v => !v)}
        style={{ width: "100%", background: "#f5f5f3", border: "none", borderRadius: 12, padding: "12px 14px", cursor: "pointer", fontSize: 14, fontWeight: 600, textAlign: "left", marginBottom: showCompanions ? 0 : 14, display: "flex", justifyContent: "space-between" }}>
        <span>🌿 Companion Plants {(plant.companions?.good?.length || 0) + (plant.companions?.bad?.length || 0) > 0 ? `(${(plant.companions?.good?.length || 0) + (plant.companions?.bad?.length || 0)})` : ""}</span>
        <span style={{ color: "#888" }}>{showCompanions ? "▲" : "▼"}</span>
      </button>
      {showCompanions && (
        <div style={{ background: "#f5f5f3", borderRadius: "0 0 12px 12px", padding: "0 14px 14px", marginBottom: 14 }}>
          {["good", "bad"].map(type => (
            <div key={type} style={{ marginBottom: type === "good" ? 12 : 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: type === "good" ? "#5c3d1e" : "#c0392b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {type === "good" ? "✓ Plant with" : "✗ Avoid near"}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                {(plant.companions?.[type] || []).map(c => (
                  <span key={c} style={{ background: type === "good" ? "#f5ece0" : "#fdecea", color: type === "good" ? "#5c3d1e" : "#c0392b", fontSize: 12, padding: "3px 8px", borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {c}<button onClick={() => removeCompanion(type, c)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 13, lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
                  </span>
                ))}
                {!(plant.companions?.[type]?.length) && <span style={{ fontSize: 12, color: "#bbb" }}>None added</span>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input value={type === "good" ? newGood : newBad}
                  onChange={e => type === "good" ? setNewGood(e.target.value) : setNewBad(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCompanion(type)}
                  placeholder={type === "good" ? "Add companion..." : "Add to avoid..."}
                  style={{ flex: 1, padding: "6px 10px", border: "1px solid #ccc", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }} />
                <button onClick={() => addCompanion(type)}
                  style={{ background: type === "good" ? "#5c3d1e" : "#c0392b", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Care log button */}
      <button onClick={() => setShowCare(true)}
        className="btn-cta" style={{ width: "100%", padding: 15, background: "#a8e063", color: "#000", border: "2.5px solid #000", borderRadius: 50, cursor: "pointer", fontSize: 16, fontWeight: 800, marginBottom: 12, letterSpacing: 0.3 }}>
        + Log Care
      </button>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setShowEdit(true)}
          style={{ flex: 1, padding: "10px", background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>✏️ Edit</button>
        <button onClick={() => { onDelete(plant.id); onClose(); toast && toast("Plant removed", { type: "warning", icon: "🗑" }); }}
          style={{ flex: 1, padding: "10px", background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#c0392b" }}>🗑 Remove</button>
      </div>

      {showEdit && <EditPlantModal plant={plant} onSave={updated => { onUpdate(updated); toast && toast(`${updated.name} updated`, { icon: "✏️" }); }} onClose={() => setShowEdit(false)} />}
      {showCare && <CareLogModal plant={plant} onSave={updated => onUpdate(updated)} onClose={() => setShowCare(false)} toast={toast} />}

      {showEndModal && (
        <Modal onClose={() => setShowEndModal(false)} width={420}>
          <div style={{ textAlign: "center", paddingBottom: 8 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>{pendingStatus === "Harvested" ? "✅" : "🪦"}</div>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}>{pendingStatus === "Harvested" ? "Mark as Harvested?" : "Mark as Dead?"}</h2>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>{pendingStatus === "Harvested" ? `${plant.name} is done for this season.` : `${plant.name} didn't make it.`}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => { onUpdate({ ...plant, status: pendingStatus, harvestedAt: new Date().toISOString() }); setShowEndModal(false); onClose(); toast && toast(`${plant.name} marked as ${pendingStatus}`, { icon: pendingStatus === "Harvested" ? "✅" : "🪦" }); }}
              className="btn-cta" style={{ padding: 13, background: "#a8e063", color: "#000", border: "2px solid #000", borderRadius: 50, cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
              {pendingStatus === "Harvested" ? "✅ Confirm Harvested" : "🪦 Confirm Dead"} — Keep record
            </button>
            <button onClick={() => { onDelete(plant.id); setShowEndModal(false); onClose(); toast && toast(`${plant.name} removed`, { type: "warning", icon: "🗑" }); }}
              style={{ padding: 13, background: "#fff", color: "#c0392b", border: "1.5px solid #c0392b", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
              🗑 Remove from Garden
            </button>
            <button onClick={() => setShowEndModal(false)} style={{ padding: 11, background: "none", color: "#888", border: "none", cursor: "pointer", fontSize: 14 }}>Cancel</button>
          </div>
        </Modal>
      )}
    </Modal>
  );
}

// ─── Plant Grid Card (minimal dashboard card) ─────────────────────────────────
function PlantGridCard({ plant, onTap }) {
  const harvestDate = calcHarvestDate(plant.dateStarted, plant.dtm);
  const daysLeft = harvestDate ? daysUntil(harvestDate) : null;
  const isDone = plant.status === "Harvested" || plant.status === "Dead";
  const imageUrl = plant.imageUrl || getAutoIcon(plant.name)?.url || null;
  const statusObj = STATUSES.find(s => s.label === plant.status) || STATUSES[0];

  return (
    <button onClick={onTap} className="plant-card" style={{ background: "#fff", border: "2px solid #000", borderRadius: 16, padding: 12, cursor: "pointer", textAlign: "left", width: "100%", opacity: isDone ? 0.5 : 1, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 0 }}>

      {/* Row 1 — Harvest info + menu button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#000" }}>
            {daysLeft !== null ? (daysLeft <= 0 ? "🎉 Ready!" : "Harvest in:") : "Started:"}
          </div>
          <div style={{ fontSize: 12, color: daysLeft !== null && daysLeft <= 14 ? "#c0392b" : "#888", fontWeight: 500 }}>
            {daysLeft !== null
              ? (daysLeft <= 0 ? "Harvest now" : `${daysLeft} days · ${formatDate(harvestDate)}`)
              : (plant.dateStarted ? formatDate(plant.dateStarted) : plant.status)}
          </div>
        </div>
        <div style={{ width: 32, height: 32, border: "1.5px solid #e0e0e0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#888", flexShrink: 0 }}>⋯</div>
      </div>

      {/* Row 2 — Pixel art image centered */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 80, marginBottom: 10 }}>
        {imageUrl
          ? <img src={imageUrl} alt={plant.name} style={{ width: 70, height: 70, objectFit: "contain", imageRendering: "pixelated" }} />
          : <span style={{ fontSize: 52 }}>{statusObj.icon}</span>
        }
      </div>

      {/* Row 3 — Status icon + plant name */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
        <span style={{ fontSize: 14 }}>{statusObj.icon}</span>
        <span style={{ fontWeight: 800, fontSize: 15, color: "#000", lineHeight: 1.2 }}>{plant.name}</span>
      </div>

      {/* Row 4 — Variety */}
      {plant.variety && <div style={{ fontSize: 12, color: "#666" }}>({plant.variety})</div>}
    </button>
  );
}

// ─── Plant List Card (compact list view) ──────────────────────────────────────
function PlantListCard({ plant, onTap }) {
  const harvestDate = calcHarvestDate(plant.dateStarted, plant.dtm);
  const daysLeft = harvestDate ? daysUntil(harvestDate) : null;
  const statusObj = STATUSES.find(s => s.label === plant.status) || STATUSES[0];
  const isDone = plant.status === "Harvested" || plant.status === "Dead";

  return (
    <button onClick={onTap} className="plant-card" style={{ background: "#fff", border: "2px solid #000", borderRadius: 14, padding: "12px 14px", cursor: "pointer", textAlign: "left", width: "100%", display: "flex", alignItems: "center", gap: 12, marginBottom: 8, opacity: isDone ? 0.5 : 1 }}>
      <div style={{ width: 48, height: 48, background: "#f5f5f3", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
        {plant.imageUrl || getAutoIcon(plant.name)
          ? <img src={plant.imageUrl || getAutoIcon(plant.name)?.url} alt={plant.name} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
          : <span style={{ fontSize: 24 }}>{statusObj.icon}</span>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{plant.name}</div>
        {plant.variety && <div style={{ fontSize: 12, color: "#888" }}>{plant.variety}</div>}
        {daysLeft !== null && (
          <div style={{ fontSize: 12, color: daysLeft <= 0 ? "#2d8a3f" : daysLeft <= 14 ? "#c0392b" : "#888", marginTop: 2, fontWeight: 600 }}>
            {daysLeft <= 0 ? "🎉 Ready!" : `${daysLeft}d to harvest`}
          </div>
        )}
      </div>
      <span style={{ fontSize: 12, color: "#888" }}>›</span>
    </button>
  );
}

function GardenTab({ plants, frostDates, onUpdate, onDelete, search, setSearch, filterZone, setFilterZone, filterStatus, setFilterStatus, onAddPlant, toast }) {
  const [viewMode, setViewMode] = useState("grid");
  const [selectedPlant, setSelectedPlant] = useState(null);

  const filtered = plants.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.variety || "").toLowerCase().includes(q) || (p.notes || "").toLowerCase().includes(q);
    const matchZone = !filterZone || p.zone === filterZone;
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchZone && matchStatus;
  });

  return (
    <div>
      {/* Search row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input placeholder="Search plants..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 0, padding: "10px 14px", border: "2px solid #000", borderRadius: 50, fontSize: 14, fontFamily: "inherit", background: "#fff" }} />
        {/* Grid/List toggle */}
        <div style={{ display: "flex", border: "2px solid #000", borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
          <button onClick={() => setViewMode("grid")} style={{ padding: "8px 12px", border: "none", background: viewMode === "grid" ? "#000" : "#fff", color: viewMode === "grid" ? "#fff" : "#000", cursor: "pointer", fontSize: 14 }}>⊞</button>
          <button onClick={() => setViewMode("list")} style={{ padding: "8px 12px", border: "none", background: viewMode === "list" ? "#000" : "#fff", color: viewMode === "list" ? "#fff" : "#000", cursor: "pointer", fontSize: 14 }}>☰</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...sel, flex: 1, borderRadius: 50, border: "2px solid #000" }}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
        </select>
        <select value={filterZone} onChange={e => setFilterZone(e.target.value)} style={{ ...sel, flex: 1, borderRadius: 50, border: "2px solid #000" }}>
          <option value="">All Zones</option>
          {ZONES.map(z => <option key={z} value={z}>{z.replace(" Grow Station", "").replace("In-Ground Beds", "In-Ground")}</option>)}
        </select>
      </div>

      {(search || filterZone || filterStatus) && (
        <button onClick={() => { setSearch(""); setFilterZone(""); setFilterStatus(""); }}
          style={{ background: "#f0f0f0", border: "none", borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontSize: 13, marginBottom: 14 }}>× Clear</button>
      )}

      {/* Zone sections */}
      {ZONES.map(zone => {
        const zonePlants = filtered.filter(p => p.zone === zone);
        if (filterZone && filterZone !== zone) return null;
        return (
          <div key={zone} style={{ marginBottom: 28 }}>
            {/* Zone header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: -0.5, lineHeight: 1 }}>
                  {zone.replace(" Grow Station", "").replace("In-Ground Beds", "In-Ground")}
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{zonePlants.length} plant{zonePlants.length !== 1 ? "s" : ""}</div>
              </div>
              <button onClick={onAddPlant}
                className="btn-cta" style={{ background: "#a8e063", color: "#000", border: "2.5px solid #000", borderRadius: 50, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>
                + Add Plant
              </button>
            </div>

            {/* Plants */}
            {zonePlants.length === 0 ? (
              <button onClick={onAddPlant} className="add-zone-btn" style={{ width: "100%", border: "2px dashed #ccc", borderRadius: 14, padding: 20, textAlign: "center", color: "#aaa", fontSize: 14, background: "none", cursor: "pointer" }}>
                + Add Plant
              </button>
            ) : viewMode === "grid" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {zonePlants.map(p => <PlantGridCard key={p.id} plant={p} onTap={() => setSelectedPlant(p)} />)}
              </div>
            ) : (
              <div>
                {zonePlants.map(p => <PlantListCard key={p.id} plant={p} onTap={() => setSelectedPlant(p)} />)}
              </div>
            )}
          </div>
        );
      })}

      {/* Plant detail sheet */}
      {selectedPlant && (
        <PlantDetailSheet
          plant={plants.find(p => p.id === selectedPlant.id) || selectedPlant}
          frostDates={frostDates}
          onUpdate={updated => { onUpdate(updated); setSelectedPlant(updated); }}
          onDelete={id => { onDelete(id); setSelectedPlant(null); }}
          onClose={() => setSelectedPlant(null)}
          toast={toast}
        />
      )}
    </div>
  );
}


function CalendarTab({ plants }) {
  const currentMonth = new Date().getMonth();

  // Get unique plant names from user's garden and match to CALENDAR_DATA
  const myPlantNames = [...new Set(plants.map(p => p.name))];

  // Build calendar rows: use CALENDAR_DATA if match exists, otherwise build basic row from plant data
  const calendarRows = myPlantNames.map(name => {
    const calEntry = CALENDAR_DATA.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (calEntry) return { ...calEntry, variety: plants.find(p => p.name === name)?.variety };
    // For plants not in CALENDAR_DATA, derive basic timing from dateStarted
    const plant = plants.find(p => p.name === name);
    const startedMonth = plant?.dateStarted ? new Date(plant.dateStarted).getMonth() + 1 : null;
    return {
      name,
      variety: plant?.variety,
      type: "My Plant",
      indoors: startedMonth ? [startedMonth] : [],
      transplant: [],
      direct: [],
      custom: true,
      dateStarted: plant?.dateStarted,
    };
  });

  if (calendarRows.length === 0) {
    return (
      <div>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>Seasonal Planting Calendar</h2>
        <p style={{ color: "#888", marginBottom: 20, fontSize: 14 }}>Shows timing for plants you've started.</p>
        <div style={{ border: "1.5px dashed #ddd", borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <div style={{ color: "#888", fontSize: 15 }}>No plants added yet.</div>
          <div style={{ color: "#bbb", fontSize: 14, marginTop: 4 }}>Add plants in My Garden and they'll appear here.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>Seasonal Planting Calendar</h2>
      <p style={{ color: "#888", marginBottom: 16, fontSize: 14 }}>Based on your {calendarRows.length} plant{calendarRows.length !== 1 ? "s" : ""}. I = Start Indoors · T = Transplant · D = Direct Sow · ★ = Your start date</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { label: "Start Indoors", color: "#e8e4f8", text: "#5a4aaa" },
          { label: "Transplant", color: "#f5ece0", text: "#5c3d1e" },
          { label: "Direct Sow", color: "#fef3c7", text: "#92400e" },
          { label: "Your start", color: "#fff3cd", text: "#856404" },
        ].map(b => (
          <span key={b.label} style={{ background: b.color, color: b.text, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>{b.label}</span>
        ))}
      </div>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
          <thead>
            <tr style={{ background: "#f8f8f8" }}>
              <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, width: 150, borderBottom: "1px solid #eee", position: "sticky", left: 0, background: "#f8f8f8", zIndex: 2 }}>Plant</th>
              {MONTHS.map((m, i) => (
                <th key={m} style={{ textAlign: "center", padding: "10px 4px", fontWeight: 600, width: 44, borderBottom: "1px solid #eee", color: i === currentMonth ? "#5c3d1e" : "#555", background: i === currentMonth ? "#fdf6ee" : "#f8f8f8", fontSize: 12 }}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendarRows.map((plant, i) => {
              const startedMonth = plant.dateStarted ? new Date(plant.dateStarted).getMonth() + 1 : null;
              return (
                <tr key={plant.name + i} style={{ background: i % 2 === 0 ? "#fff" : "#fafaf8" }}>
                  <td style={{ padding: "8px 14px", fontWeight: 600, fontSize: 13, position: "sticky", left: 0, background: i % 2 === 0 ? "#fff" : "#fafaf8", zIndex: 1, borderRight: "1px solid #f0f0f0" }}>
                    <div>{plant.name}</div>
                    {plant.variety && <div style={{ fontWeight: 400, color: "#888", fontSize: 12 }}>{plant.variety}</div>}
                  </td>
                  {MONTHS.map((m, mi) => {
                    const mo = mi + 1;
                    const isStarted = startedMonth === mo;
                    const isI = !plant.custom && plant.indoors.includes(mo);
                    const isT = !plant.custom && plant.transplant.includes(mo);
                    const isD = !plant.custom && plant.direct.includes(mo);
                    const isCurrent = mi === currentMonth;
                    let bg = "transparent", color = "transparent", label = "";
                    if (isStarted) { bg = "#fff3cd"; color = "#856404"; label = "★"; }
                    else if (isI) { bg = "#e8e4f8"; color = "#5a4aaa"; label = "I"; }
                    else if (isT) { bg = "#f5ece0"; color = "#5c3d1e"; label = "T"; }
                    else if (isD) { bg = "#fef3c7"; color = "#92400e"; label = "D"; }
                    return (
                      <td key={m} style={{ textAlign: "center", padding: "4px 2px", background: isCurrent ? "#f8fff8" : "transparent" }}>
                        {label && <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: bg, color, fontWeight: 700, fontSize: 12, width: 26, height: 26, borderRadius: 6 }}>{label}</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SuccessionTab({ plants }) {
  const [plans, setPlans] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ plant: "", dtm: "", batches: 3, intervalWeeks: 2, startDate: new Date().toISOString().split("T")[0] });

  useEffect(() => {
    loadData("succession_plans").then(d => { if (d) setPlans(d); });
  }, []);

  async function savePlans(p) { setPlans(p); await saveData("succession_plans", p); }

  function addPlan() {
    if (!form.plant) return;
    const batches = [];
    for (let i = 0; i < parseInt(form.batches); i++) {
      const sowDate = new Date(form.startDate);
      sowDate.setDate(sowDate.getDate() + i * (parseInt(form.intervalWeeks) * 7));
      const harvestDate = new Date(sowDate);
      harvestDate.setDate(harvestDate.getDate() + parseInt(form.dtm || 60));
      batches.push({ sow: sowDate.toISOString().split("T")[0], harvest: harvestDate.toISOString().split("T")[0] });
    }
    const plan = { id: generateId(), plant: form.plant, dtm: form.dtm, intervalWeeks: form.intervalWeeks, batches };
    savePlans([...plans, plan]);
    setShowAdd(false);
    setForm({ plant: "", dtm: "", batches: 3, intervalWeeks: 2, startDate: new Date().toISOString().split("T")[0] });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800 }}>Succession Planner</h2>
          <p style={{ color: "#888", margin: 0, fontSize: 14 }}>Space out sowings to get continuous harvests all season.</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding: "10px 20px", background: "#5c3d1e", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>+ Add Plan</button>
      </div>

      {showAdd && (
        <div style={{ background: "#fdf6ee", borderRadius: 14, padding: 20, marginBottom: 24, border: "1px solid #ddeedd" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 17 }}>New Succession Plan</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={lbl}>Plant Name</label>
              <input value={form.plant} onChange={e => setForm(f => ({ ...f, plant: e.target.value }))} placeholder="e.g. Lettuce" style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            <div><label style={lbl}>Days to Maturity</label>
              <input type="number" value={form.dtm} onChange={e => setForm(f => ({ ...f, dtm: e.target.value }))} placeholder="e.g. 45" style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            <div><label style={lbl}>First Sow Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div><label style={lbl}>Number of Batches</label>
              <input type="number" value={form.batches} onChange={e => setForm(f => ({ ...f, batches: e.target.value }))} min={2} max={8} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            <div><label style={lbl}>Interval (weeks)</label>
              <input type="number" value={form.intervalWeeks} onChange={e => setForm(f => ({ ...f, intervalWeeks: e.target.value }))} min={1} max={8} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={addPlan} style={{ padding: "10px 20px", background: "#5c3d1e", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Create Plan</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: "10px 20px", border: "1.5px solid #ccc", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 14 }}>Cancel</button>
          </div>
        </div>
      )}

      {plans.length === 0 && !showAdd ? (
        <div style={{ border: "1.5px dashed #ddd", borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔄</div>
          <div style={{ color: "#888", fontSize: 15, marginBottom: 4 }}>No succession plans yet.</div>
          <div style={{ color: "#bbb", fontSize: 14 }}>Add a plan to stagger your plantings for continuous harvest.</div>
        </div>
      ) : (
        plans.map(plan => (
          <div key={plan.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8", padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 17 }}>{plan.plant}</span>
                <span style={{ color: "#888", fontSize: 13, marginLeft: 10 }}>Every {plan.intervalWeeks} week{plan.intervalWeeks > 1 ? "s" : ""} · {plan.dtm || "?"} DTM</span>
              </div>
              <button onClick={() => savePlans(plans.filter(p => p.id !== plan.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 20 }}>×</button>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {plan.batches.map((batch, i) => (
                <div key={i} style={{ background: "#fdf6ee", border: "1px solid #ddeedd", borderRadius: 10, padding: "10px 14px", minWidth: 120 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#5a8a6a", marginBottom: 4 }}>BATCH {i + 1}</div>
                  <div style={{ fontSize: 13 }}>🌱 Sow: {formatDate(batch.sow)}</div>
                  <div style={{ fontSize: 13 }}>🧺 Harvest: {formatDate(batch.harvest)}</div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function MyDBTab({ userDB, onSaveUserDB, onAddToGarden }) {
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  function deleteEntry(name) {
    onSaveUserDB(userDB.filter(e => e.name !== name));
  }

  const filtered = userDB.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.about || "").toLowerCase().includes(q);
    const matchType = !filterType
      || (filterType === "custom" && !p.seeded)
      || (filterType === "built-in" && p.seeded)
      || (filterType === "Low" && p.water === "Low")
      || (filterType === "Full Sun" && p.sun === "Full Sun")
      || (filterType === "Partial Shade" && p.sun === "Partial Shade");
    return matchSearch && matchType;
  });

  return (
    <div>
      <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>My Plant Database</h2>
      <p style={{ color: "#888", marginBottom: 16, fontSize: 14 }}>Your full reference library. Starts with 30 common plants — grows automatically as you add new ones. Edit any entry to personalize it.</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <input placeholder="Search by name or description..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 2, minWidth: 180, padding: "9px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, fontFamily: "inherit" }} />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...sel, flex: 1, minWidth: 140 }}>
          <option value="">All Plants</option>
          <option value="custom">Custom only</option>
          <option value="built-in">Built-in only</option>
          <option value="Low">💧 Low water</option>
          <option value="Full Sun">☀️ Full Sun</option>
          <option value="Partial Shade">🌤 Partial Shade</option>
        </select>
        {(search || filterType) && (
          <button onClick={() => { setSearch(""); setFilterType(""); }} style={{ padding: "9px 14px", background: "#f0f0f0", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13 }}>× Clear</button>
        )}
      </div>

      {userDB.length === 0 ? (
        <div style={{ border: "1.5px dashed #ddd", borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
          <div style={{ color: "#888", fontSize: 15 }}>Database is empty.</div>
          <div style={{ color: "#bbb", fontSize: 14, marginTop: 4 }}>Add a plant to get started.</div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 12, fontSize: 13, color: "#5a8a6a", background: "#f5ece0", padding: "8px 14px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>📚 {filtered.length} of {userDB.length} plants</span>
            <span style={{ color: "#888", fontSize: 12 }}>{userDB.filter(p => !p.seeded).length} custom · {userDB.filter(p => p.seeded).length} built-in</span>
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "#bbb", padding: "32px 0", fontSize: 14 }}>No plants match your search.</div>
          )}
          {filtered.map((entry) => (
            <div key={entry.name} style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: 16, marginBottom: 10 }}>
              {editing === entry.name ? (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div><label style={lbl}>DTM (days)</label>
                      <input type="number" value={entry.dtm || ""} onChange={e => onSaveUserDB(userDB.map(p => p.name === entry.name ? { ...p, dtm: e.target.value } : p))}
                        style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
                    </div>
                    <div><label style={lbl}>💧 Water</label>
                      <select value={entry.water || ""} onChange={e => onSaveUserDB(userDB.map(p => p.name === entry.name ? { ...p, water: e.target.value } : p))} style={sel}>
                        <option value="">Select...</option>
                        {["Low","Moderate","Regular","High"].map(v => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                    <div><label style={lbl}>☀️ Sun</label>
                      <select value={entry.sun || ""} onChange={e => onSaveUserDB(userDB.map(p => p.name === entry.name ? { ...p, sun: e.target.value } : p))} style={sel}>
                        <option value="">Select...</option>
                        {["Full Sun","Partial Shade","Full Shade"].map(v => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: "span 2" }}><label style={lbl}>About</label>
                      <textarea value={entry.about || ""} onChange={e => onSaveUserDB(userDB.map(p => p.name === entry.name ? { ...p, about: e.target.value } : p))}
                        style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", minHeight: 60, resize: "vertical" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setEditing(null)} style={{ padding: "7px 16px", background: "#5c3d1e", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Done</button>
                    <button onClick={() => setEditing(null)} style={{ padding: "7px 16px", border: "1px solid #ccc", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                      {entry.name}
                      {entry.seeded && <span style={{ fontSize: 11, background: "#e8e8e8", color: "#666", padding: "2px 7px", borderRadius: 10, fontWeight: 500 }}>built-in</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {entry.dtm && <span style={{ fontSize: 12, color: "#5a8a6a", background: "#f5ece0", padding: "2px 8px", borderRadius: 10 }}>📅 {entry.dtm} DTM</span>}
                      {entry.water && <span style={{ fontSize: 12, color: "#3a6aaa", background: "#e4eef8", padding: "2px 8px", borderRadius: 10 }}>💧 {entry.water}</span>}
                      {entry.sun && <span style={{ fontSize: 12, color: "#8a6a00", background: "#faf0d0", padding: "2px 8px", borderRadius: 10 }}>☀️ {entry.sun}</span>}
                    </div>
                    {entry.about && <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>{entry.about}</div>}
                    {entry.addedAt && <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>Added {formatDate(entry.addedAt)}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginLeft: 12, flexShrink: 0 }}>
                    <button onClick={() => onAddToGarden(entry)}
                      style={{ background: "#5c3d1e", color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>+ Add</button>
                    <button onClick={() => setEditing(entry.name)} style={{ background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 13 }}>✏️</button>
                    <button onClick={() => deleteEntry(entry.name)} style={{ background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 13, color: "#c0392b" }}>🗑</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ─── Seed Library ─────────────────────────────────────────────────────────────
const SEED_SOURCES = ["Purchased", "Saved", "Traded", "Gift", "Other"];
const SEED_FIELDS = [
  { key: "name", label: "Plant Name", type: "text" },
  { key: "variety", label: "Variety", type: "text" },
  { key: "brand", label: "Brand / Source", type: "text" },
  { key: "year", label: "Packet Year", type: "number" },
  { key: "dtm", label: "Days to Maturity", type: "number" },
  { key: "depth", label: "Planting Depth", type: "text" },
  { key: "spacing", label: "Spacing", type: "text" },
  { key: "sun", label: "Sun", type: "select", options: ["Full Sun", "Partial Shade", "Full Shade"] },
  { key: "water", label: "Water", type: "select", options: ["Low", "Moderate", "Regular", "High"] },
  { key: "startIndoors", label: "Start Indoors (wks before frost)", type: "number" },
  { key: "germDays", label: "Germination (days)", type: "text" },
  { key: "quantity", label: "Seeds Remaining", type: "text" },
  { key: "source", label: "How I got them", type: "select", options: SEED_SOURCES },
  { key: "notes", label: "Notes", type: "textarea" },
];

function SeedLibraryTab({ seeds, onSaveSeeds, onAddToGarden }) {
  const [view, setView] = useState("library"); // library | scan | edit
  const [editingSeed, setEditingSeed] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scannedData, setScannedData] = useState(null);
  const [debugText, setDebugText] = useState("");
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState("");
  const [frontImg, setFrontImg] = useState(null);
  const [backImg, setBackImg] = useState(null);
  const frontRef = useRef();
  const backRef = useRef();

  const filtered = seeds.filter(s => {
    const q = search.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.variety?.toLowerCase().includes(q) || s.brand?.toLowerCase().includes(q);
  });

  // Convert file to base64
  async function fileToBase64(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result.split(",")[1]);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }

  async function handleScan() {
    if (!frontImg && !backImg) { setScanError("Please add at least one photo."); return; }
    setScanning(true);
    setScanError("");
    try {
      const content = [];
      if (frontImg) {
        const b64 = await fileToBase64(frontImg);
        content.push({ type: "image", source: { type: "base64", media_type: frontImg.type, data: b64 } });
        content.push({ type: "text", text: "This is the FRONT of a seed packet." });
      }
      if (backImg) {
        const b64 = await fileToBase64(backImg);
        content.push({ type: "image", source: { type: "base64", media_type: backImg.type, data: b64 } });
        content.push({ type: "text", text: "This is the BACK of a seed packet." });
      }
      content.push({ type: "text", text: `Extract all information from this seed packet and return ONLY a JSON object with these fields (use null for anything not found):
{
  "name": "plant common name",
  "variety": "variety name",
  "brand": "brand or company name",
  "year": "packet year as number or null",
  "dtm": "days to maturity as number or null",
  "depth": "planting depth e.g. 1/4 inch",
  "spacing": "spacing e.g. 12 inches apart",
  "sun": "Full Sun or Partial Shade or Full Shade",
  "water": "Low or Moderate or Regular or High",
  "startIndoors": "weeks before last frost as number or null",
  "germDays": "germination days range e.g. 7-14",
  "about": "1-2 sentence description from packet",
  "notes": "any other useful info from the packet"
}
Return ONLY the JSON, no other text.` });

      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("No API key configured.");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content }],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      setDebugText(text); // show raw response for debugging
      const clean = text.replace(/```json|```/g, "").trim();
      let parsed;
      try {
        parsed = JSON.parse(clean);
      } catch (parseErr) {
        // Try to extract JSON from the text if it's wrapped in other content
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error(`Couldn't parse response. Raw text: ${text.slice(0, 200)}`);
        }
      }
      const seedData = { ...parsed, id: generateId(), addedAt: new Date().toISOString(), started: false };
      setScannedData(seedData);
      setEditForm(seedData);
      setView("edit");
    } catch (err) {
      setScanError(`Scan failed: ${err.message || "Unknown error"}`);
    } finally {
      setScanning(false);
    }
  }

  function handleSave(seed) {
    if (editingSeed?.id) {
      onSaveSeeds(seeds.map(s => s.id === seed.id ? seed : s));
    } else {
      onSaveSeeds([...seeds, { ...seed, id: seed.id || generateId(), addedAt: seed.addedAt || new Date().toISOString() }]);
    }
    setEditingSeed(null);
    setScannedData(null);
    setFrontImg(null);
    setBackImg(null);
    setView("library");
  }

  function handleDelete(id) {
    onSaveSeeds(seeds.filter(s => s.id !== id));
  }

  function handleMarkStarted(seed) {
    onSaveSeeds(seeds.map(s => s.id === seed.id ? { ...s, started: !s.started } : s));
  }

  // ── Scan view ──
  if (view === "scan") {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <button onClick={() => { setView("library"); setFrontImg(null); setBackImg(null); setScanError(""); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#666" }}>←</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Scan Seed Packet</h2>
        </div>

        <div style={{ background: "#fdf6ee", border: "1px solid #d4a96a", borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
            📸 Take or upload a photo of the <strong>front and back</strong> of your seed packet. Claude will read the text and fill in the details automatically. No photos are stored.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Front of packet", key: "front", ref: frontRef, img: frontImg, set: setFrontImg },
            { label: "Back of packet", key: "back", ref: backRef, img: backImg, set: setBackImg },
          ].map(side => (
            <div key={side.key}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#444" }}>{side.label}</div>
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px dashed ${side.img ? "#5c3d1e" : "#ccc"}`, borderRadius: 12, padding: 20, cursor: "pointer", background: side.img ? "#fdf6ee" : "#fafaf8", minHeight: 100, textAlign: "center", gap: 6 }}>
                {side.img ? (
                  <>
                    <div style={{ fontSize: 28 }}>✓</div>
                    <div style={{ fontSize: 12, color: "#5c3d1e", fontWeight: 600 }}>{side.img.name}</div>
                    <div style={{ fontSize: 11, color: "#888" }}>Tap to change</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 28 }}>📷</div>
                    <div style={{ fontSize: 12, color: "#888" }}>Tap to add photo</div>
                  </>
                )}
                <input ref={side.ref} type="file" accept="image/*" capture="environment"
                  onChange={e => side.set(e.target.files[0] || null)} style={{ display: "none" }} />
              </label>
            </div>
          ))}
        </div>

        {scanError && <div style={{ background: "#fdecea", color: "#c0392b", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 12 }}>⚠️ {scanError}</div>}

        {debugText && !scanError && (
          <div style={{ background: "#f5f5f0", borderRadius: 10, padding: "10px 14px", fontSize: 11, color: "#666", marginBottom: 12, wordBreak: "break-all", maxHeight: 120, overflowY: "auto" }}>
            <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 12 }}>Raw API response (debug):</div>
            {debugText}
          </div>
        )}

        <button onClick={handleScan} disabled={scanning}
          style={{ width: "100%", padding: 14, background: scanning ? "#aaa" : "#5c3d1e", color: "#fff", border: "none", borderRadius: 12, cursor: scanning ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
          {scanning ? "📖 Reading packet..." : "✨ Scan & Extract Info"}
        </button>
        <button onClick={() => { const blank = { id: generateId(), addedAt: new Date().toISOString() }; setScannedData(blank); setEditForm(blank); setView("edit"); }}
          style={{ width: "100%", padding: 12, background: "#fff", color: "#555", border: "1.5px solid #ddd", borderRadius: 12, cursor: "pointer", fontSize: 14 }}>
          Enter manually instead
        </button>
      </div>
    );
  }

  // ── Edit / Review view ──
  if (view === "edit") {
    const form = editForm;
    const setForm = setEditForm;

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button onClick={() => { setView(scannedData ? "scan" : "library"); setEditingSeed(null); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#666" }}>←</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{editingSeed ? "Edit Seed" : scannedData ? "Review & Save" : "Add Seed"}</h2>
        </div>

        {scannedData && !editingSeed && (
          <div style={{ background: "#fdf6ee", border: "1px solid #d4a96a", borderRadius: 10, padding: "8px 14px", marginBottom: 16, fontSize: 13, color: "#5c3d1e" }}>
            ✨ Claude extracted this info from your packet. Review and edit anything that looks off, then save.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
          {SEED_FIELDS.map(field => (
            <div key={field.key} style={{ gridColumn: field.type === "textarea" ? "1 / -1" : undefined }}>
              <label style={lbl}>{field.label}</label>
              {field.type === "select" ? (
                <select value={form[field.key] || ""} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} style={sel}>
                  <option value="">Select...</option>
                  {field.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : field.type === "textarea" ? (
                <textarea value={form[field.key] || ""} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", minHeight: 70, resize: "vertical" }} />
              ) : (
                <input type={field.type} value={form[field.key] || ""} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
              )}
            </div>
          ))}
          {/* About field */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={lbl}>About (from packet)</label>
            <textarea value={form.about || ""} onChange={e => setForm(f => ({ ...f, about: e.target.value }))}
              style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", minHeight: 70, resize: "vertical" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => handleSave(form)}
            style={{ flex: 1, padding: 13, background: "#5c3d1e", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
            💾 Save to Seed Library
          </button>
          <button onClick={() => { setView("library"); setEditingSeed(null); setScannedData(null); }}
            style={{ padding: "13px 18px", background: "#fff", color: "#555", border: "1.5px solid #ddd", borderRadius: 12, cursor: "pointer", fontSize: 14 }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Library view ──
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>Seed Library</h2>
          <p style={{ color: "#888", margin: 0, fontSize: 14 }}>{seeds.length} packet{seeds.length !== 1 ? "s" : ""} in your collection.</p>
        </div>
        <button onClick={() => { setScanError(""); setFrontImg(null); setBackImg(null); setView("scan"); }}
          style={{ background: "#5c3d1e", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          📷 Scan Packet
        </button>
      </div>

      <input placeholder="Search seeds..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 14 }} />

      {seeds.length === 0 ? (
        <div style={{ border: "1.5px dashed #ddd", borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌰</div>
          <div style={{ color: "#888", fontSize: 15, marginBottom: 4 }}>Your seed library is empty.</div>
          <div style={{ color: "#bbb", fontSize: 14 }}>Scan your first seed packet to get started.</div>
        </div>
      ) : (
        <>
          {filtered.length === 0 && <div style={{ textAlign: "center", color: "#bbb", padding: "24px 0", fontSize: 14 }}>No seeds match your search.</div>}
          {filtered.map(seed => (
            <div key={seed.id} style={{ background: "#fff", border: `1px solid ${seed.started ? "#d4a96a" : "#e8e8e8"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{seed.name || "Unnamed"}</span>
                    {seed.variety && <span style={{ color: "#888", fontSize: 13 }}>{seed.variety}</span>}
                    {seed.started && <span style={{ fontSize: 11, background: "#f5ece0", color: "#5c3d1e", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>✓ Started</span>}
                    {seed.year && <span style={{ fontSize: 11, background: "#f0f0f0", color: "#666", padding: "2px 7px", borderRadius: 10 }}>{seed.year}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: seed.about ? 6 : 0 }}>
                    {seed.brand && <span style={{ fontSize: 12, color: "#888" }}>🏷 {seed.brand}</span>}
                    {seed.dtm && <span style={{ fontSize: 12, color: "#5a8a6a", background: "#f5ece0", padding: "2px 7px", borderRadius: 10 }}>📅 {seed.dtm} DTM</span>}
                    {seed.sun && <span style={{ fontSize: 12, color: "#8a7a2a", background: "#faf5e0", padding: "2px 7px", borderRadius: 10 }}>☀️ {seed.sun}</span>}
                    {seed.water && <span style={{ fontSize: 12, color: "#3a6aaa", background: "#e4eef8", padding: "2px 7px", borderRadius: 10 }}>💧 {seed.water}</span>}
                    {seed.quantity && <span style={{ fontSize: 12, color: "#888" }}>🌰 {seed.quantity} seeds</span>}
                    {seed.source && <span style={{ fontSize: 12, color: "#888" }}>· {seed.source}</span>}
                  </div>
                  {seed.about && <div style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>{seed.about}</div>}
                  {seed.depth && <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>Depth: {seed.depth}{seed.spacing ? ` · Spacing: ${seed.spacing}` : ""}{seed.germDays ? ` · Germ: ${seed.germDays} days` : ""}</div>}
                  {seed.startIndoors && <div style={{ fontSize: 12, color: "#999" }}>Start indoors: {seed.startIndoors} wks before last frost</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                  <button onClick={() => onAddToGarden(seed)}
                    style={{ background: "#5c3d1e", color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>+ Garden</button>
                  <button onClick={() => handleMarkStarted(seed)}
                    style={{ background: seed.started ? "#f5ece0" : "#fff", color: seed.started ? "#5c3d1e" : "#555", border: "1px solid #ddd", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 11, whiteSpace: "nowrap" }}>
                    {seed.started ? "✓ Started" : "Mark started"}
                  </button>
                  <button onClick={() => { setEditingSeed(seed); setEditForm(seed); setView("edit"); }}
                    style={{ background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 13 }}>✏️</button>
                  <button onClick={() => handleDelete(seed.id)}
                    style={{ background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 13, color: "#c0392b" }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}


const ZONE_ORDER = ["Basement Grow Station", "Greenhouse", "Raised Beds", "In-Ground Beds"];

function getNextPlantSuggestions({ zone, harvestedPlant, frostDates, existingPlants }) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const firstFall = frostDates?.firstFall ? new Date(frostDates.firstFall) : null;
  const weeksToFrost = firstFall ? Math.floor((firstFall - today) / (1000 * 60 * 60 * 24 * 7)) : 99;

  // Get names already in this zone
  const inZone = existingPlants.filter(p => p.zone === zone && p.status !== "Harvesting").map(p => p.name);
  // Get bad companions of those plants
  const avoid = new Set(inZone.flatMap(n => COMPANION_DB[n]?.bad || []));
  // Get good companions of those plants
  const prefer = new Set(inZone.flatMap(n => COMPANION_DB[n]?.good || []));

  return CALENDAR_DATA
    .filter(p => {
      // Must be plantable this month or next in this zone
      const isOutdoorZone = zone === "Raised Beds" || zone === "In-Ground Beds";
      const isIndoorZone = zone === "Basement Grow Station" || zone === "Greenhouse";
      const plantableMonths = isOutdoorZone
        ? [...p.transplant, ...p.direct]
        : isIndoorZone
        ? p.indoors
        : [...p.indoors, ...p.transplant];
      const soonEnough = plantableMonths.includes(currentMonth) || plantableMonths.includes(currentMonth + 1);
      // Must have enough time before frost
      const dbEntry = PLANT_DB.find(d => d.name === p.name);
      const dtm = dbEntry?.dtm || 60;
      const enoughTime = weeksToFrost * 7 > dtm * 0.7;
      // Not already in this zone
      const notAlreadyGrowing = !inZone.includes(p.name);
      // Not the same as what was just harvested
      const notSame = p.name !== harvestedPlant;
      return soonEnough && enoughTime && notAlreadyGrowing && notSame;
    })
    .map(p => ({
      ...p,
      score: (prefer.has(p.name) ? 2 : 0) - (avoid.has(p.name) ? 3 : 0),
      isGoodCompanion: prefer.has(p.name),
      isBadCompanion: avoid.has(p.name),
    }))
    .filter(p => !p.isBadCompanion)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function HarvestTab({ plants, frostDates, onUpdate }) {
  const [window_, setWindow_] = useState(14);
  const [showNextFor, setShowNextFor] = useState(null);
  const today = new Date();

  // Bucket plants
  const readyNow = plants.filter(p => {
    const h = calcHarvestDate(p.dateStarted, p.dtm);
    if (!h) return p.status === "Harvesting";
    return daysUntil(h) <= 0 && p.status !== "Dormant";
  });

  const comingSoon = plants.filter(p => {
    const h = calcHarvestDate(p.dateStarted, p.dtm);
    if (!h) return false;
    const d = daysUntil(h);
    return d > 0 && d <= window_;
  }).sort((a, b) => daysUntil(calcHarvestDate(a.dateStarted, a.dtm)) - daysUntil(calcHarvestDate(b.dateStarted, b.dtm)));

  const upcoming = plants.filter(p => {
    const h = calcHarvestDate(p.dateStarted, p.dtm);
    if (!h) return false;
    const d = daysUntil(h);
    return d > window_;
  }).sort((a, b) => daysUntil(calcHarvestDate(a.dateStarted, a.dtm)) - daysUntil(calcHarvestDate(b.dateStarted, b.dtm)));

  const harvested = plants.filter(p => p.status === "Harvesting" || p.harvestedAt);

  function markHarvested(plant) {
    onUpdate({ ...plant, status: "Harvesting", harvestedAt: new Date().toISOString() });
  }

  function HarvestCard({ plant, showMark = true }) {
    const harvestDate = calcHarvestDate(plant.dateStarted, plant.dtm);
    const daysLeft = harvestDate ? daysUntil(harvestDate) : null;
    const statusObj = STATUSES.find(s => s.label === plant.status) || STATUSES[0];
    const suggestions = showNextFor === plant.id
      ? getNextPlantSuggestions({ zone: plant.zone, harvestedPlant: plant.name, frostDates, existingPlants: plants })
      : [];

    return (
      <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16 }}>{statusObj.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{plant.name}</span>
              {plant.variety && <span style={{ color: "#888", fontSize: 13 }}>{plant.variety}</span>}
              <span style={{ fontSize: 11, background: "#f0f0f0", color: "#666", padding: "2px 7px", borderRadius: 10 }}>{plant.zone.split(" ")[0]}</span>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
              {daysLeft !== null && daysLeft > 0 && (
                <span style={{ fontSize: 13, fontWeight: 600, color: daysLeft <= 7 ? "#e67e22" : "#5c3d1e" }}>
                  🗓 {daysLeft} day{daysLeft !== 1 ? "s" : ""} away — {formatDate(harvestDate)}
                </span>
              )}
              {(daysLeft === null || daysLeft <= 0) && plant.status === "Harvesting" && (
                <span style={{ fontSize: 13, fontWeight: 600, color: "#5c3d1e" }}>🎉 In harvest</span>
              )}
              {(daysLeft !== null && daysLeft <= 0 && plant.status !== "Harvesting") && (
                <span style={{ fontSize: 13, fontWeight: 600, color: "#c0392b" }}>⚡ Ready now!</span>
              )}
              {plant.quantity && <span style={{ fontSize: 12, color: "#888" }}>Qty: {plant.quantity}</span>}
              {plant.harvestedAt && <span style={{ fontSize: 12, color: "#888" }}>Harvested {formatDate(plant.harvestedAt)}</span>}
            </div>
          </div>
          {showMark && plant.status !== "Harvesting" && (
            <button onClick={() => markHarvested(plant)}
              style={{ background: "#5c3d1e", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" }}>
              ✓ Mark Harvested
            </button>
          )}
        </div>

        {/* What to plant next */}
        <button onClick={() => setShowNextFor(showNextFor === plant.id ? null : plant.id)}
          style={{ marginTop: 10, background: "none", border: "1px solid #d4a96a", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12, color: "#5c3d1e", fontWeight: 600 }}>
          🌱 {showNextFor === plant.id ? "Hide" : "What to plant next in this space?"}
        </button>

        {showNextFor === plant.id && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
              Suggestions for <strong>{plant.zone}</strong> after {plant.name} — based on season, frost dates, and companion compatibility:
            </div>
            {suggestions.length === 0 ? (
              <div style={{ fontSize: 13, color: "#bbb", fontStyle: "italic" }}>Nothing obvious fits right now — check back as the season progresses or review the Calendar tab.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {suggestions.map(s => {
                  const dbEntry = PLANT_DB.find(d => d.name === s.name);
                  const isIndoor = plant.zone === "Basement Grow Station" || plant.zone === "Greenhouse";
                  const action = isIndoor ? "Start indoors" : s.direct.length ? "Direct sow" : "Transplant";
                  return (
                    <div key={s.name} style={{ background: s.isGoodCompanion ? "#f0faf4" : "#fafafa", border: `1px solid ${s.isGoodCompanion ? "#d4a96a" : "#eee"}`, borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</span>
                          <span style={{ fontSize: 11, background: "#e8e8e8", color: "#555", padding: "2px 7px", borderRadius: 10 }}>{s.type}</span>
                          {s.isGoodCompanion && <span style={{ fontSize: 11, background: "#d4edda", color: "#5c3d1e", padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>✓ Good companion</span>}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {dbEntry?.dtm && <span style={{ fontSize: 11, color: "#666" }}>📅 {dbEntry.dtm} DTM</span>}
                          <span style={{ fontSize: 11, background: "#e8f0f8", color: "#3a6aaa", padding: "2px 7px", borderRadius: 10 }}>{action}</span>
                        </div>
                      </div>
                      {dbEntry?.about && <div style={{ fontSize: 12, color: "#666", marginTop: 5, lineHeight: 1.4 }}>{dbEntry.about}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const noHarvestData = plants.filter(p => calcHarvestDate(p.dateStarted, p.dtm)).length === 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>Harvest</h2>
          <p style={{ color: "#888", margin: 0, fontSize: 14 }}>Track what's ready, what's coming, and what to grow next.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#888" }}>Show next</span>
          <select value={window_} onChange={e => setWindow_(Number(e.target.value))} style={{ ...sel, width: "auto", padding: "6px 10px" }}>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
      </div>

      {noHarvestData ? (
        <div style={{ border: "1.5px dashed #ddd", borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧺</div>
          <div style={{ color: "#888", fontSize: 15 }}>No harvest data yet.</div>
          <div style={{ color: "#bbb", fontSize: 14, marginTop: 4 }}>Add plants with a start date and days-to-maturity to see harvest timelines here.</div>
        </div>
      ) : (
        <>
          {/* Ready now */}
          {readyNow.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>🎉</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Ready to Harvest</h3>
                <span style={{ background: "#c0392b", color: "#fff", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{readyNow.length}</span>
              </div>
              {readyNow.map(p => <HarvestCard key={p.id} plant={p} />)}
            </div>
          )}

          {/* Coming soon */}
          {comingSoon.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>⏳</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Coming in {window_} Days</h3>
                <span style={{ background: "#e67e22", color: "#fff", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{comingSoon.length}</span>
              </div>
              {comingSoon.map(p => <HarvestCard key={p.id} plant={p} />)}
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>📆</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Further Out</h3>
              </div>
              {upcoming.map(p => <HarvestCard key={p.id} plant={p} showMark={false} />)}
            </div>
          )}

          {/* Already harvested */}
          {harvested.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>🧺</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Harvested This Season</h3>
              </div>
              {harvested.map(p => <HarvestCard key={p.id} plant={p} showMark={false} />)}
            </div>
          )}

          {readyNow.length === 0 && comingSoon.length === 0 && (
            <div style={{ background: "#fdf6ee", borderRadius: 14, padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
              <div style={{ color: "#666", fontSize: 14 }}>Nothing ready in the next {window_} days — your plants are still growing!</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── DB Search Picker ────────────────────────────────────────────────────────
function DBSearchPicker({ userDB, onSelect }) {
  const [q, setQ] = useState("");
  const results = userDB.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <input autoFocus placeholder="Search plants..." value={q} onChange={e => setQ(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #5c3d1e", borderRadius: 10, fontSize: 15, boxSizing: "border-box", fontFamily: "inherit", marginBottom: 12 }} />
      <div style={{ maxHeight: 340, overflowY: "auto" }}>
        {results.length === 0 && <div style={{ textAlign: "center", color: "#bbb", padding: "24px 0", fontSize: 14 }}>No matches.</div>}
        {results.map(p => (
          <div key={p.name} onClick={() => onSelect(p)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 10, cursor: "pointer", marginBottom: 4, background: "#fafaf8", border: "1px solid #eee" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fdf6ee"}
            onMouseLeave={e => e.currentTarget.style.background = "#fafaf8"}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                {p.dtm && <span style={{ fontSize: 11, color: "#5a8a6a" }}>📅 {p.dtm} DTM</span>}
                {p.sun && <span style={{ fontSize: 11, color: "#888" }}>☀️ {p.sun}</span>}
                {p.water && <span style={{ fontSize: 11, color: "#888" }}>💧 {p.water}</span>}
              </div>
            </div>
            <span style={{ fontSize: 18, color: "#5c3d1e" }}>→</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Seed Scan Picker (inline for Add Plant flow) ────────────────────────────
function SeedScanPicker({ onScanned }) {
  const [frontImg, setFrontImg] = useState(null);
  const [backImg, setBackImg] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  async function fileToBase64(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result.split(",")[1]);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }

  async function handleScan() {
    if (!frontImg && !backImg) { setError("Add at least one photo."); return; }
    setScanning(true); setError("");
    try {
      const content = [];
      if (frontImg) { content.push({ type: "image", source: { type: "base64", media_type: frontImg.type, data: await fileToBase64(frontImg) } }); content.push({ type: "text", text: "Front of seed packet." }); }
      if (backImg) { content.push({ type: "image", source: { type: "base64", media_type: backImg.type, data: await fileToBase64(backImg) } }); content.push({ type: "text", text: "Back of seed packet." }); }
      content.push({ type: "text", text: `Extract seed packet info. Return ONLY JSON: {"name":"","variety":"","brand":"","dtm":null,"depth":"","spacing":"","sun":"","water":"","startIndoors":null,"germDays":"","about":"","notes":""}` });
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("No API key configured.");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content }] }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const match = clean.match(/\{[\s\S]*\}/);
      onScanned(JSON.parse(match ? match[0] : clean));
    } catch (err) { setError(`Scan failed: ${err.message}`); }
    finally { setScanning(false); }
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 800 }}>📷 Scan Seed Packet</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[{ label: "Front", img: frontImg, set: setFrontImg }, { label: "Back", img: backImg, set: setBackImg }].map(side => (
          <label key={side.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px dashed ${side.img ? "#5c3d1e" : "#ccc"}`, borderRadius: 12, padding: 16, cursor: "pointer", background: side.img ? "#fdf6ee" : "#fafaf8", minHeight: 90, textAlign: "center", gap: 4 }}>
            <div style={{ fontSize: 24 }}>{side.img ? "✓" : "📷"}</div>
            <div style={{ fontSize: 12, color: side.img ? "#5c3d1e" : "#888", fontWeight: side.img ? 600 : 400 }}>{side.img ? side.img.name.slice(0, 16) : side.label}</div>
            <input type="file" accept="image/*" capture="environment" onChange={e => side.set(e.target.files[0] || null)} style={{ display: "none" }} />
          </label>
        ))}
      </div>
      {error && <div style={{ background: "#fdecea", color: "#c0392b", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 10 }}>⚠️ {error}</div>}
      <button onClick={handleScan} disabled={scanning}
        style={{ width: "100%", padding: 13, background: scanning ? "#aaa" : "#5c3d1e", color: "#fff", border: "none", borderRadius: 12, cursor: scanning ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 700 }}>
        {scanning ? "📖 Reading packet..." : "✨ Scan & Extract"}
      </button>
    </div>
  );
}

const lbl = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#444" };
const sel = { width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, background: "#fff", fontFamily: "inherit", cursor: "pointer", boxSizing: "border-box" };
const menuItem = { padding: "9px 16px", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap", onMouseEnter: () => {} };

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { toasts, toast } = useToast();

  const [plants, setPlants] = useState([]);
  const [seeds, setSeeds] = useState([]);
  const [frostDates, setFrostDates] = useState({});
  const [userDB, setUserDB] = useState([]);
  const [tab, setTab] = useState("garden");
  const [showAdd, setShowAdd] = useState(false);
  const [addFlow, setAddFlow] = useState(null); // null | "choose" | "db" | "scan" | "transplant" | "manual"
  const [prefillPlant, setPrefillPlant] = useState(null);
  const [showFrost, setShowFrost] = useState(false);
  const [search, setSearch] = useState("");
  const [filterZone, setFilterZone] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([loadData("garden_plants"), loadData("frost_dates"), loadData("user_plant_db"), loadData("seed_library")]).then(([p, f, db, sl]) => {
      if (p) setPlants(p);
      if (f) setFrostDates(f);
      if (sl) setSeeds(sl);
      if (db) {
        setUserDB(db);
      } else {
        const seeded = PLANT_DB.map(p => ({ ...p, addedAt: new Date().toISOString(), seeded: true }));
        setUserDB(seeded);
        saveData("user_plant_db", seeded);
      }
      setLoaded(true);
    });
  }, []);

  async function savePlants(p) { setPlants(p); await saveData("garden_plants", p); }
  async function saveFrost(f) { setFrostDates(f); await saveData("frost_dates", f); }
  async function saveUserDB(db) { setUserDB(db); await saveData("user_plant_db", db); }
  async function saveSeeds(s) { setSeeds(s); await saveData("seed_library", s); }

  function handleAdd(plant) {
    savePlants([...plants, plant]);
    toast(`${plant.name} added to ${plant.zone.split(" ")[0]}`, { icon: "🌱" });
  }
  function handleUpdate(updated) {
    savePlants(plants.map(p => p.id === updated.id ? updated : p));
  }
  function handleDelete(id) {
    savePlants(plants.filter(p => p.id !== id));
    toast("Plant removed", { type: "warning", icon: "🗑" });
  }
  function handleAddToGarden(entry) { setPrefillPlant(entry); setAddFlow("manual"); setShowAdd(true); }
  function handleAddSeedToGarden(seed) { setPrefillPlant({ name: seed.name, variety: seed.variety, about: seed.about, water: seed.water, sun: seed.sun, dtm: seed.dtm }); setAddFlow("manual"); setShowAdd(true); }

  function openAddFlow() { setAddFlow("choose"); setShowAdd(true); setPrefillPlant(null); }
  function closeAdd() { setShowAdd(false); setAddFlow(null); setPrefillPlant(null); }

  const [showBackup, setShowBackup] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [lastBackup, setLastBackup] = useState(() => localStorage.getItem("last_backup_at") || null);

  function handleExport() {
    const backup = { version: 1, exportedAt: new Date().toISOString(), plants, frostDates, seeds, userDB: userDB.filter(p => !p.seeded) };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dirt-rich-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    const now = new Date().toISOString();
    localStorage.setItem("last_backup_at", now);
    setLastBackup(now);
    toast("Backup downloaded", { icon: "💾" });
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImportError(""); setImportSuccess(false);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.plants || !Array.isArray(data.plants)) throw new Error("Invalid backup file.");
        await savePlants(data.plants);
        if (data.frostDates) await saveFrost(data.frostDates);
        if (data.seeds) await saveSeeds(data.seeds);
        if (data.userDB && Array.isArray(data.userDB)) {
          const seeded = PLANT_DB.map(p => ({ ...p, addedAt: new Date().toISOString(), seeded: true }));
          const merged = [...seeded, ...data.userDB.filter(p => !seeded.find(s => s.name === p.name))];
          await saveUserDB(merged);
        }
        setImportSuccess(true);
        setTimeout(() => { setShowBackup(false); setImportSuccess(false); }, 2000);
      } catch (err) { setImportError("Couldn't read that file. Make sure it's a Plant Tracker backup."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  if (!loaded) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12 }}>
      <span style={{ fontSize: 40 }}>🌿</span>
      <div style={{ color: "#888", fontSize: 15 }}>Loading your garden...</div>
    </div>
  );

  const NAV_TABS = [
    { id: "garden", label: "Garden", icon: "🌱" },
    { id: "seeds", label: "Seeds", icon: "🌰" },
    { id: "calendar", label: "Calendar", icon: "📅" },
    { id: "harvest", label: "Harvest", icon: "🧺" },
  ];

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 600, margin: "0 auto", background: "#faf6f0", minHeight: "100vh", paddingBottom: 80 }}>

      {/* ── Header ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "14px 16px 10px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontWeight: 900, fontSize: 32, letterSpacing: -1, color: "#000", lineHeight: 1 }}>Dirt Rich</div>
          <button onClick={() => setShowBackup(true)}
            className="btn-cta" style={{ background: "#a8e063", color: "#000", border: "2.5px solid #000", borderRadius: 50, padding: "8px 18px", cursor: "pointer", fontSize: 14, fontWeight: 800 }}>
            {!lastBackup || daysSince(lastBackup) >= 3 ? "⚠️ Backup" : "💾 Backup"}
          </button>
        </div>

        {/* Backup reminder banner */}
        {(!lastBackup || daysSince(lastBackup) >= 3) && plants.length > 0 && (
          <button onClick={() => setShowBackup(true)} style={{ width: "100%", background: "#fff8e1", border: "2px solid #f0a500", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginBottom: 8, textAlign: "left" }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#92400e" }}>
                {!lastBackup ? "No backup yet" : `Last backup ${daysSince(lastBackup)} days ago`}
              </div>
              <div style={{ fontSize: 11, color: "#b45309" }}>Tap to back up your {plants.length} plant{plants.length !== 1 ? "s" : ""}</div>
            </div>
          </button>
        )}

        {/* Frost date bar — always visible on Garden tab */}
        {tab === "garden" && (
          <button onClick={() => setShowFrost(true)} style={{ width: "100%", background: "#fdf6ee", border: "1px solid #d4a96a", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 10, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Last Spring Frost</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#5c3d1e" }}>{frostDates.lastSpring ? formatDate(frostDates.lastSpring) : "Tap to set"}</div>
            </div>
            <div style={{ width: 1, height: 32, background: "#d4a96a" }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>First Fall Frost</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#5c3d1e" }}>{frostDates.firstFall ? formatDate(frostDates.firstFall) : "Tap to set"}</div>
            </div>
          </button>
        )}
      </div>

      {/* ── Page content ── */}
      <div style={{ padding: "16px 14px" }}>
        {tab === "garden" && (
          <GardenTab plants={plants} frostDates={frostDates} onUpdate={handleUpdate} onDelete={handleDelete}
            search={search} setSearch={setSearch} filterZone={filterZone} setFilterZone={setFilterZone}
            filterStatus={filterStatus} setFilterStatus={setFilterStatus}
            onAddPlant={openAddFlow} userDB={userDB} onSaveUserDB={saveUserDB} toast={toast} />
        )}
        {tab === "seeds" && <SeedLibraryTab seeds={seeds} onSaveSeeds={saveSeeds} onAddToGarden={handleAddSeedToGarden} />}
        {tab === "calendar" && <CalendarTab plants={plants} />}
        {tab === "harvest" && <HarvestTab plants={plants} frostDates={frostDates} onUpdate={handleUpdate} />}
      </div>

      {/* ── Toast notifications ── */}
      <Toast toasts={toasts} />

      {/* ── Bottom nav ── */}
      <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 600, background: "#fff", borderTop: "1px solid #eee", display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {NAV_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="nav-tab" style={{ flex: 1, border: "none", background: "none", cursor: "pointer", padding: "10px 4px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? "#5c3d1e" : "#aaa", letterSpacing: 0.2 }}>{t.label}</span>
            {tab === t.id && <div style={{ width: 20, height: 2, background: "#5c3d1e", borderRadius: 2 }} />}
          </button>
        ))}
      </nav>

      {/* ── Add Plant flow ── */}
      {showAdd && addFlow === "choose" && (
        <Modal onClose={closeAdd} width={480}>
          <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}>Add a Plant</h2>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>How would you like to add it?</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { flow: "db", icon: "📖", title: "Search my database", desc: "Pick from 30+ plants, auto-fills everything" },
              { flow: "scan", icon: "📷", title: "Scan seed packet", desc: "Point camera at a packet, Claude reads it" },
              { flow: "transplant", icon: "🛒", title: "Bought as transplant", desc: "Already growing — quick add" },
              { flow: "manual", icon: "✏️", title: "Enter manually", desc: "Blank form, full control" },
            ].map(opt => (
              <button key={opt.flow} onClick={() => setAddFlow(opt.flow)}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#fafaf8", border: "1.5px solid #e8e8e8", borderRadius: 12, cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>{opt.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{opt.title}</div>
                  <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {showAdd && addFlow === "db" && (
        <Modal onClose={closeAdd} width={480}>
          <h2 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 800 }}>Search Database</h2>
          <DBSearchPicker userDB={userDB} onSelect={entry => { setPrefillPlant(entry); setAddFlow("manual"); }} onClose={closeAdd} />
        </Modal>
      )}

      {showAdd && addFlow === "scan" && (
        <Modal onClose={closeAdd} width={480}>
          <SeedScanPicker onScanned={data => {
            const seedEntry = { ...data, id: generateId(), addedAt: new Date().toISOString(), started: false, source: "Scanned" };
            saveSeeds([...seeds, seedEntry]);
            toast(`${data.name || "Packet"} saved to Seed Library`, { icon: "🌰" });
            setPrefillPlant(data);
            setAddFlow("manual");
          }} onClose={closeAdd} />
        </Modal>
      )}

      {showAdd && (addFlow === "manual" || addFlow === "transplant") && (
        <AddPlantModal onAdd={handleAdd} onClose={closeAdd} userDB={userDB} onSaveUserDB={saveUserDB}
          prefill={prefillPlant} isTransplant={addFlow === "transplant"} />
      )}

      {showFrost && <FrostModal frostDates={frostDates} onSave={f => { saveFrost(f); toast("Frost dates saved", { icon: "❄️" }); }} onClose={() => setShowFrost(false)} />}

      {showBackup && (
        <Modal onClose={() => { setShowBackup(false); setImportError(""); setImportSuccess(false); }} width={440}>
          <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>💾 Backup & Restore</h2>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>Your data lives on this device. Export to iCloud or Google Drive to keep it safe.</p>
          <div style={{ background: "#fdf6ee", border: "1px solid #d4a96a", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>📤 Export</div>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{plants.length} plant{plants.length !== 1 ? "s" : ""} · {seeds.length} seed packet{seeds.length !== 1 ? "s" : ""}</div>
            {lastBackup && <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>Last backup: {daysSince(lastBackup) === 0 ? "today" : `${daysSince(lastBackup)} day${daysSince(lastBackup) !== 1 ? "s" : ""} ago`}</div>}
            <button onClick={handleExport} style={{ width: "100%", padding: 11, background: "#5c3d1e", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Download Backup</button>
          </div>
          <div style={{ background: "#fafaf8", border: "1px solid #e8e8e8", borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>📥 Restore</div>
            <label style={{ display: "block", width: "100%", padding: 11, background: "#fff", border: "1.5px dashed #ccc", borderRadius: 10, cursor: "pointer", fontSize: 14, textAlign: "center", color: "#555", boxSizing: "border-box" }}>
              Choose Backup File
              <input type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
            </label>
            {importError && <div style={{ marginTop: 8, fontSize: 13, color: "#c0392b", background: "#fdecea", padding: "8px 12px", borderRadius: 8 }}>⚠️ {importError}</div>}
            {importSuccess && <div style={{ marginTop: 8, fontSize: 13, color: "#5c3d1e", background: "#f5ece0", padding: "8px 12px", borderRadius: 8 }}>✓ Restored!</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}
