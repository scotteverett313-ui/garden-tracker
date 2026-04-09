import { useState, useEffect, useRef } from "react";

const ZONES = ["Basement Grow Station", "Greenhouse", "Raised Beds", "In-Ground Beds"];
const ZONE_ICONS = { "Basement Grow Station": "💡", "Greenhouse": "🏠", "Raised Beds": "🟫", "In-Ground Beds": "🌱" };
const ZONE_COLORS = { "Basement Grow Station": "#e8e4f0", "Greenhouse": "#d6f0e8", "Raised Beds": "#f5e8d6", "In-Ground Beds": "#ddf0d6" };

const STATUSES = [
  { label: "Seed", icon: "🌰" }, { label: "Germinating", icon: "🌱" }, { label: "Seedling", icon: "🌿" },
  { label: "Transplanted", icon: "🪴" }, { label: "Growing", icon: "🌾" }, { label: "Flowering", icon: "🌸" },
  { label: "Fruiting", icon: "🍅" }, { label: "Harvesting", icon: "🧺" }, { label: "Dormant", icon: "💤" }
];

const STATUS_COLORS = {
  "Seed": "#f5e6c8", "Germinating": "#e8f0d8", "Seedling": "#d6e8d0",
  "Transplanted": "#fde8c8", "Growing": "#d8ecd8", "Flowering": "#f0d8e8",
  "Fruiting": "#fcd8d8", "Harvesting": "#d8e8c8", "Dormant": "#e8e8e8"
};

const CARE_TYPES = ["Watering", "Fertilizing", "Pruning", "Pest Treatment", "Observation"];

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

// ─── Storage helpers ─────────────────────────────────────────────────────────
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
      <div style={{ background: "#fff", borderRadius: "16px 16px 0 0", padding: "20px 16px 32px", width: "100%", maxWidth: width, maxHeight: "92vh", overflowY: "auto", position: "relative" }}>
        <div style={{ width: 36, height: 4, background: "#ddd", borderRadius: 4, margin: "0 auto 16px" }} />
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "1px solid #ddd", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        {children}
      </div>
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
    notes: ""
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);

  function handleNameChange(val) {
    setForm(f => ({ ...f, name: val }));
    if (val.length > 1) {
      // Search built-in DB first, then user's custom DB, deduplicated
      const builtIn = PLANT_DB.filter(p => p.name.toLowerCase().startsWith(val.toLowerCase()));
      const custom = (userDB || []).filter(p => p.name.toLowerCase().startsWith(val.toLowerCase()) && !builtIn.find(b => b.name.toLowerCase() === p.name.toLowerCase()));
      const all = [...builtIn, ...custom.map(p => ({ ...p, isCustom: true }))];
      setSuggestions(all);
      setShowSugg(all.length > 0);
    } else {
      setShowSugg(false);
    }
  }

  function selectSuggestion(plant) {
    setForm(f => ({ ...f, name: plant.name, about: plant.about || "", water: plant.water || "", sun: plant.sun || "", dtm: plant.dtm || "" }));
    setShowSugg(false);
  }

  function handleSubmit() {
    if (!form.name.trim()) return;
    const plant = { ...form, id: generateId(), companions: { good: [...(COMPANION_DB[form.name]?.good || [])], bad: [...(COMPANION_DB[form.name]?.bad || [])] }, careLog: [] };
    onAdd(plant);

    // Save to user DB if not already in built-in DB and has meaningful data
    const inBuiltIn = PLANT_DB.find(p => p.name.toLowerCase() === form.name.toLowerCase());
    const inUserDB = (userDB || []).find(p => p.name.toLowerCase() === form.name.toLowerCase());
    if (!inBuiltIn && !inUserDB && form.name.trim()) {
      const entry = { name: form.name.trim(), dtm: form.dtm, water: form.water, sun: form.sun, about: form.about, addedAt: new Date().toISOString() };
      onSaveUserDB([...(userDB || []), entry]);
    } else if (!inBuiltIn && inUserDB) {
      // Update existing user DB entry with any new info filled in
      const updated = (userDB || []).map(p => p.name.toLowerCase() === form.name.toLowerCase()
        ? { ...p, dtm: form.dtm || p.dtm, water: form.water || p.water, sun: form.sun || p.sun, about: form.about || p.about }
        : p);
      onSaveUserDB(updated);
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
                  onMouseEnter={e => e.currentTarget.style.background = "#f5f9f5"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                  <span>{p.name}</span>
                  {p.isCustom && <span style={{ fontSize: 11, background: "#fff3cd", color: "#856404", padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>my db</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div><label style={lbl}>Variety</label>{input("variety", "e.g. Cherokee Purple")}</div>
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
        <button onClick={handleSubmit} style={{ padding: "10px 24px", background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>+ Add Plant</button>
      </div>
    </Modal>
  );
}

function EditPlantModal({ plant, onSave, onClose }) {
  const [form, setForm] = useState({ ...plant });

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
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid #ccc", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 14 }}>Cancel</button>
        <button onClick={handleSubmit} style={{ padding: "10px 24px", background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Save Changes</button>
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
        <button onClick={() => { onSave({ lastSpring, firstFall }); onClose(); }} style={{ padding: "10px 24px", background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Save Dates</button>
      </div>
    </Modal>
  );
}

function CareLogModal({ plant, onSave, onClose }) {
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
  }

  function deleteEntry(id) {
    const updated = { ...plant, careLog: (plant.careLog || []).filter(e => e.id !== id) };
    onSave(updated);
  }

  return (
    <Modal onClose={onClose} width={600}>
      <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700 }}>{plant.name} {plant.variety ? <span style={{ color: "#888", fontWeight: 400 }}>({plant.variety})</span> : null}</h2>
      
      <div style={{ background: "#f5f9f5", borderRadius: 12, padding: 16, marginBottom: 20 }}>
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
      <button onClick={addEntry} style={{ width: "100%", padding: "12px", background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 600, marginBottom: 20 }}>+ Log Care</button>

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

function PlantCard({ plant, frostDates, onUpdate, onDelete }) {
  const [showCompanions, setShowCompanions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showCare, setShowCare] = useState(false);
  const [newGood, setNewGood] = useState("");
  const [newBad, setNewBad] = useState("");
  const menuRef = useRef();

  useEffect(() => {
    function handleClick(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const statusObj = STATUSES.find(s => s.label === plant.status) || STATUSES[0];
  const harvestDate = calcHarvestDate(plant.dateStarted, plant.dtm);
  const daysLeft = harvestDate ? daysUntil(harvestDate) : null;
  
  const hasFrostWarning = harvestDate && frostDates.firstFall && new Date(harvestDate) > new Date(frostDates.firstFall);
  
  const nextZoneIdx = ZONES.indexOf(plant.zone) + 1;
  const nextZone = nextZoneIdx < ZONES.length ? ZONES[nextZoneIdx] : null;

  function addCompanion(type) {
    const val = type === "good" ? newGood.trim() : newBad.trim();
    if (!val) return;
    const updated = { ...plant, companions: { ...plant.companions, [type]: [...(plant.companions?.[type] || []), val] } };
    onUpdate(updated);
    type === "good" ? setNewGood("") : setNewBad("");
  }

  function removeCompanion(type, item) {
    const updated = { ...plant, companions: { ...plant.companions, [type]: (plant.companions?.[type] || []).filter(c => c !== item) } };
    onUpdate(updated);
  }

  return (
    <>
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8", padding: "12px 14px", marginBottom: 10 }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 18, marginTop: 1, flexShrink: 0 }}>{statusObj.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{plant.name}</div>
              {plant.variety && <div style={{ color: "#888", fontSize: 13 }}>{plant.variety}</div>}
            </div>
          </div>
          {/* Action buttons - compact icon-only on mobile */}
          <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
            <button onClick={() => setShowCare(true)} title="Care log"
              style={{ background: "none", border: "1px solid #ddd", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>💧</button>
            {nextZone && (
              <button onClick={() => onUpdate({ ...plant, zone: nextZone })} title={`Move to ${nextZone}`}
                style={{ background: "#f0f8f2", border: "1px solid #b8ddc8", borderRadius: 8, height: 32, padding: "0 8px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#2d6a3f", whiteSpace: "nowrap" }}>
                ⟫ {nextZone.split(" ")[0]}
              </button>
            )}
            <div ref={menuRef} style={{ position: "relative" }}>
              <button onClick={() => setShowMenu(v => !v)}
                style={{ background: "none", border: "1px solid #ddd", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>⋯</button>
              {showMenu && (
                <div style={{ position: "absolute", right: 0, top: "110%", background: "#fff", border: "1px solid #e0e0e0", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.14)", zIndex: 200, minWidth: 160 }}>
                  <div style={{ padding: "6px 12px 4px", fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 0.5 }}>MOVE TO</div>
                  {ZONES.map(z => z !== plant.zone && (
                    <div key={z} onClick={() => { onUpdate({ ...plant, zone: z }); setShowMenu(false); }} style={{ padding: "8px 14px", cursor: "pointer", fontSize: 13 }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f5f9f5"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}>{z}</div>
                  ))}
                  <div style={{ borderTop: "1px solid #eee", margin: "4px 0", padding: "6px 12px 4px", fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 0.5 }}>STATUS</div>
                  {STATUSES.map(s => s.label !== plant.status && (
                    <div key={s.label} onClick={() => { onUpdate({ ...plant, status: s.label }); setShowMenu(false); }} style={{ padding: "8px 14px", cursor: "pointer", fontSize: 13 }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f5f9f5"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}>{s.icon} {s.label}</div>
                  ))}
                  <div style={{ borderTop: "1px solid #eee", margin: "4px 0" }} />
                  <div onClick={() => { setShowEdit(true); setShowMenu(false); }} style={{ padding: "8px 14px", cursor: "pointer", fontSize: 13 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f9f5"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}>✏️ Edit Plant</div>
                  <div onClick={() => { onDelete(plant.id); setShowMenu(false); }} style={{ padding: "8px 14px", cursor: "pointer", fontSize: 13, color: "#c0392b" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}>🗑 Delete</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status + meta row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, alignItems: "center" }}>
          <Badge label={plant.status} color={STATUS_COLORS[plant.status]} />
          {plant.dateStarted && <span style={{ color: "#999", fontSize: 12 }}>Started {formatDate(plant.dateStarted)}</span>}
          {plant.quantity && <span style={{ color: "#999", fontSize: 12 }}>· Qty: {plant.quantity}</span>}
          {plant.water && <span style={{ fontSize: 11, color: "#5a8a6a", background: "#eaf5ee", padding: "2px 7px", borderRadius: 10 }}>💧 {plant.water}</span>}
          {plant.sun && <span style={{ fontSize: 11, color: "#8a7a2a", background: "#faf5e0", padding: "2px 7px", borderRadius: 10 }}>☀️ {plant.sun}</span>}
        </div>

        {/* Frost warning */}
        {hasFrostWarning && (
          <div style={{ marginTop: 7, background: "#e8f0ff", borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "#3a5aaa" }}>
            ❄️ Harvest may conflict with fall frost ({formatDate(frostDates.firstFall)})
          </div>
        )}

        {/* Harvest countdown */}
        {daysLeft !== null && (
          <div style={{ marginTop: 5, fontSize: 12, color: daysLeft <= 14 ? "#c0392b" : "#5a8a5a" }}>
            {daysLeft > 0 ? `🗓 Harvest in ${daysLeft} days — ${formatDate(harvestDate)}` : "🎉 Ready to harvest!"}
          </div>
        )}

        {plant.notes && <div style={{ marginTop: 6, fontSize: 12, color: "#777", lineHeight: 1.4 }}>{plant.notes}</div>}

        {/* Companions toggle */}
        <button onClick={() => setShowCompanions(v => !v)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#5a8a6a", fontSize: 12, padding: "6px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
          🌿 {showCompanions ? "Hide companions" : `Companions${(plant.companions?.good?.length || 0) + (plant.companions?.bad?.length || 0) > 0 ? ` (${(plant.companions?.good?.length || 0) + (plant.companions?.bad?.length || 0)})` : ""}`}
        </button>

        {/* Companions panel — stacked vertically for mobile */}
        {showCompanions && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #f0f0f0" }}>
            {/* Plant with */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#2d6a3f", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>✓ Plant with</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                {(plant.companions?.good || []).map(c => (
                  <span key={c} style={{ background: "#eaf5ee", color: "#2d6a3f", fontSize: 12, padding: "3px 8px", borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {c}
                    <button onClick={() => removeCompanion("good", c)} style={{ background: "none", border: "none", cursor: "pointer", color: "#2d6a3f", fontSize: 13, lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
                  </span>
                ))}
                {(plant.companions?.good || []).length === 0 && <span style={{ fontSize: 12, color: "#bbb" }}>None added</span>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input value={newGood} onChange={e => setNewGood(e.target.value)} onKeyDown={e => e.key === "Enter" && addCompanion("good")}
                  placeholder="Add companion plant..." style={{ flex: 1, padding: "6px 10px", border: "1px solid #ccc", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }} />
                <button onClick={() => addCompanion("good")} style={{ background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>+</button>
              </div>
            </div>
            {/* Avoid near */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#c0392b", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>✗ Avoid near</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                {(plant.companions?.bad || []).map(c => (
                  <span key={c} style={{ background: "#fdecea", color: "#c0392b", fontSize: 12, padding: "3px 8px", borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {c}
                    <button onClick={() => removeCompanion("bad", c)} style={{ background: "none", border: "none", cursor: "pointer", color: "#c0392b", fontSize: 13, lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
                  </span>
                ))}
                {(plant.companions?.bad || []).length === 0 && <span style={{ fontSize: 12, color: "#bbb" }}>None added</span>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input value={newBad} onChange={e => setNewBad(e.target.value)} onKeyDown={e => e.key === "Enter" && addCompanion("bad")}
                  placeholder="Add plant to avoid..." style={{ flex: 1, padding: "6px 10px", border: "1px solid #ccc", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }} />
                <button onClick={() => addCompanion("bad")} style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>+</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showEdit && <EditPlantModal plant={plant} onSave={updated => onUpdate(updated)} onClose={() => setShowEdit(false)} />}
      {showCare && <CareLogModal plant={plant} onSave={updated => onUpdate(updated)} onClose={() => setShowCare(false)} />}
    </>
  );
}

function GardenTab({ plants, frostDates, onUpdate, onDelete, search, setSearch, filterZone, setFilterZone, filterStatus, setFilterStatus, setShowAdd, setShowFrost }) {
  const filtered = plants.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.variety || "").toLowerCase().includes(q) || (p.notes || "").toLowerCase().includes(q);
    const matchZone = !filterZone || p.zone === filterZone;
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchZone && matchStatus;
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input placeholder="Search plants..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 2, minWidth: 200, padding: "10px 14px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, fontFamily: "inherit" }} />
        <select value={filterZone} onChange={e => setFilterZone(e.target.value)} style={{ ...sel, flex: 1, minWidth: 140 }}>
          <option value="">All Zones</option>
          {ZONES.map(z => <option key={z}>{z}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...sel, flex: 1, minWidth: 140 }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s.label} value={s.label}>{s.icon} {s.label}</option>)}
        </select>
        <button onClick={() => setShowFrost(true)} style={{ padding: "10px 16px", border: "1.5px solid #ddd", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>❄️ Frost Dates</button>
        <button onClick={() => setShowAdd(true)} style={{ padding: "10px 20px", background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>+ Add Plant</button>
      </div>
      {(search || filterZone || filterStatus) && (
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => { setSearch(""); setFilterZone(""); setFilterStatus(""); }} style={{ background: "#f0f0f0", border: "none", borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontSize: 13 }}>× Clear filters</button>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        {ZONES.map(zone => {
          const zonePlants = filtered.filter(p => p.zone === zone);
          return (
            <div key={zone}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: ZONE_COLORS[zone], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{ZONE_ICONS[zone]}</div>
                <div><div style={{ fontWeight: 700, fontSize: 18 }}>{zone}</div><div style={{ color: "#888", fontSize: 13 }}>{zonePlants.length} plant{zonePlants.length !== 1 ? "s" : ""}</div></div>
              </div>
              {zonePlants.length === 0 ? (
                <div style={{ border: "1.5px dashed #ddd", borderRadius: 12, padding: 32, textAlign: "center", color: "#bbb", fontSize: 14 }}>No plants here yet</div>
              ) : (
                zonePlants.map(p => <PlantCard key={p.id} plant={p} frostDates={frostDates} onUpdate={onUpdate} onDelete={onDelete} />)
              )}
            </div>
          );
        })}
      </div>
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
          { label: "Transplant", color: "#d8f0e4", text: "#2d6a3f" },
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
                <th key={m} style={{ textAlign: "center", padding: "10px 4px", fontWeight: 600, width: 44, borderBottom: "1px solid #eee", color: i === currentMonth ? "#2d6a3f" : "#555", background: i === currentMonth ? "#f0f8f2" : "#f8f8f8", fontSize: 12 }}>{m}</th>
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
                    else if (isT) { bg = "#d8f0e4"; color = "#2d6a3f"; label = "T"; }
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
        <button onClick={() => setShowAdd(true)} style={{ padding: "10px 20px", background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>+ Add Plan</button>
      </div>

      {showAdd && (
        <div style={{ background: "#f5f9f5", borderRadius: 14, padding: 20, marginBottom: 24, border: "1px solid #ddeedd" }}>
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
            <button onClick={addPlan} style={{ padding: "10px 20px", background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Create Plan</button>
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
                <div key={i} style={{ background: "#f5f9f5", border: "1px solid #ddeedd", borderRadius: 10, padding: "10px 14px", minWidth: 120 }}>
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
          <div style={{ marginBottom: 12, fontSize: 13, color: "#5a8a6a", background: "#eaf5ee", padding: "8px 14px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                    <button onClick={() => setEditing(null)} style={{ padding: "7px 16px", background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Done</button>
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
                      {entry.dtm && <span style={{ fontSize: 12, color: "#5a8a6a", background: "#eaf5ee", padding: "2px 8px", borderRadius: 10 }}>📅 {entry.dtm} DTM</span>}
                      {entry.water && <span style={{ fontSize: 12, color: "#3a6aaa", background: "#e4eef8", padding: "2px 8px", borderRadius: 10 }}>💧 {entry.water}</span>}
                      {entry.sun && <span style={{ fontSize: 12, color: "#8a6a00", background: "#faf0d0", padding: "2px 8px", borderRadius: 10 }}>☀️ {entry.sun}</span>}
                    </div>
                    {entry.about && <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>{entry.about}</div>}
                    {entry.addedAt && <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>Added {formatDate(entry.addedAt)}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginLeft: 12, flexShrink: 0 }}>
                    <button onClick={() => onAddToGarden(entry)}
                      style={{ background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>+ Add</button>
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

        <div style={{ background: "#f5f9f5", border: "1px solid #c8e6c9", borderRadius: 14, padding: 16, marginBottom: 16 }}>
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
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px dashed ${side.img ? "#2d6a3f" : "#ccc"}`, borderRadius: 12, padding: 20, cursor: "pointer", background: side.img ? "#f0f9f0" : "#fafaf8", minHeight: 100, textAlign: "center", gap: 6 }}>
                {side.img ? (
                  <>
                    <div style={{ fontSize: 28 }}>✓</div>
                    <div style={{ fontSize: 12, color: "#2d6a3f", fontWeight: 600 }}>{side.img.name}</div>
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
          style={{ width: "100%", padding: 14, background: scanning ? "#aaa" : "#2d6a3f", color: "#fff", border: "none", borderRadius: 12, cursor: scanning ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
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
          <div style={{ background: "#f0f9f0", border: "1px solid #b8ddc8", borderRadius: 10, padding: "8px 14px", marginBottom: 16, fontSize: 13, color: "#2d6a3f" }}>
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
            style={{ flex: 1, padding: 13, background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
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
          style={{ background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
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
            <div key={seed.id} style={{ background: "#fff", border: `1px solid ${seed.started ? "#b8ddc8" : "#e8e8e8"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{seed.name || "Unnamed"}</span>
                    {seed.variety && <span style={{ color: "#888", fontSize: 13 }}>{seed.variety}</span>}
                    {seed.started && <span style={{ fontSize: 11, background: "#eaf5ee", color: "#2d6a3f", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>✓ Started</span>}
                    {seed.year && <span style={{ fontSize: 11, background: "#f0f0f0", color: "#666", padding: "2px 7px", borderRadius: 10 }}>{seed.year}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: seed.about ? 6 : 0 }}>
                    {seed.brand && <span style={{ fontSize: 12, color: "#888" }}>🏷 {seed.brand}</span>}
                    {seed.dtm && <span style={{ fontSize: 12, color: "#5a8a6a", background: "#eaf5ee", padding: "2px 7px", borderRadius: 10 }}>📅 {seed.dtm} DTM</span>}
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
                    style={{ background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>+ Garden</button>
                  <button onClick={() => handleMarkStarted(seed)}
                    style={{ background: seed.started ? "#eaf5ee" : "#fff", color: seed.started ? "#2d6a3f" : "#555", border: "1px solid #ddd", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 11, whiteSpace: "nowrap" }}>
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
                <span style={{ fontSize: 13, fontWeight: 600, color: daysLeft <= 7 ? "#e67e22" : "#2d6a3f" }}>
                  🗓 {daysLeft} day{daysLeft !== 1 ? "s" : ""} away — {formatDate(harvestDate)}
                </span>
              )}
              {(daysLeft === null || daysLeft <= 0) && plant.status === "Harvesting" && (
                <span style={{ fontSize: 13, fontWeight: 600, color: "#2d6a3f" }}>🎉 In harvest</span>
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
              style={{ background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" }}>
              ✓ Mark Harvested
            </button>
          )}
        </div>

        {/* What to plant next */}
        <button onClick={() => setShowNextFor(showNextFor === plant.id ? null : plant.id)}
          style={{ marginTop: 10, background: "none", border: "1px solid #b8ddc8", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12, color: "#2d6a3f", fontWeight: 600 }}>
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
                    <div key={s.name} style={{ background: s.isGoodCompanion ? "#f0faf4" : "#fafafa", border: `1px solid ${s.isGoodCompanion ? "#b8ddc8" : "#eee"}`, borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</span>
                          <span style={{ fontSize: 11, background: "#e8e8e8", color: "#555", padding: "2px 7px", borderRadius: 10 }}>{s.type}</span>
                          {s.isGoodCompanion && <span style={{ fontSize: 11, background: "#d4edda", color: "#2d6a3f", padding: "2px 7px", borderRadius: 10, fontWeight: 600 }}>✓ Good companion</span>}
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
            <div style={{ background: "#f5f9f5", borderRadius: 14, padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
              <div style={{ color: "#666", fontSize: 14 }}>Nothing ready in the next {window_} days — your plants are still growing!</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const lbl = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#444" };
const sel = { width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, background: "#fff", fontFamily: "inherit", cursor: "pointer", boxSizing: "border-box" };
const menuItem = { padding: "9px 16px", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap", onMouseEnter: () => {} };

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [plants, setPlants] = useState([]);
  const [seeds, setSeeds] = useState([]);
  const [frostDates, setFrostDates] = useState({});
  const [userDB, setUserDB] = useState([]);
  const [tab, setTab] = useState("garden");
  const [showAdd, setShowAdd] = useState(false);
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
        // First time — seed with all 30 built-in plants
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

  function handleAdd(plant) { savePlants([...plants, plant]); }
  function handleUpdate(updated) { savePlants(plants.map(p => p.id === updated.id ? updated : p)); }
  function handleDelete(id) { savePlants(plants.filter(p => p.id !== id)); }
  function handleAddToGarden(entry) { setPrefillPlant(entry); setShowAdd(true); setTab("garden"); }
  function handleAddSeedToGarden(seed) { setPrefillPlant({ name: seed.name, variety: seed.variety, about: seed.about, water: seed.water, sun: seed.sun, dtm: seed.dtm }); setShowAdd(true); setTab("garden"); }

  const [showBackup, setShowBackup] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);

  function handleExport() {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      plants,
      frostDates,
      seeds,
      userDB: userDB.filter(p => !p.seeded),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plant-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImportError("");
    setImportSuccess(false);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.plants || !Array.isArray(data.plants)) throw new Error("Invalid backup file.");
        await savePlants(data.plants);
        if (data.frostDates) await saveFrost(data.frostDates);
        if (data.userDB && Array.isArray(data.userDB)) {
          // Merge custom entries with seeded ones
          const seeded = PLANT_DB.map(p => ({ ...p, addedAt: new Date().toISOString(), seeded: true }));
          const merged = [...seeded, ...data.userDB.filter(p => !seeded.find(s => s.name === p.name))];
          await saveUserDB(merged);
        }
        setImportSuccess(true);
        setTimeout(() => { setShowBackup(false); setImportSuccess(false); }, 2000);
      } catch (err) {
        setImportError("Couldn't read that file. Make sure it's a Plant Tracker backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const navBtn = (id, label, icon) => (
    <button onClick={() => setTab(id)} style={{ padding: "7px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === id ? 700 : 500, background: tab === id ? "#2d6a3f" : "transparent", color: tab === id ? "#fff" : "#555", display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ fontSize: 13 }}>{icon}</span> {label}
    </button>
  );

  if (!loaded) return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading your garden...</div>;

  return (
    <div style={{ fontFamily: "'Georgia', serif", maxWidth: 1200, margin: "0 auto", padding: "0 12px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #eee", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>🌿</span>
          <span style={{ fontWeight: 800, fontSize: 18 }}>Plant Tracker</span>
        </div>
        <nav style={{ display: "flex", gap: 2, flexWrap: "wrap", flex: 1 }}>
          {navBtn("garden", "Garden", "🌱")}
          {navBtn("seeds", "Seeds", "🌰")}
          {navBtn("harvest", "Harvest", "🧺")}
          {navBtn("calendar", "Calendar", "📅")}
          {navBtn("succession", "Succession", "🔄")}
          {navBtn("mydb", "My DB", "📖")}
        </nav>
        <button onClick={() => setShowBackup(true)}
          style={{ background: "none", border: "1px solid #ddd", borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: "#666", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          💾 Backup
        </button>
      </div>

      {tab === "garden" && (
        <GardenTab plants={plants} frostDates={frostDates} onUpdate={handleUpdate} onDelete={handleDelete}
          search={search} setSearch={setSearch} filterZone={filterZone} setFilterZone={setFilterZone}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus} setShowAdd={setShowAdd} setShowFrost={setShowFrost} />
      )}
      {tab === "seeds" && <SeedLibraryTab seeds={seeds} onSaveSeeds={saveSeeds} onAddToGarden={handleAddSeedToGarden} />}
      {tab === "calendar" && <CalendarTab plants={plants} />}
      {tab === "harvest" && <HarvestTab plants={plants} frostDates={frostDates} onUpdate={handleUpdate} />}
      {tab === "succession" && <SuccessionTab plants={plants} />}
      {tab === "mydb" && <MyDBTab userDB={userDB} onSaveUserDB={saveUserDB} onAddToGarden={handleAddToGarden} />}

      {showAdd && <AddPlantModal onAdd={handleAdd} onClose={() => { setShowAdd(false); setPrefillPlant(null); }} userDB={userDB} onSaveUserDB={saveUserDB} prefill={prefillPlant} />}
      {showFrost && <FrostModal frostDates={frostDates} onSave={saveFrost} onClose={() => setShowFrost(false)} />}

      {showBackup && (
        <Modal onClose={() => { setShowBackup(false); setImportError(""); setImportSuccess(false); }} width={440}>
          <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>💾 Backup & Restore</h2>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
            Your data lives on this device. Export a backup file to iCloud, Google Drive, or email to keep it safe.
          </p>

          <div style={{ background: "#f5f9f5", border: "1px solid #c8e6c9", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>📤 Export backup</div>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
              Downloads a JSON file with all your plants, care logs, frost dates, and custom database entries.
              {plants.length > 0 && <span style={{ color: "#2d6a3f", fontWeight: 600 }}> {plants.length} plant{plants.length !== 1 ? "s" : ""} will be saved.</span>}
            </div>
            <button onClick={handleExport}
              style={{ width: "100%", padding: "11px", background: "#2d6a3f", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
              Download Backup File
            </button>
          </div>

          <div style={{ background: "#fafaf8", border: "1px solid #e8e8e8", borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>📥 Restore from backup</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
              Select a previously exported backup file. This will replace your current data.
            </div>
            <label style={{ display: "block", width: "100%", padding: "11px", background: "#fff", border: "1.5px dashed #ccc", borderRadius: 10, cursor: "pointer", fontSize: 14, textAlign: "center", color: "#555", boxSizing: "border-box" }}>
              Choose Backup File
              <input type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
            </label>
            {importError && <div style={{ marginTop: 8, fontSize: 13, color: "#c0392b", background: "#fdecea", padding: "8px 12px", borderRadius: 8 }}>⚠️ {importError}</div>}
            {importSuccess && <div style={{ marginTop: 8, fontSize: 13, color: "#2d6a3f", background: "#eaf5ee", padding: "8px 12px", borderRadius: 8 }}>✓ Restore successful! Your data is back.</div>}
          </div>
        </Modal>
      )}
    </div>
  );
}
