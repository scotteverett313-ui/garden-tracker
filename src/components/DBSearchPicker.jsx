import { useState, useEffect, useRef } from "react";
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, CARE_ICONS, PLANT_DB, COMPANION_DB, CALENDAR_DATA, MONTHS, ICON_LIBRARY, lbl, sel, ZONES, DEFAULT_ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon } from "../utils.js";
import { Modal } from "./Modal.jsx";
import { CTAButton } from "./CTAButton.jsx";

function DBSearchPicker({ userDB, onSelect }) {
  const [q, setQ] = useState("");
  const allPlants = [...PLANT_DB, ...(userDB || [])].filter((p, i, arr) =>
    arr.findIndex(x => x.name.toLowerCase() === p.name.toLowerCase()) === i
  );
  const results = allPlants.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <input autoFocus placeholder={`Search ${allPlants.length} plants...`} value={q} onChange={e => setQ(e.target.value)}
        style={{ width: "100%", padding: "12px 16px", border: "2px solid #000", borderRadius: 'var(--radius-btn)', fontSize: 15, boxSizing: "border-box", fontFamily: "inherit", marginBottom: 14 }} />
      <div style={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {results.length === 0 && <div style={{ textAlign: "center", color: "#bbb", padding: "24px 0", fontSize: 14 }}>No matches found.</div>}
        {results.map(p => {
          const iconUrl = getAutoIcon(p.name)?.url;
          return (
            <div key={p.name} style={{ position: "relative", paddingBottom: 3 }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 3, bottom: 0, background: "#000", borderRadius: 'var(--radius-icon)', zIndex: 0 }} />
              <button onClick={() => onSelect(p)}
                style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#fff", border: "2px solid #000", borderRadius: 'var(--radius-icon)', cursor: "pointer", textAlign: "left", width: "100%", boxSizing: "border-box" }}>
                <div style={{ width: 40, height: 40, background: "#f5f5f3", borderRadius: 'var(--radius-sm)', display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  {iconUrl
                    ? <img src={iconUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
                    : <span style={{ fontSize: 20 }}>🌱</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    {[p.dtm && `${p.dtm} DTM`, p.sun, p.water].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <span style={{ fontSize: 18, color: "#aaa" }}>›</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Seed Scan Picker (inline for Add Plant flow) ────────────────────────────

export { DBSearchPicker };
