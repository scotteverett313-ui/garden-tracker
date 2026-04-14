import { useState, useEffect, useRef } from "react";
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, CARE_ICONS, PLANT_DB, COMPANION_DB, CALENDAR_DATA, MONTHS, ICON_LIBRARY, lbl, sel, ZONES, DEFAULT_ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon } from "../utils.js";
import { Modal } from "../components/Modal.jsx";
import { CTAButton } from "../components/CTAButton.jsx";
import { SeedScanPicker } from "../components/SeedScanPicker.jsx";

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
        <CTAButton onClick={() => { setScanError(""); setFrontImg(null); setBackImg(null); setView("scan"); }} style={{ padding: "10px 16px", fontSize: 14 }}>
          📷 Scan Packet
        </CTAButton>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input placeholder="Search seeds..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: "10px 14px", border: "2px solid #000", borderRadius: 50, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }} />
        <button onClick={() => setSearch("")}
          style={{ display: search ? "flex" : "none", width: 40, height: 40, border: "2px solid #000", borderRadius: 10, background: "#fff", cursor: "pointer", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>×</button>
      </div>

      {seeds.length === 0 ? (
        <div style={{ border: "2px dashed #ccc", borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌰</div>
          <div style={{ color: "#888", fontSize: 15, marginBottom: 4 }}>Your seed library is empty.</div>
          <div style={{ color: "#bbb", fontSize: 14 }}>Scan your first seed packet to get started.</div>
        </div>
      ) : (
        <>
          {filtered.length === 0 && <div style={{ textAlign: "center", color: "#bbb", padding: "24px 0", fontSize: 14 }}>No seeds match your search.</div>}
          {filtered.map(seed => (
            <div key={seed.id} style={{ position: "relative", marginBottom: 8, paddingBottom: 4 }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 14, zIndex: 0 }} />
              <div style={{ position: "relative", zIndex: 1, background: "#fff", border: `2px solid #000`, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 16 }}>{seed.name || "Unnamed"}</span>
                    {seed.variety && <span style={{ color: "#888", fontSize: 13 }}>{seed.variety}</span>}
                    {seed.started && <span style={{ fontSize: 11, background: "#a8e063", color: "#000", padding: "2px 8px", borderRadius: 10, fontWeight: 700, border: "1px solid #000" }}>✓ Started</span>}
                    {seed.year && <span style={{ fontSize: 11, background: "#f0f0f0", color: "#666", padding: "2px 7px", borderRadius: 10 }}>{seed.year}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: seed.about ? 6 : 0 }}>
                    {seed.brand && <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>{seed.brand}</span>}
                    {seed.dtm && <span style={{ fontSize: 12, fontWeight: 700 }}>· {seed.dtm} DTM</span>}
                    {seed.sun && <span style={{ fontSize: 12, color: "#888" }}>· ☀️ {seed.sun}</span>}
                    {seed.water && <span style={{ fontSize: 12, color: "#888" }}>· 💧 {seed.water}</span>}
                    {seed.quantity && <span style={{ fontSize: 12, color: "#888" }}>· 🌰 {seed.quantity}</span>}
                  </div>
                  {seed.about && <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5, marginTop: 6 }}>{seed.about}</div>}
                  {seed.depth && <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>Depth: {seed.depth}{seed.spacing ? ` · Spacing: ${seed.spacing}` : ""}{seed.germDays ? ` · Germ: ${seed.germDays}d` : ""}</div>}
                  {seed.startIndoors && <div style={{ fontSize: 12, color: "#999" }}>Start indoors: {seed.startIndoors} wks before last frost</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "flex-end" }}>
                  <button onClick={() => handleBookmark(seed)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, padding: 0, lineHeight: 1 }}>
                    {seed.bookmarked ? "🔖" : "🏷️"}
                  </button>
                  <CTAButton onClick={() => onAddToGarden(seed)} style={{ padding: "6px 12px", fontSize: 12, width: "auto" }}>+ Garden</CTAButton>
                  <button onClick={() => handleMarkStarted(seed)}
                    style={{ background: seed.started ? "#000" : "#fff", color: seed.started ? "#fff" : "#555", border: "2px solid #000", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                    {seed.started ? "✓ Started" : "Mark started"}
                  </button>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button onClick={() => { setEditingSeed(seed); setEditForm(seed); setView("edit"); }}
                      style={{ background: "none", border: "1.5px solid #ddd", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 13 }}>✏️</button>
                    <button onClick={() => handleDelete(seed.id)}
                      style={{ background: "none", border: "1.5px solid #ddd", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 13, color: "#c0392b" }}>🗑</button>
                  </div>
                </div>
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

export { SeedLibraryTab };
