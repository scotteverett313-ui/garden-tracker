import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, CARE_ICONS, lbl, sel, ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon, compressImage } from "../utils.js";
import { Modal } from "./Modal.jsx";
import { CTAButton } from "./CTAButton.jsx";
import { EditPlantModal } from "./EditPlantModal.jsx";
import { SplitTransplantModal, PRE_TRANSPLANT } from "./SplitTransplantModal.jsx";

function getNextWateringDate(plant) {
  const log = [...(plant.careLog || [])].filter(e => e.type === "Watering").sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!log.length) return null;
  const last = new Date(log[0].date + "T12:00:00");
  let interval = plant.wateringReminder?.intervalDays || 3;
  if (log.length >= 2) {
    const diffs = [];
    for (let i = 0; i < Math.min(log.length - 1, 3); i++) {
      const d = (new Date(log[i].date) - new Date(log[i + 1].date)) / 86400000;
      if (d > 0 && d < 21) diffs.push(d);
    }
    if (diffs.length) interval = Math.round(diffs.reduce((a, b) => a + b) / diffs.length);
  }
  const next = new Date(last);
  next.setDate(next.getDate() + interval);
  return next;
}

function nextWateringLabel(date) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}


function PlantDetailSheet({ plant, frostDates, zones, onUpdate, onDelete, onClose, onSplit, toast }) {
  const [showCompanions, setShowCompanions] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [newGood, setNewGood] = useState("");
  const [newBad, setNewBad] = useState("");
  const [careType, setCareType] = useState("Watering");
  const [careDate, setCareDate] = useState(new Date().toISOString().split("T")[0]);
  const [careNote, setCareNote] = useState("");

  const scrollRef = useRef(null);
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const photoInputRef = useRef(null);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Entrance: card slides up from below, plant fades in with parallax lag
  useEffect(() => {
    const card = cardRef.current;
    const img = imageRef.current;
    if (!card) return;

    gsap.set(card, { y: "100vh" });
    if (img) gsap.set(img, { y: 50, opacity: 0 });

    gsap.to(card, { y: 0, duration: 0.52, ease: "power3.out", clearProps: "transform" });
    if (img) gsap.to(img, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.1 });

    return () => {
      gsap.killTweensOf(card);
      if (img) gsap.killTweensOf(img);
    };
  }, []);

  // Scroll: as card rises to cover green, plant fades and drifts up
  useEffect(() => {
    const el = scrollRef.current;
    const img = imageRef.current;
    if (!el || !img) return;

    const opacityTo = gsap.quickTo(img, "opacity", { duration: 0.25, ease: "power2.out" });
    const yTo = gsap.quickTo(img, "y", { duration: 0.3, ease: "power2.out" });

    function onScroll() {
      const s = el.scrollTop;
      // Fade out over first 80px of scroll
      opacityTo(Math.max(0, 1 - s * 0.014));
      // Drift upward slightly as card covers
      yTo(-s * 0.25);
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const statusObj = STATUSES.find(s => s.label === plant.status) || STATUSES[0];
  const imageUrl = plant.imageUrl || getAutoIcon(plant.name)?.url || null;
  const harvestDate = calcHarvestDate(plant.dateStarted, plant.dtm);
  const daysLeft = harvestDate ? daysUntil(harvestDate) : null;
  const hasFrostWarning = harvestDate && frostDates?.firstFall && new Date(harvestDate) > new Date(frostDates.firstFall);
  const nextZoneIdx = ZONES.indexOf(plant.zone) + 1;
  const nextZone = nextZoneIdx < ZONES.length ? ZONES[nextZoneIdx] : null;
  const wateringEnabled = plant.wateringReminder?.enabled ?? true;
  const nextWatering = getNextWateringDate(plant);
  const wateringTime = plant.wateringReminder?.time || "8:00 AM";
  const companionCount = (plant.companions?.good?.length || 0) + (plant.companions?.bad?.length || 0);

  // ── Actions ──────────────────────────────────────────────────────────────────
  function toggleWateringReminder() {
    onUpdate({ ...plant, wateringReminder: { ...(plant.wateringReminder || {}), enabled: !wateringEnabled } });
  }

  function updateStatus(status) {
    if (status === "Harvested" || status === "Dead") {
      setPendingStatus(status); setShowEndModal(true); setShowStatusPicker(false); return;
    }
    onUpdate({ ...plant, status });
    setShowStatusPicker(false);
    const s = STATUSES.find(x => x.label === status);
    toast?.(`${plant.name} → ${status}`, { icon: s?.icon });
  }

  function addCareEntry() {
    const entry = { id: generateId(), type: careType, date: careDate, notes: careNote };
    onUpdate({ ...plant, careLog: [...(plant.careLog || []), entry] });
    setCareNote("");
    const icons = { Watering: ICONS.water, Fertilizing: ICONS.water, Pruning: ICONS.settings, "Pest Treatment": ICONS.settings, Observation: ICONS.edit };
    toast?.(`${careType} logged`, { icon: icons[careType] || "✓" });
  }

  function deleteCareEntry(id) {
    onUpdate({ ...plant, careLog: (plant.careLog || []).filter(e => e.id !== id) });
  }

  function addCompanion(type) {
    const val = type === "good" ? newGood.trim() : newBad.trim();
    if (!val) return;
    onUpdate({ ...plant, companions: { ...plant.companions, [type]: [...(plant.companions?.[type] || []), val] } });
    type === "good" ? setNewGood("") : setNewBad("");
    toast?.(`${val} added`, { icon: ICONS.growing });
  }

  function removeCompanion(type, item) {
    onUpdate({ ...plant, companions: { ...plant.companions, [type]: (plant.companions?.[type] || []).filter(c => c !== item) } });
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImage(file);
    onUpdate({ ...plant, photoUrl: dataUrl });
    e.target.value = "";
  }

  function toggleFavorite() {
    onUpdate({ ...plant, favorite: !plant.favorite });
    toast?.(plant.favorite ? "Removed from favorites" : `${plant.name} favorited`, { icon: plant.favorite ? ICONS.favorite : ICONS.favActive });
  }

  // ── UI ────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Green backdrop — plant sprite lives here ─────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, background: "#a8e063", zIndex: 1000 }}>

        {/* Plant sprite centered in green zone — optionally with user photo behind it */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "30vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "env(safe-area-inset-top, 20px)", pointerEvents: "none" }}>
          {plant.photoUrl && (
            <>
              <img src={plant.photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to bottom, transparent, #a8e063)" }} />
            </>
          )}
          <div ref={imageRef} style={{ position: "relative", zIndex: 1 }}>
            {imageUrl
              ? <img src={imageUrl} alt={plant.name} style={{ width: 110, height: 110, objectFit: "contain", imageRendering: "pixelated", display: "block" }} />
              : <img src={statusObj.img} alt={statusObj.label} style={{ width: 80, height: 80, objectFit: "contain", display: "block" }} />
            }
          </div>
        </div>

        {/*
          Scroll container — transparent, full screen.
          Contains a phantom gap (30vh) then the white card.
          Scrolling naturally slides the card up to cover the green.
        */}
        <div
          ref={scrollRef}
          onClick={e => e.target === e.currentTarget && onClose()}
          style={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden" }}
        >
          {/* Transparent phantom gap — reveals green backdrop above card */}
          <div style={{ height: "30vh", flexShrink: 0, position: "relative" }}>
            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
            <button
              onClick={() => photoInputRef.current?.click()}
              style={{ position: "absolute", bottom: 10, right: 14, display: "flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,0.45)", border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: 99, padding: "5px 11px", cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 700, backdropFilter: "blur(4px)" }}>
              📷 {plant.photoUrl ? "Change" : "Add Photo"}
            </button>
          </div>

          {/* White card — slides up on entrance, scrolls to cover green */}
          <div
            ref={cardRef}
            style={{ minHeight: "100vh", background: "#fff", borderRadius: "20px 20px 0 0", position: "relative" }}
          >
            <div style={{ borderRadius: "20px 20px 0 0", paddingBottom: 4 }}>
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
                <div style={{ width: 36, height: 4, background: "#e0e0e0", borderRadius: 99 }} />
              </div>
            {/* Navigation row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px 4px" }}>
              <div style={{ position: "relative", paddingBottom: 3 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 3, bottom: 0, background: "#000", borderRadius: "50%", zIndex: 0 }} />
                <button onClick={onClose} style={{ position: "relative", zIndex: 1, width: 40, height: 40, borderRadius: "50%", background: "#a8e063", border: "2.5px solid #000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={ICONS.exit} alt="Back" style={{ width: 18, height: 18, objectFit: "contain" }} />
                </button>
              </div>
              <div style={{ position: "relative", paddingBottom: 3 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 3, bottom: 0, background: "#000", borderRadius: "50%", zIndex: 0 }} />
                <button onClick={toggleFavorite} style={{ position: "relative", zIndex: 1, width: 40, height: 40, borderRadius: "50%", background: "#fff", border: "2.5px solid #000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={plant.favorite ? ICONS.favActive : ICONS.favorite} alt="Favorite" style={{ width: 20, height: 20, objectFit: "contain" }} />
                </button>
              </div>
            </div>
            </div>{/* end sticky header */}

            {/* Plant name + variety */}
            <div style={{ textAlign: "center", padding: "8px 16px 20px" }}>
              <h2 style={{ margin: "0 0 3px", fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>{plant.name}</h2>
              {plant.variety && <div style={{ color: "#888", fontSize: 14 }}>({plant.variety})</div>}
            </div>

            {/* ── Content sections ── */}
            <div style={{ padding: "0 16px 48px", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Next Watering */}
              {nextWatering && (
                <div style={{ position: "relative", paddingBottom: 4 }}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: "var(--radius-card-sm)", zIndex: 0 }} />
                  <div style={{ position: "relative", zIndex: 1, background: "#fff", border: "2px solid #000", borderRadius: "var(--radius-card-sm)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 52, height: 52, background: "#e8f4ff", borderRadius: "var(--radius-icon)", border: "1.5px solid #cce0ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <img src={ICONS.water} alt="Water" style={{ width: 28, height: 28, objectFit: "contain" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 1 }}>Next Watering</div>
                      <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1, color: wateringEnabled ? "#000" : "#aaa" }}>{nextWateringLabel(nextWatering)}</div>
                      <div style={{ fontSize: 14, color: wateringEnabled ? "#555" : "#bbb", fontWeight: 500 }}>{wateringTime}</div>
                    </div>
                    <button onClick={toggleWateringReminder}
                      style={{ flexShrink: 0, background: wateringEnabled ? "#000" : "#ddd", border: "none", borderRadius: 99, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 800, color: wateringEnabled ? "#fff" : "#999", letterSpacing: 0.5 }}>
                      {wateringEnabled ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>
              )}

              {/* Growing Overview */}
              <div style={{ border: "1.5px solid #e8e8e8", borderRadius: "var(--radius-card-sm)", padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>Growing Overview</span>
                  {plant.dateStarted && <span style={{ fontSize: 12, color: "#888" }}>Started {formatDate(plant.dateStarted)}</span>}
                </div>
                {(plant.water || plant.sun) && (
                  <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                    {plant.water && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "1.5px solid #000", borderRadius: 99, padding: "4px 10px", fontSize: 12, fontWeight: 600 }}>
                        <img src={ICONS.water} alt="" style={{ width: 13, height: 13, objectFit: "contain" }} />{plant.water}
                      </span>
                    )}
                    {plant.sun && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "1.5px solid #000", borderRadius: 99, padding: "4px 10px", fontSize: 12, fontWeight: 600 }}>
                        <img src={ICONS.sun} alt="" style={{ width: 13, height: 13, objectFit: "contain" }} />{plant.sun}
                      </span>
                    )}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px", marginBottom: 14 }}>
                  {[
                    { label: "Status", value: plant.status },
                    { label: "Zone", value: plant.zone.replace(" Grow Station", "").replace("In-Ground Beds", "In-Ground") },
                    { label: "Quantity", value: plant.quantity || "—" },
                    { label: "Days to Harvest", value: daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} days` : "Ready!") : "—" },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: nextZone || (PRE_TRANSPLANT.includes(plant.status) && parseInt(plant.quantity) > 1) ? 10 : 0 }}>
                  <button onClick={() => setShowStatusPicker(v => !v)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, background: STATUS_COLORS[plant.status] || "#eee", border: "1.5px solid rgba(0,0,0,0.15)", borderRadius: 99, padding: "5px 12px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    <img src={statusObj.img} alt="" style={{ width: 14, height: 14, objectFit: "contain" }} />
                    {plant.status} <span style={{ fontSize: 10, opacity: 0.5 }}>▾</span>
                  </button>
                  {showStatusPicker && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {STATUSES.map(s => (
                        <button key={s.label} onClick={() => updateStatus(s.label)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, background: s.label === plant.status ? STATUS_COLORS[s.label] : "#fff", border: `1px solid ${s.label === plant.status ? "#bbb" : "#e0e0e0"}`, borderRadius: 99, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontWeight: s.label === plant.status ? 700 : 400 }}>
                          <img src={s.img} alt="" style={{ width: 13, height: 13, objectFit: "contain" }} />{s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {nextZone && (
                  <button onClick={() => { onUpdate({ ...plant, zone: nextZone }); toast?.(`Moved to ${nextZone.split(" ")[0]}`, { icon: ICONS.zone }); }}
                    style={{ width: "100%", padding: "10px 14px", background: "#fff", border: "2px solid #000", borderRadius: "var(--radius-input)", cursor: "pointer", fontSize: 13, fontWeight: 700, textAlign: "left" }}>
                    › Move to {nextZone}
                  </button>
                )}
                {PRE_TRANSPLANT.includes(plant.status) && parseInt(plant.quantity) > 1 && (
                  <button onClick={() => setShowSplit(true)}
                    style={{ marginTop: 8, width: "100%", padding: "10px 14px", background: "#edffe5", border: "2px solid #000", borderRadius: "var(--radius-input)", cursor: "pointer", fontSize: 13, fontWeight: 700, textAlign: "left", display: "flex", alignItems: "center", gap: 6 }}>
                    <img src={ICONS.growing} style={{width:14,height:14,objectFit:"contain"}} alt="" />Split & Transplant ({plant.quantity} plants)
                  </button>
                )}
              </div>

              {/* Frost warning */}
              {hasFrostWarning && (
                <div style={{ background: "#e8f0ff", borderRadius: "var(--radius-input)", padding: "10px 14px", fontSize: 13, color: "#3a5aaa", fontWeight: 500 }}>
                  <img src={ICONS.harvest} alt="" style={{ width: 16, height: 16, objectFit: "contain", marginRight: 5, verticalAlign: "middle" }} />Harvest may conflict with fall frost ({formatDate(frostDates.firstFall)})
                </div>
              )}

              {/* About */}
              {(plant.about || plant.notes) && (
                <div style={{ fontSize: 14, color: "#555", lineHeight: 1.65 }}>
                  {plant.about || plant.notes}
                </div>
              )}

              {/* Companion Plants */}
              <div>
                <button onClick={() => setShowCompanions(v => !v)}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f5f5f3", border: "none", borderRadius: showCompanions ? "var(--radius-input) var(--radius-input) 0 0" : "var(--radius-input)", padding: "12px 14px", cursor: "pointer", fontSize: 14, fontWeight: 600, textAlign: "left" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}><img src={ICONS.growing} style={{width:14,height:14,objectFit:"contain"}} alt="" />Companion Plants{companionCount > 0 ? ` (${companionCount})` : ""}</span>
                  <span style={{ color: "#aaa", fontSize: 12 }}>{showCompanions ? "▲" : "▼"}</span>
                </button>
                {showCompanions && (
                  <div style={{ background: "#f5f5f3", borderRadius: "0 0 var(--radius-input) var(--radius-input)", padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {["good", "bad"].map(type => (
                      <div key={type}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: type === "good" ? "#2d8a3f" : "#c0392b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {type === "good" ? "✓ Plant with" : "✗ Avoid near"}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                          {(plant.companions?.[type] || []).map(c => (
                            <span key={c} style={{ background: type === "good" ? "#e6f9e6" : "#fdecea", color: type === "good" ? "#2d8a3f" : "#c0392b", fontSize: 12, padding: "3px 8px", borderRadius: 99, display: "inline-flex", alignItems: "center", gap: 4, border: `1px solid ${type === "good" ? "#b2dfb2" : "#f5c6c6"}` }}>
                              {c}
                              <button onClick={() => removeCompanion(type, c)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>
                            </span>
                          ))}
                          {!(plant.companions?.[type]?.length) && <span style={{ fontSize: 12, color: "#bbb" }}>None added</span>}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <input
                            value={type === "good" ? newGood : newBad}
                            onChange={e => type === "good" ? setNewGood(e.target.value) : setNewBad(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && addCompanion(type)}
                            placeholder={type === "good" ? "Add companion..." : "Add to avoid..."}
                            style={{ flex: 1, padding: "8px 10px", border: "1.5px solid #ddd", borderRadius: "var(--radius-sm)", fontSize: 13, fontFamily: "inherit", background: "#fff" }}
                          />
                          <button onClick={() => addCompanion(type)}
                            style={{ background: type === "good" ? "#2d8a3f" : "#c0392b", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", padding: "8px 14px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Care Log */}
              <div>
                <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: -0.3, marginBottom: 14 }}>Care Log</div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Type</div>
                      <select value={careType} onChange={e => setCareType(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "var(--radius-input)", fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", background: "#fff" }}>
                        {CARE_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Date</div>
                      <input type="date" value={careDate} onChange={e => setCareDate(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "var(--radius-input)", fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
                    </div>
                  </div>
                  <textarea placeholder="Notes (optional)..." value={careNote} onChange={e => setCareNote(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: "var(--radius-input)", fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", minHeight: 72, resize: "vertical", marginBottom: 10 }} />
                  <CTAButton onClick={addCareEntry} style={{ padding: 13, fontSize: 15 }}>+ Log Care</CTAButton>
                </div>
                {(!plant.careLog || plant.careLog.length === 0) ? (
                  <p style={{ textAlign: "center", color: "#bbb", fontSize: 14, margin: "8px 0 0" }}>No care entries yet.</p>
                ) : (
                  <div>
                    {[...(plant.careLog || [])].reverse().map(entry => (
                      <div key={entry.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
                        <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2, width: 20, textAlign: "center", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          {entry.type === "Watering"
                            ? <img src={ICONS.water} style={{ width: 16, height: 16, objectFit: "contain" }} alt="" />
                            : entry.type === "Fertilizing"
                            ? <img src={ICONS.water} style={{ width: 16, height: 16, objectFit: "contain" }} alt="" />
                            : entry.type === "Pruning" || entry.type === "Pest Treatment"
                            ? <img src={ICONS.settings} style={{ width: 16, height: 16, objectFit: "contain" }} alt="" />
                            : <img src={ICONS.edit} style={{ width: 16, height: 16, objectFit: "contain" }} alt="" />}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>
                            {entry.type} <span style={{ color: "#aaa", fontWeight: 400, fontSize: 12 }}>· {formatDate(entry.date)}</span>
                          </div>
                          {entry.notes && <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{entry.notes}</div>}
                        </div>
                        <button onClick={() => deleteCareEntry(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 20, flexShrink: 0, padding: 0, lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit Plant */}
              <button onClick={() => setShowEdit(true)}
                style={{ width: "100%", padding: "13px 16px", background: "#fff", border: "2px solid #000", borderRadius: "var(--radius-input)", cursor: "pointer", fontSize: 14, fontWeight: 700, textAlign: "left" }}>
                › Edit Plant
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-modals ────────────────────────────────────────────────────────── */}
      {showEdit && (
        <EditPlantModal
          plant={plant} zones={zones}
          onSave={updated => { onUpdate(updated); toast?.(`${updated.name} updated`, { icon: ICONS.edit }); }}
          onClose={() => setShowEdit(false)}
          onDelete={id => { onDelete(id); onClose(); toast?.("Plant removed", { type: "warning", icon: ICONS.trash }); }}
        />
      )}
      {showSplit && (
        <SplitTransplantModal
          plant={plant} zones={zones}
          onSplit={(updatedOriginal, newPlants) => { onSplit(updatedOriginal, newPlants); setShowSplit(false); onClose(); }}
          onClose={() => setShowSplit(false)}
        />
      )}
      {showEndModal && (
        <Modal onClose={() => setShowEndModal(false)} width={420}>
          <div style={{ textAlign: "center", paddingBottom: 8 }}>
            <div style={{ marginBottom: 10 }}>{pendingStatus === "Harvested" ? <img src={ICONS.harvested} style={{width:40,height:40,objectFit:"contain"}} alt="" /> : <img src={ICONS.dead} style={{width:40,height:40,objectFit:"contain"}} alt="" />}</div>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}>{pendingStatus === "Harvested" ? "Mark as Harvested?" : "Mark as Dead?"}</h2>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>{pendingStatus === "Harvested" ? `${plant.name} is done for this season.` : `${plant.name} didn't make it.`}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => { onUpdate({ ...plant, status: pendingStatus, harvestedAt: new Date().toISOString() }); setShowEndModal(false); onClose(); toast?.(`${plant.name} marked as ${pendingStatus}`, { icon: pendingStatus === "Harvested" ? ICONS.harvested : ICONS.dead }); }}
              className="btn-cta" style={{ padding: 13, background: "#a8e063", color: "#000", border: "2px solid #000", borderRadius: "var(--radius-btn)", cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
              {pendingStatus === "Harvested"
                ? <><img src={ICONS.harvested} style={{width:20,height:20,objectFit:"contain",marginRight:8,verticalAlign:"middle"}} alt="" />Confirm Harvested</>
                : <><img src={ICONS.dead} style={{width:20,height:20,objectFit:"contain",marginRight:8,verticalAlign:"middle"}} alt="" />Confirm Dead</>
              } — Keep record
            </button>
            <button onClick={() => { onDelete(plant.id); setShowEndModal(false); onClose(); toast?.(`${plant.name} removed`, { type: "warning", icon: ICONS.trash }); }}
              style={{ padding: 13, background: "#fff", color: "#c0392b", border: "1.5px solid #c0392b", borderRadius: "var(--radius-icon)", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
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
