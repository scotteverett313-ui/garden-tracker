import { useState } from "react";
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, lbl, sel, ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon } from "../utils.js";
import { Modal } from "./Modal.jsx";
import { CTAButton } from "./CTAButton.jsx";
import { EditPlantModal } from "./EditPlantModal.jsx";

function PlantDetailSheet({ plant, frostDates, zones, onUpdate, onDelete, onClose, toast }) {
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
  const [remindersOn, setRemindersOn] = useState(false);

  const statusObj = STATUSES.find(s => s.label === plant.status) || STATUSES[0];
  const harvestDate = calcHarvestDate(plant.dateStarted, plant.dtm);
  const daysLeft = harvestDate ? daysUntil(harvestDate) : null;
  const hasFrostWarning = harvestDate && frostDates?.firstFall && new Date(harvestDate) > new Date(frostDates.firstFall);
  const imageUrl = plant.imageUrl || getAutoIcon(plant.name)?.url || null;

  const currentZoneIdx = zones.findIndex(z => z.name === plant.zone);
  const nextZone = currentZoneIdx >= 0 && currentZoneIdx < zones.length - 1 ? zones[currentZoneIdx + 1] : null;

  const lastWatered = [...(plant.careLog || [])].filter(e => e.type === "Watering").sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const lastWateredDays = lastWatered ? daysSince(lastWatered.date) : null;
  function getWateringLabel() {
    if (!lastWatered) return { label: "Not yet watered", sub: "Log your first watering below" };
    if (lastWateredDays === 0) return { label: "Tomorrow", sub: "Watered today — great job!" };
    if (lastWateredDays === 1) return { label: "Today", sub: "Watered yesterday" };
    if (lastWateredDays <= 3) return { label: "Soon", sub: `Watered ${lastWateredDays} days ago` };
    return { label: "Overdue", sub: `${lastWateredDays} days since last watering` };
  }
  const watering = getWateringLabel();

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

  const CARE_ICONS = { Watering: "💧", Fertilizing: "🌿", Pruning: "✂️", "Pest Treatment": "🐛", Observation: "👁" };

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", flexDirection: "column", fontFamily: "'Cabin', system-ui, sans-serif" }}>
        {/* Green hero */}
        <div style={{ background: "#a8e063", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingTop: "max(env(safe-area-inset-top), 20px)", paddingBottom: 40, minHeight: "36vh" }}>
          {imageUrl ? (
            <img src={imageUrl} alt={plant.name} style={{ width: 130, height: 130, objectFit: "contain", imageRendering: "pixelated", marginBottom: 14 }} />
          ) : (
            <img src={statusObj.img} alt={statusObj.label} style={{ width: 80, height: 80, objectFit: "contain", marginBottom: 14 }} />
          )}
        </div>

        {/* White bottom card */}
        <div style={{ flex: 1, background: "#faf6f0", borderRadius: "24px 24px 0 0", marginTop: -24, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Top nav row — back + drag handle + heart */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 4px", flexShrink: 0 }}>
            <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: "50%", background: "#a8e063", border: "none", cursor: "pointer", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
            <div style={{ width: 40, height: 4, background: "#ddd", borderRadius: 999 }} />
            <button onClick={toggleFavorite} style={{ width: 40, height: 40, borderRadius: "50%", background: "#a8e063", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={plant.favorite ? ICONS.favActive : ICONS.favorite} alt="Favorite" style={{ width: 20, height: 20, objectFit: "contain" }} />
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "6px 16px calc(env(safe-area-inset-bottom) + 32px)" }}>
            {/* Plant name + variety */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: -0.5 }}>{plant.name}</div>
              {plant.variety && <div style={{ fontSize: 14, color: "#888", marginTop: 2 }}>({plant.variety})</div>}
            </div>

            {/* Next Watering card */}
            <div style={{ background: "#fff", border: "2px solid #000", borderRadius: 18, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, background: "#ddf0ff", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <img src={ICONS.water} alt="water" style={{ width: 28, height: 28, objectFit: "contain" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 1 }}>Next Watering</div>
                <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1.1 }}>{watering.label}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>{watering.sub}</div>
              </div>
              <button onClick={() => setRemindersOn(v => !v)}
                style={{ background: remindersOn ? "#000" : "#e0e0e0", borderRadius: 999, padding: "5px 14px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 800, color: remindersOn ? "#fff" : "#888", flexShrink: 0, fontFamily: "inherit" }}>
                {remindersOn ? "ON" : "OFF"}
              </button>
            </div>

            {/* Growing Overview */}
            <div style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>Growing Overview</span>
                {plant.dateStarted && <span style={{ fontSize: 12, color: "#aaa" }}>Started {formatDate(plant.dateStarted)}</span>}
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                {plant.water && <span style={{ border: "1.5px solid #e8e8e8", borderRadius: 20, padding: "4px 12px", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}><img src={ICONS.water} alt="" style={{ width: 14, height: 14 }} /> {plant.water}</span>}
                {plant.sun && <span style={{ border: "1.5px solid #e8e8e8", borderRadius: 20, padding: "4px 12px", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}><img src={ICONS.sun} alt="" style={{ width: 14, height: 14 }} /> {plant.sun}</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 8px" }}>
                {[
                  { label: "Status", value: plant.status },
                  { label: "Zone", value: (plant.zone || "").replace(" Grow Station", "").replace("In-Ground Beds", "In-Ground") },
                  { label: "Quantity", value: plant.quantity || "—" },
                  { label: "Days to Harvest", value: daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} days` : "Ready!") : (plant.dtm ? `${plant.dtm}d` : "—") },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, borderTop: "1px solid #f0f0f0", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => setShowStatusPicker(v => !v)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: STATUS_COLORS[plant.status] || "#eee", border: "none", borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, alignSelf: "flex-start", fontFamily: "inherit" }}>
                  <img src={statusObj.img} alt="" style={{ width: 16, height: 16 }} /> {plant.status} <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
                </button>
                {showStatusPicker && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {STATUSES.map(s => (
                      <button key={s.label} onClick={() => updateStatus(s.label)}
                        style={{ background: s.label === plant.status ? STATUS_COLORS[s.label] : "#fff", border: `1px solid ${s.label === plant.status ? "#bbb" : "#e0e0e0"}`, borderRadius: 20, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontWeight: s.label === plant.status ? 700 : 400, fontFamily: "inherit" }}>
                        <img src={s.img} alt="" style={{ width: 14, height: 14, verticalAlign: "middle" }} /> {s.label}
                      </button>
                    ))}
                  </div>
                )}
                {nextZone && (
                  <button onClick={() => { onUpdate({ ...plant, zone: nextZone.name }); toast && toast(`Moved to ${nextZone.name.split(" ")[0]}`, { icon: "📍" }); }}
                    style={{ width: "100%", padding: "10px 14px", background: "#f5f5f3", border: "1.5px solid #e0e0e0", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700, textAlign: "left", fontFamily: "inherit" }}>
                    ⟫ Move to {nextZone.name.replace(" Grow Station", "")}
                  </button>
                )}
              </div>
            </div>

            {/* Frost warning */}
            {hasFrostWarning && (
              <div style={{ background: "#e8f0ff", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#3a5aaa", marginBottom: 14 }}>
                ❄️ Harvest may conflict with fall frost ({formatDate(frostDates.firstFall)})
              </div>
            )}

            {/* About */}
            {plant.about && (
              <div style={{ background: "#fff", borderRadius: 14, padding: 14, fontSize: 14, color: "#555", lineHeight: 1.6, marginBottom: 14 }}>
                {plant.about}
              </div>
            )}
            {plant.notes && <div style={{ fontSize: 13, color: "#666", marginBottom: 14, lineHeight: 1.4, padding: "0 2px" }}>{plant.notes}</div>}

            {/* Companion Plants (collapsible) */}
            <button onClick={() => setShowCompanions(v => !v)}
              style={{ width: "100%", background: "#fff", border: "none", borderRadius: showCompanions ? "14px 14px 0 0" : 14, padding: "12px 14px", cursor: "pointer", fontSize: 14, fontWeight: 700, textAlign: "left", marginBottom: showCompanions ? 0 : 14, display: "flex", justifyContent: "space-between", fontFamily: "inherit" }}>
              <span>🌿 Companion Plants {(plant.companions?.good?.length || 0) + (plant.companions?.bad?.length || 0) > 0 ? `(${(plant.companions?.good?.length || 0) + (plant.companions?.bad?.length || 0)})` : ""}</span>
              <span style={{ color: "#aaa" }}>{showCompanions ? "▲" : "▼"}</span>
            </button>
            {showCompanions && (
              <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", padding: "0 14px 14px", marginBottom: 14 }}>
                {["good", "bad"].map(type => (
                  <div key={type} style={{ marginBottom: type === "good" ? 12 : 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: type === "good" ? "#2d6a2d" : "#c0392b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {type === "good" ? "✓ Plant with" : "✗ Avoid near"}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                      {(plant.companions?.[type] || []).map(c => (
                        <span key={c} style={{ background: type === "good" ? "#e8f5e8" : "#fdecea", color: type === "good" ? "#2d6a2d" : "#c0392b", fontSize: 12, padding: "3px 8px", borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
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
                        style={{ flex: 1, padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }} />
                      <button onClick={() => addCompanion(type)}
                        style={{ background: type === "good" ? "#a8e063" : "#c0392b", color: type === "good" ? "#000" : "#fff", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Care Log */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: -0.5, marginBottom: 14 }}>Care Log</div>
              <div style={{ background: "#fff", borderRadius: 16, padding: 14, marginBottom: 12 }}>
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
                  style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", minHeight: 70, resize: "none", marginBottom: 10 }} />
                <CTAButton onClick={addCareEntry} style={{ padding: "12px", fontSize: 15 }}>+ Log Care</CTAButton>
              </div>

              {(plant.careLog?.length || 0) === 0 ? (
                <p style={{ textAlign: "center", color: "#bbb", fontSize: 14, margin: "8px 0" }}>No care entries yet.</p>
              ) : (
                <div>
                  {[...(plant.careLog || [])].reverse().map(entry => (
                    <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 20 }}>{CARE_ICONS[entry.type] || "✓"}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{entry.type} <span style={{ color: "#aaa", fontWeight: 400, fontSize: 13 }}>· {formatDate(entry.date)}</span></div>
                          {entry.notes && <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{entry.notes}</div>}
                        </div>
                      </div>
                      <button onClick={() => deleteCareEntry(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 20, padding: 4 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edit button */}
            <button onClick={() => setShowEdit(true)}
              style={{ width: "100%", padding: "14px", background: "#fff", border: "2px solid #000", borderRadius: 14, cursor: "pointer", fontSize: 15, fontWeight: 800, fontFamily: "inherit" }}>
              ⟫ Edit Plant
            </button>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditPlantModal
          plant={plant} zones={zones}
          onSave={updated => { onUpdate(updated); toast && toast(`${updated.name} updated`, { icon: "✏️" }); }}
          onClose={() => setShowEdit(false)}
          onDelete={id => { onDelete(id); onClose(); toast && toast("Plant removed", { type: "warning", icon: "🗑" }); }}
        />
      )}

      {showEndModal && (
        <Modal onClose={() => setShowEndModal(false)} width={420}>
          <div style={{ textAlign: "center", paddingBottom: 8 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>{pendingStatus === "Harvested" ? "✅" : "🪦"}</div>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}>{pendingStatus === "Harvested" ? "Mark as Harvested?" : "Mark as Dead?"}</h2>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>{pendingStatus === "Harvested" ? `${plant.name} is done for this season.` : `${plant.name} didn't make it.`}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => { onUpdate({ ...plant, status: pendingStatus, harvestedAt: new Date().toISOString() }); setShowEndModal(false); onClose(); toast && toast(`${plant.name} marked as ${pendingStatus}`, { icon: pendingStatus === "Harvested" ? "✅" : "🪦" }); }}
              style={{ padding: 13, background: "#a8e063", color: "#000", border: "2px solid #000", borderRadius: 12, cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "inherit" }}>
              {pendingStatus === "Harvested" ? "✅ Confirm Harvested" : "🪦 Confirm Dead"} — Keep record
            </button>
            <button onClick={() => { onDelete(plant.id); setShowEndModal(false); onClose(); toast && toast(`${plant.name} removed`, { type: "warning", icon: "🗑" }); }}
              style={{ padding: 13, background: "#fff", color: "#c0392b", border: "1.5px solid #c0392b", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>
              🗑 Remove from Garden
            </button>
            <button onClick={() => setShowEndModal(false)} style={{ padding: 11, background: "none", color: "#888", border: "none", cursor: "pointer", fontSize: 14 }}>Cancel</button>
          </div>
        </Modal>
      )}
    </>
  );
}

export { PlantDetailSheet };
