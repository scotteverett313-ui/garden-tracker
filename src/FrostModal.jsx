import { useState, useEffect, useRef } from "react";
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, CARE_ICONS, PLANT_DB, COMPANION_DB, CALENDAR_DATA, MONTHS, ICON_LIBRARY, lbl, sel, ZONES, DEFAULT_ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon } from "../utils.js";
import { Modal } from "./Modal.jsx";
import { CTAButton } from "./CTAButton.jsx";

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

export { FrostModal };
