import { useState, useEffect, useRef } from "react";
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, CARE_ICONS, PLANT_DB, COMPANION_DB, CALENDAR_DATA, MONTHS, ICON_LIBRARY, lbl, sel, ZONES, DEFAULT_ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon } from "../utils.js";
import { Modal } from "./Modal.jsx";
import { CTAButton } from "./CTAButton.jsx";
import { FrostModal } from "./FrostModal.jsx";

function SettingsPanel({ onClose, zones, onSaveZones, frostDates, onSaveFrost, plants, seeds, lastBackup, daysSince, onExport, onImport, importError, importSuccess }) {
  const [editingZone, setEditingZone] = useState(null);
  const [editName, setEditName] = useState("");
  const [newZoneName, setNewZoneName] = useState("");
  const [showAddZone, setShowAddZone] = useState(false);
  const [activeSection, setActiveSection] = useState("zones");

  function startEdit(zone) {
    setEditingZone(zone.id);
    setEditName(zone.name);
  }

  function saveEdit(zone) {
    if (!editName.trim() || editName === zone.name) { setEditingZone(null); return; }
    onSaveZones(zones.map(z => z.id === zone.id ? { ...z, name: editName.trim() } : z));
    setEditingZone(null);
  }

  function deleteZone(zone) {
    const plantCount = plants.filter(p => p.zoneId === zone.id).length;
    if (plantCount > 0) return; // can't delete zone with plants
    onSaveZones(zones.filter(z => z.id !== zone.id));
  }

  function addZone() {
    if (!newZoneName.trim()) return;
    const newZone = { id: `zone_${Date.now()}`, name: newZoneName.trim(), icon: "🌿" };
    onSaveZones([...zones, newZone]);
    setNewZoneName("");
    setShowAddZone(false);
  }

  function moveZone(idx, dir) {
    const next = [...zones];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onSaveZones(next);
  }

  const sections = [
    { id: "zones", label: "Zones", icon: "🌱" },
    { id: "frost", label: "Frost Dates", icon: "❄️" },
    { id: "backup", label: "Backup", icon: "💾" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
      {/* Panel slides in from right */}
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "88%", maxWidth: 400, background: "#faf6f0", display: "flex", flexDirection: "column", animation: "slideInRight 0.28s cubic-bezier(0.25,0.46,0.45,0.94)" }}>
        {/* Header */}
        <div style={{ background: "#fff", borderBottom: "2px solid #000", padding: "20px 16px 14px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: "#f0f0f0", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>←</button>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>Settings</h2>
        </div>

        {/* Section tabs */}
        <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #eee", flexShrink: 0 }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{ flex: 1, padding: "10px 4px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: activeSection === s.id ? 800 : 500, color: activeSection === s.id ? "#000" : "#888", borderBottom: activeSection === s.id ? "3px solid #a8e063" : "3px solid transparent", transition: "all 0.15s ease" }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>

          {/* ── Zones ── */}
          {activeSection === "zones" && (
            <div>
              <p style={{ color: "#888", fontSize: 13, margin: "0 0 16px" }}>Tap ✏️ to rename. Drag ↕ to reorder. Delete only works on empty zones.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {zones.map((zone, idx) => {
                  const plantCount = plants.filter(p => p.zoneId === zone.id).length;
                  return (
                    <div key={zone.id} style={{ position: "relative", paddingBottom: 4 }}>
                      <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 14, zIndex: 0 }} />
                      <div style={{ position: "relative", zIndex: 1, background: "#fff", border: "2px solid #000", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                        {/* Reorder */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                          <button onClick={() => moveZone(idx, -1)} disabled={idx === 0}
                            style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", fontSize: 12, opacity: idx === 0 ? 0.3 : 1, padding: 0, lineHeight: 1 }}>▲</button>
                          <button onClick={() => moveZone(idx, 1)} disabled={idx === zones.length - 1}
                            style={{ background: "none", border: "none", cursor: idx === zones.length - 1 ? "default" : "pointer", fontSize: 12, opacity: idx === zones.length - 1 ? 0.3 : 1, padding: 0, lineHeight: 1 }}>▼</button>
                        </div>
                        {/* Name */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {editingZone === zone.id ? (
                            <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter") saveEdit(zone); if (e.key === "Escape") setEditingZone(null); }}
                              style={{ width: "100%", fontSize: 15, fontWeight: 700, border: "2px solid #a8e063", borderRadius: 8, padding: "4px 8px", fontFamily: "inherit", boxSizing: "border-box" }} />
                          ) : (
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 15 }}>{zone.name}</div>
                              <div style={{ fontSize: 12, color: "#888" }}>{plantCount} plant{plantCount !== 1 ? "s" : ""}</div>
                            </div>
                          )}
                        </div>
                        {/* Actions */}
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          {editingZone === zone.id ? (
                            <>
                              <button onClick={() => saveEdit(zone)} style={{ background: "#a8e063", border: "2px solid #000", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>✓</button>
                              <button onClick={() => setEditingZone(null)} style={{ background: "#f0f0f0", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 13 }}>✕</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(zone)} style={{ background: "none", border: "1.5px solid #ddd", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 13 }}>✏️</button>
                              <button onClick={() => deleteZone(zone)} disabled={plantCount > 0}
                                style={{ background: "none", border: "1.5px solid #ddd", borderRadius: 8, padding: "5px 10px", cursor: plantCount > 0 ? "not-allowed" : "pointer", fontSize: 13, opacity: plantCount > 0 ? 0.3 : 1, color: "#c0392b" }}>🗑</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add zone */}
              {showAddZone ? (
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <input autoFocus placeholder="Zone name..." value={newZoneName} onChange={e => setNewZoneName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addZone(); if (e.key === "Escape") setShowAddZone(false); }}
                    style={{ flex: 1, padding: "10px 12px", border: "2px solid #000", borderRadius: 10, fontSize: 14, fontFamily: "inherit" }} />
                  <button onClick={addZone} style={{ background: "#a8e063", border: "2px solid #000", borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontSize: 14, fontWeight: 800 }}>+ Add</button>
                  <button onClick={() => setShowAddZone(false)} style={{ background: "#f0f0f0", border: "none", borderRadius: 10, padding: "10px 12px", cursor: "pointer", fontSize: 14 }}>✕</button>
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <CTAButton onClick={() => setShowAddZone(true)} style={{ padding: "11px", fontSize: 14 }}>+ Add Zone</CTAButton>
                </div>
              )}
            </div>
          )}

          {/* ── Frost Dates ── */}
          {activeSection === "frost" && (
            <FrostModal frostDates={frostDates} onSave={onSaveFrost} onClose={() => {}} inline />
          )}

          {/* ── Backup ── */}
          {activeSection === "backup" && (
            <div>
              <div style={{ position: "relative", paddingBottom: 4, marginBottom: 16 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 14, zIndex: 0 }} />
                <div style={{ position: "relative", zIndex: 1, background: "#fff", border: "2px solid #000", borderRadius: 14, padding: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>📤 Export</div>
                  <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{plants.length} plants · {seeds.length} seeds</div>
                  {lastBackup && <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>Last backup: {daysSince(lastBackup) === 0 ? "today" : `${daysSince(lastBackup)} days ago`}</div>}
                  <CTAButton onClick={onExport} style={{ padding: "11px", fontSize: 14 }}>Download Backup</CTAButton>
                </div>
              </div>

              <div style={{ position: "relative", paddingBottom: 4 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 14, zIndex: 0 }} />
                <div style={{ position: "relative", zIndex: 1, background: "#fff", border: "2px solid #000", borderRadius: 14, padding: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>📥 Restore</div>
                  <label style={{ display: "block", width: "100%", padding: 12, background: "#f5f5f3", border: "2px dashed #ccc", borderRadius: 10, cursor: "pointer", fontSize: 14, textAlign: "center", color: "#555", boxSizing: "border-box" }}>
                    Choose Backup File
                    <input type="file" accept=".json" onChange={onImport} style={{ display: "none" }} />
                  </label>
                  {importError && <div style={{ marginTop: 8, fontSize: 13, color: "#c0392b", background: "#fdecea", padding: "8px 12px", borderRadius: 8 }}>⚠️ {importError}</div>}
                  {importSuccess && <div style={{ marginTop: 8, fontSize: 13, color: "#2d8a3f", background: "#f0fdf4", padding: "8px 12px", borderRadius: 8 }}>✓ Restored!</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export { SettingsPanel };
