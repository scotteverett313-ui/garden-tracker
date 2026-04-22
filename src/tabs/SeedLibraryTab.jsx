import { useState, useEffect, useRef } from "react";
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, CARE_ICONS, PLANT_DB, COMPANION_DB, CALENDAR_DATA, MONTHS, ICON_LIBRARY, lbl, sel, ZONES, DEFAULT_ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon } from "../utils.js";
import { Modal } from "../components/Modal.jsx";
import { CTAButton } from "../components/CTAButton.jsx";
import { SeedScanPicker } from "../components/SeedScanPicker.jsx";
import { SeedDetailSheet } from "../components/SeedDetailSheet.jsx";
import { callClaude } from "../claude.js";

const SEED_FIELDS = [
  { key: "name",         label: "Plant Name",                           type: "text" },
  { key: "variety",      label: "Variety",                              type: "text" },
  { key: "brand",        label: "Brand / Company",                      type: "text" },
  { key: "year",         label: "Packet Year",                          type: "number" },
  { key: "dtm",          label: "Days to Maturity",                     type: "number" },
  { key: "depth",        label: "Planting Depth",                       type: "text" },
  { key: "spacing",      label: "Spacing",                              type: "text" },
  { key: "sun",          label: "☀️ Sun",    type: "select", options: ["Full Sun", "Partial Shade", "Full Shade"] },
  { key: "water",        label: "💧 Water",  type: "select", options: ["Low", "Moderate", "Regular", "High"] },
  { key: "startIndoors", label: "Start Indoors (wks before last frost)", type: "number" },
  { key: "germDays",     label: "Germination Days",                     type: "text" },
  { key: "notes",        label: "Notes",                                type: "textarea" },
];

const SEED_CATEGORIES = [
  { key: "Flowers",    color: "#e05a9a", text: "#fff" },
  { key: "Fruits",     color: "#e05840", text: "#fff" },
  { key: "Herbs",      color: "#4aaa6a", text: "#fff" },
  { key: "Greens",     color: "#3a9080", text: "#fff" },
  { key: "Vegetables", color: "#7b9e50", text: "#fff" },
  { key: "Roots",      color: "#c4965a", text: "#fff" },
  { key: "Other",      color: "#aaaaaa", text: "#fff" },
];

const CAT_LOOKUP = {
  Flowers:    ["sunflower","zinnia","marigold","cosmos","nasturtium","alyssum","dahlia","lavender","chamomile","petunia"],
  Fruits:     ["tomato","pepper","cucumber","squash","zucchini","melon","watermelon","pumpkin","eggplant","tomatillo"],
  Herbs:      ["basil","mint","cilantro","dill","parsley","sage","thyme","oregano","rosemary","chives","fennel"],
  Greens:     ["lettuce","spinach","kale","arugula","chard","bok choy","cabbage","broccoli","collard"],
  Vegetables: ["onion","garlic","leek","corn","bean","pea","radish","beet","turnip","cauliflower"],
  Roots:      ["carrot","potato","parsnip","rutabaga","celery","yam"],
};

function getSeedCategory(seed) {
  if (seed.category) return seed.category;
  const name = (seed.name || "").toLowerCase();
  for (const [cat, names] of Object.entries(CAT_LOOKUP)) {
    if (names.some(n => name.includes(n))) return cat;
  }
  return "Other";
}

function SeedLibraryTab({ seeds, onSaveSeeds, onAddToGarden }) {
  const [view, setView] = useState("library"); // library | scan | edit
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [editingSeed, setEditingSeed] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scannedData, setScannedData] = useState(null);
  const [debugText, setDebugText] = useState("");
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [frontImg, setFrontImg] = useState(null);
  const [backImg, setBackImg] = useState(null);
  const frontRef = useRef();
  const backRef = useRef();

  const filtered = seeds.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.variety?.toLowerCase().includes(q) || s.brand?.toLowerCase().includes(q);
    const matchCat = !filterCategory || getSeedCategory(s) === filterCategory;
    return matchSearch && matchCat;
  });

  const categoryCounts = SEED_CATEGORIES
    .map(c => ({ ...c, count: seeds.filter(s => getSeedCategory(s) === c.key).length }))
    .filter(c => c.count > 0);

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

      const text = await callClaude([{ role: "user", content }]);
      setDebugText(text);
      const clean = text.replace(/```json|```/g, "").trim();
      let parsed;
      try {
        parsed = JSON.parse(clean);
      } catch {
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error(`Couldn't parse response. Raw: ${text.slice(0, 200)}`);
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

  function handleBookmark(seed) {
    onSaveSeeds(seeds.map(s => s.id === seed.id ? { ...s, bookmarked: !s.bookmarked } : s));
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

        {(() => {
          const inp = { width: "100%", padding: "9px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" };
          const ta = { ...inp, minHeight: 70, resize: "vertical" };
          const field = (key, placeholder, type = "text") => (
            <input type={type} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={inp} />
          );
          return (
            <>
              {/* Packet Info */}
              <div style={{ background: "#f5f5f3", borderRadius: 14, padding: 14, marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Packet Info</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ gridColumn: "span 2" }}><label style={lbl}>Plant Name</label>{field("name", "e.g. Tomato")}</div>
                  <div><label style={lbl}>Variety</label>{field("variety", "e.g. Cherokee Purple")}</div>
                  <div><label style={lbl}>Brand / Company</label>{field("brand", "e.g. Burpee")}</div>
                  <div><label style={lbl}>Category</label>
                    <select value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={sel}>
                      <option value="">Auto-detect</option>
                      {SEED_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.key}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Packet Year</label>{field("year", new Date().getFullYear().toString(), "number")}</div>
                  <div><label style={lbl}>Days to Maturity</label>{field("dtm", "e.g. 75", "number")}</div>
                </div>
              </div>

              {/* Planting Guide */}
              <div style={{ background: "#f5f5f3", borderRadius: 14, padding: 14, marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Planting Guide</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={lbl}>Planting Depth</label>{field("depth", "e.g. ¼ inch")}</div>
                  <div><label style={lbl}>Spacing</label>{field("spacing", "e.g. 12 inches")}</div>
                  <div><label style={lbl}>Start Indoors (wks)</label>{field("startIndoors", "wks before last frost", "number")}</div>
                  <div><label style={lbl}>Germination Days</label>{field("germDays", "e.g. 7-14")}</div>
                </div>
              </div>

              {/* Care */}
              <div style={{ background: "#f5f5f3", borderRadius: 14, padding: 14, marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Care Requirements</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div><label style={lbl}>☀️ Sun</label>
                    <select value={form.sun || ""} onChange={e => setForm(f => ({ ...f, sun: e.target.value }))} style={sel}>
                      <option value="">Select...</option>
                      {["Full Sun", "Partial Shade", "Full Shade"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>💧 Water</label>
                    <select value={form.water || ""} onChange={e => setForm(f => ({ ...f, water: e.target.value }))} style={sel}>
                      <option value="">Select...</option>
                      {["Low", "Moderate", "Regular", "High"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ background: "#f5f5f3", borderRadius: 14, padding: 14, marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Notes</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div><label style={lbl}>About (from packet)</label><textarea value={form.about || ""} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} style={ta} /></div>
                  <div><label style={lbl}>Additional Notes</label><textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={ta} /></div>
                </div>
              </div>
            </>
          );
        })()}

        <div style={{ display: "flex", gap: 10 }}>
          <CTAButton onClick={() => handleSave(form)} style={{ padding: "13px", fontSize: 15 }}>
            💾 Save to Seed Library
          </CTAButton>
          <button onClick={() => { setView("library"); setEditingSeed(null); setScannedData(null); }}
            style={{ padding: "13px 18px", background: "#fff", color: "#555", border: "1.5px solid #ddd", borderRadius: 12, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Library view ──
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#000" }}>Seed Library</div>
        <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1 }}>{seeds.length} seed{seeds.length !== 1 ? "s" : ""}</div>
      </div>

      {/* Scan Packet CTA */}
      <CTAButton onClick={() => { setScanError(""); setFrontImg(null); setBackImg(null); setView("scan"); }} style={{ marginBottom: 14, fontSize: 15 }}>
        Scan Packet
      </CTAButton>

      {/* Search */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input placeholder="Search seeds..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: "10px 14px", border: "2px solid #000", borderRadius: 50, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }} />
        {search && <button onClick={() => setSearch("")}
          style={{ width: 40, height: 40, border: "2px solid #000", borderRadius: 10, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>×</button>}
      </div>

      {/* Category chips */}
      {categoryCounts.length > 0 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18, paddingBottom: 2, scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {categoryCounts.map(c => (
            <button key={c.key} onClick={() => setFilterCategory(filterCategory === c.key ? "" : c.key)}
              style={{ flexShrink: 0, background: c.color, border: `2.5px solid ${filterCategory === c.key ? "#000" : "transparent"}`, borderRadius: 14, padding: "10px 14px", cursor: "pointer", textAlign: "center", minWidth: 70, boxShadow: filterCategory === c.key ? "0 0 0 2px #000" : "none", opacity: filterCategory && filterCategory !== c.key ? 0.5 : 1, transition: "all 0.15s" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{c.count}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginTop: 3 }}>{c.key}</div>
            </button>
          ))}
        </div>
      )}
      {filterCategory && (
        <button onClick={() => setFilterCategory("")}
          style={{ background: "#f0f0f0", border: "none", borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontSize: 13, marginBottom: 14 }}>× Clear</button>
      )}

      {seeds.length === 0 ? (
        <div style={{ border: "2px dashed #ccc", borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌰</div>
          <div style={{ color: "#888", fontSize: 15, marginBottom: 4 }}>Your seed library is empty.</div>
          <div style={{ color: "#bbb", fontSize: 14 }}>Scan your first seed packet to get started.</div>
        </div>
      ) : (
        <>
          {filtered.length === 0 && <div style={{ textAlign: "center", color: "#bbb", padding: "24px 0", fontSize: 14 }}>No seeds match your search.</div>}
          {filtered.map(seed => {
            const icon = getAutoIcon(seed.name);
            return (
              <div key={seed.id} style={{ position: "relative", marginBottom: 8, paddingBottom: 4 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 14, zIndex: 0 }} />
                <button onClick={() => setSelectedSeed(seed)} className="plant-card"
                  style={{ position: "relative", zIndex: 1, background: "#fff", border: "2px solid #000", borderRadius: 14, padding: "14px 16px", width: "100%", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, boxSizing: "border-box" }}>
                  {icon && (
                    <img src={icon.url} alt={seed.name} style={{ width: 44, height: 44, objectFit: "contain", imageRendering: "pixelated", flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                      <span style={{ fontWeight: 800, fontSize: 16 }}>{seed.name || "Unnamed"}</span>
                      {seed.variety && <span style={{ color: "#888", fontSize: 13 }}>{seed.variety}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                      {seed.brand && <span style={{ fontSize: 12, color: "#888" }}>{seed.brand}</span>}
                      {seed.dtm && <span style={{ fontSize: 12, fontWeight: 700, color: "#444" }}>· {seed.dtm}d</span>}
                      {seed.year && <span style={{ fontSize: 11, background: "#f0f0f0", color: "#666", padding: "1px 6px", borderRadius: 8 }}>{seed.year}</span>}
                      {seed.started && <span style={{ fontSize: 11, background: "#a8e063", color: "#000", padding: "1px 6px", borderRadius: 8, fontWeight: 700, border: "1px solid #000" }}>✓ Started</span>}
                      {seed.bookmarked && <span style={{ fontSize: 14 }}>🔖</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: "#bbb", flexShrink: 0 }}>›</span>
                </button>
              </div>
            );
          })}
        </>
      )}

      {selectedSeed && (
        <SeedDetailSheet
          seed={seeds.find(s => s.id === selectedSeed.id) || selectedSeed}
          onClose={() => setSelectedSeed(null)}
          onUpdate={updated => onSaveSeeds(seeds.map(s => s.id === updated.id ? updated : s))}
          onDelete={id => { onSaveSeeds(seeds.filter(s => s.id !== id)); setSelectedSeed(null); }}
          onAddToGarden={onAddToGarden}
          onEdit={seed => { setSelectedSeed(null); setEditingSeed(seed); setEditForm(seed); setView("edit"); }}
        />
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

export { SeedLibraryTab };
