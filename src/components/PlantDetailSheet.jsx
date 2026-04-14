import { useState, useEffect, useRef } from "react";
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, CARE_ICONS, PLANT_DB, COMPANION_DB, CALENDAR_DATA, MONTHS, ICON_LIBRARY, lbl, sel, ZONES, DEFAULT_ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon } from "../utils.js";
import { Modal } from "./Modal.jsx";
import { CTAButton } from "./CTAButton.jsx";
import { IconPicker } from "./IconPicker.jsx";
import { EditPlantModal } from "./EditPlantModal.jsx";

function PlantDetailSheet({ plant, frostDates, onUpdate, onDelete, onClose, toast }) {
  const [showCompanions, setShowCompanions] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [newGood, setNewGood] = useState("");
  const [newBad, setNewBad] = useState("");
  const [careType, setCareType] = useState("Watering");
  const [careDate, setCareDate] = useState(new Date().toISOString().split("T")[0]);
  const [careNote, setCareNote] = useState("");

  function addCareEntry() {
    const entry = { id: generateId(), type: careType, date: careDate, notes: careNote };
    onUpdate({ ...plant, careLog: [...(plant.careLog || []), entry] });
    setCareNote("");
    const icons = { Watering: "💧", Fertilizing: "🌿", Pruning: "✂️", "Pest Treatment": "🐛", Observation: "👁" };
    toast && toast(`${careType} logged`, { icon: icons[careType] || "✓" });
  }

  function deleteCareEntry(id) {
    onUpdate({ ...plant, careLog: (plant.careLog || []).filter(e => e.id !== id) });
  }

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

  function toggleFavorite() {
    onUpdate({ ...plant, favorite: !plant.favorite });
    toast && toast(plant.favorite ? "Removed from favorites" : `${plant.name} favorited`, { icon: plant.favorite ? "🤍" : "❤️" });
  }

  return (
    <Modal onClose={onClose}>
      {/* Plant name header with favorite */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <h2 style={{ margin: "0 0 2px", fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>{plant.name}</h2>
          {plant.variety && <div style={{ color: "#888", fontSize: 15 }}>({plant.variety})</div>}
        </div>
        <button onClick={toggleFavorite} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: "0 0 0 8px", lineHeight: 1 }}>
          <img src={plant.favorite ? ICONS.favActive : ICONS.favorite} alt="Favorite" style={{ width: 26, height: 26, objectFit: "contain" }} />
        </button>
      </div>
      {/* Growing overview card */}
      <div style={{ background: "#f5f5f3", borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Growing Overview</span>
          {plant.dateStarted && <span style={{ fontSize: 13, color: "#888" }}>Started {formatDate(plant.dateStarted)}</span>}
        </div>
        {/* Water + sun badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {plant.water && <span style={{ border: "1px solid #ccc", borderRadius: 20, padding: "3px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><img src={ICONS.water} alt="water" style={{ width: 14, height: 14, objectFit: "contain" }} /> {plant.water}</span>}
          {plant.sun && <span style={{ border: "1px solid #ccc", borderRadius: 20, padding: "3px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}><img src={ICONS.sun} alt="sun" style={{ width: 14, height: 14, objectFit: "contain" }} /> {plant.sun}</span>}
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

      {/* ── Inline Care Log ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>Care Log</div>

        {/* Quick log form */}
        <div style={{ background: "#f5f5f3", borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={lbl}>Type</label>
              <select value={careType} onChange={e => setCareType(e.target.value)} style={{ ...sel, borderRadius: 10 }}>
                {CARE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={lbl}>Date</label>
              <input type="date" value={careDate} onChange={e => setCareDate(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
          </div>
          <textarea placeholder="Notes (optional)..." value={careNote} onChange={e => setCareNote(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", minHeight: 60, resize: "vertical", marginBottom: 10 }} />
          <CTAButton onClick={addCareEntry} style={{ padding: "11px", fontSize: 15 }}>+ Log Care</CTAButton>
        </div>

        {/* Care history */}
        {(!plant.careLog || plant.careLog.length === 0) ? (
          <p style={{ textAlign: "center", color: "#bbb", fontSize: 14, margin: "8px 0" }}>No care entries yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[...(plant.careLog || [])].reverse().map(entry => {
              const icons = { Watering: "💧", Fertilizing: "🌿", Pruning: "✂️", "Pest Treatment": "🐛", Observation: "👁" };
              return (
                <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16, marginTop: 1 }}>{icons[entry.type] || "✓"}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{entry.type} <span style={{ color: "#888", fontWeight: 400, fontSize: 13 }}>· {formatDate(entry.date)}</span></div>
                      {entry.notes && <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{entry.notes}</div>}
                    </div>
                  </div>
                  <button onClick={() => deleteCareEntry(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 18, flexShrink: 0 }}>×</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit button only — delete moved to edit screen */}
      <button onClick={() => setShowEdit(true)}
        style={{ width: "100%", padding: "12px", background: "#fff", border: "2px solid #000", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>✏️ Edit Plant</button>

      {showEdit && <EditPlantModal plant={plant} onSave={updated => { onUpdate(updated); toast && toast(`${updated.name} updated`, { icon: "✏️" }); }} onClose={() => setShowEdit(false)} onDelete={id => { onDelete(id); onClose(); toast && toast("Plant removed", { type: "warning", icon: "🗑" }); }} />}

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

export { PlantDetailSheet };
