import { useState, useEffect, useRef } from "react";
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, CARE_ICONS, PLANT_DB, COMPANION_DB, CALENDAR_DATA, MONTHS, ICON_LIBRARY, lbl, sel, ZONES, DEFAULT_ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon } from "../utils.js";
import { Modal } from "./Modal.jsx";
import { CTAButton } from "./CTAButton.jsx";

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

export { IconPicker };
