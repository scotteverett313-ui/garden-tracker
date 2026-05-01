import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, CARE_ICONS, PLANT_DB, COMPANION_DB, CALENDAR_DATA, MONTHS, ICON_LIBRARY, lbl, sel, ZONES, DEFAULT_ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon } from "../utils.js";
import { Modal } from "./Modal.jsx";
import { CTAButton } from "./CTAButton.jsx";

function lastWateredLabel(careLog) {
  const entry = [...(careLog || [])].filter(e => e.type === "Watering").sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  if (!entry) return null;
  const d = daysSince(entry.date);
  if (d === 0) return { label: "today", color: "#2d8a3f" };
  if (d === 1) return { label: "yesterday", color: "#2d8a3f" };
  if (d <= 3) return { label: `${d}d ago`, color: "#888" };
  if (d <= 6) return { label: `${d}d ago`, color: "#d4820a" };
  return { label: `${d}d ago`, color: "#c0392b" };
}

function useSpriteAnim(status, onTap) {
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const delay = Math.random() * 2;
    let tl;

    switch (status) {
      case "Seed":
      case "Dormant":
        tl = gsap.timeline({ repeat: -1, yoyo: true, delay })
          .to(img, { scale: 1.07, duration: 1.4, ease: "sine.inOut" });
        break;
      case "Germinating":
        tl = gsap.timeline({ repeat: -1, yoyo: true, delay })
          .to(img, { scale: 1.1, duration: 1.6, ease: "sine.inOut" });
        break;
      case "Seedling":
      case "Transplanted":
        gsap.set(img, { transformOrigin: "bottom center" });
        tl = gsap.timeline({ repeat: -1, yoyo: true, delay })
          .to(img, { rotation: 4, duration: 1.5, ease: "sine.inOut" });
        break;
      case "Growing":
        tl = gsap.timeline({ repeat: -1, yoyo: true, delay })
          .to(img, { y: -6, duration: 1.8, ease: "sine.inOut" });
        break;
      case "Flowering":
        gsap.set(img, { transformOrigin: "bottom center" });
        tl = gsap.timeline({ repeat: -1, yoyo: true, delay })
          .to(img, { rotation: 5, duration: 1.1, ease: "sine.inOut" });
        break;
      case "Fruiting":
        tl = gsap.timeline({ repeat: -1, yoyo: true, delay })
          .to(img, { y: -5, duration: 2.0, ease: "sine.inOut" });
        break;
      case "Harvesting":
        tl = gsap.timeline({ repeat: -1, delay })
          .to(img, { y: -8, duration: 0.45, ease: "power2.out" })
          .to(img, { y: 0, duration: 0.4, ease: "bounce.out" })
          .to(img, { duration: 1.0 });
        break;
      case "Dead":
        gsap.set(img, { rotation: -14, transformOrigin: "bottom center" });
        return () => gsap.set(img, { rotation: 0, transformOrigin: "50% 50%" });
      case "Harvested":
        tl = gsap.timeline({ repeat: -1, yoyo: true, delay })
          .to(img, { scale: 1.04, duration: 2.2, ease: "sine.inOut" });
        break;
      default:
        tl = gsap.timeline({ repeat: -1, yoyo: true, delay })
          .to(img, { y: -4, duration: 2.0, ease: "sine.inOut" });
    }

    return () => { if (tl) tl.kill(); gsap.set(img, { y: 0, scale: 1, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, transformOrigin: "50% 50%" }); };
  }, [status]);

  function handleTap() {
    const img = imgRef.current;
    if (img) {
      gsap.timeline()
        .to(img, { scaleX: 1.3, scaleY: 0.7, duration: 0.08, ease: "power2.out" })
        .to(img, { scaleX: 0.9, scaleY: 1.15, duration: 0.08 })
        .to(img, { scaleX: 1, scaleY: 1, duration: 0.2, ease: "elastic.out(1, 0.4)" });
    }
    onTap();
  }

  return { imgRef, handleTap };
}

function PlantGridCard({ plant, onTap, onWater, showZone }) {
  const harvestDate = calcHarvestDate(plant.dateStarted, plant.dtm);
  const daysLeft = harvestDate ? daysUntil(harvestDate) : null;
  const isDone = plant.status === "Harvested" || plant.status === "Dead";
  const imageUrl = plant.imageUrl || getAutoIcon(plant.name)?.url || null;
  const statusObj = STATUSES.find(s => s.label === plant.status) || STATUSES[0];
  const watered = lastWateredLabel(plant.careLog);
  const { imgRef, handleTap } = useSpriteAnim(plant.status, onTap);

  return (
    // Offset shadow wrapper — paddingBottom gives shadow room so it doesn't bleed into next card
    <div className="plant-card-wrap" style={{ position: "relative", opacity: isDone ? 0.5 : 1, paddingBottom: 4, alignSelf: "start" }}>
      {/* Black shadow layer */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 'var(--radius-card)', zIndex: 0 }} />
      {/* Main card on top */}
      <button onClick={handleTap} className="plant-card" style={{ position: "relative", zIndex: 1, background: "#fff", border: "2px solid #000", borderRadius: 'var(--radius-card)', padding: 12, cursor: "pointer", textAlign: "left", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 0 }}>

        {/* Row 1 — Harvest info + menu button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#000" }}>
              {daysLeft !== null ? (daysLeft <= 0 ? <><img src={ICONS.harvest} alt="" style={{ width: 14, height: 14, objectFit: "contain", marginRight: 3, verticalAlign: "middle" }} />Ready!</> : "Harvest in:") : "Started:"}
            </div>
            <div style={{ fontSize: 12, color: daysLeft !== null && daysLeft <= 14 ? "#c0392b" : "#888", fontWeight: 500 }}>
              {daysLeft !== null
                ? (daysLeft <= 0 ? "Harvest now" : `${daysLeft} days - ${formatDate(harvestDate)}`)
                : (plant.dateStarted ? formatDate(plant.dateStarted) : plant.status)}
            </div>
          </div>
          <div style={{ width: 32, height: 32, border: "1.5px solid #e0e0e0", borderRadius: 'var(--radius-sm)', display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <img src={ICONS.menu} alt="Menu" style={{ width: 16, height: 16, objectFit: "contain" }} />
          </div>
        </div>
        {/* Harvest progress bar */}
        {plant.dateStarted && !isDone && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ height: 5, background: "#ebebeb", borderRadius: 'var(--radius-pill)', overflow: "hidden" }}>
              {plant.dtm && (
                <div style={{
                  height: "100%",
                  width: `${Math.min(100, Math.max(2, (daysSince(plant.dateStarted) / parseInt(plant.dtm)) * 100))}%`,
                  background: daysLeft !== null && daysLeft <= 0 ? "#2d8a3f" : daysLeft !== null && daysLeft <= 14 ? "#c0392b" : "#a8e063",
                  borderRadius: 'var(--radius-pill)',
                  transition: "width 0.3s ease",
                }} />
              )}
            </div>
          </div>
        )}

        {/* Row 2 — Pixel art image centered */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 80, marginBottom: 10 }}>
          {imageUrl
            ? <img ref={imgRef} src={imageUrl} alt={plant.name} style={{ width: 70, height: 70, objectFit: "contain", imageRendering: "pixelated" }} />
            : <img ref={imgRef} src={statusObj.img} alt={statusObj.label} style={{ width: 52, height: 52, objectFit: "contain" }} />
          }
        </div>

        {/* Row 3 — Status icon + plant name + quantity */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <img src={statusObj.img} alt={statusObj.label} style={{ width: 16, height: 16, objectFit: "contain" }} />
          <span style={{ fontWeight: 800, fontSize: 15, color: "#000", lineHeight: 1.2 }}>{plant.name}</span>
          {plant.quantity > 1 && (
            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 6, padding: "1px 6px", color: "#666", flexShrink: 0 }}>×{plant.quantity}</span>
          )}
        </div>

        {/* Row 4 — Variety + last watered */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
          {plant.variety && <div style={{ fontSize: 12, color: "#666" }}>({plant.variety})</div>}
          {watered && <div style={{ fontSize: 11, color: watered.color, fontWeight: 600, marginLeft: "auto", display: "flex", alignItems: "center" }}><img src={ICONS.water} style={{ width: 11, height: 11, objectFit: "contain", marginRight: 3 }} alt="" />{watered.label}</div>}
        </div>
        {/* Zone badge — shown in favorites view */}
        {showZone && plant.zone && (
          <div style={{ marginTop: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 700, background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 6, padding: "2px 6px", color: "#666" }}>
              {plant.zone.replace(" Grow Station", "").replace("In-Ground Beds", "In-Ground")}
            </span>
          </div>
        )}
      </button>
      {/* One-tap water button — sibling to card button to avoid nested <button> */}
      {!isDone && onWater && (
        <button onClick={e => { e.stopPropagation(); onWater(plant); }}
          style={{ position: "absolute", bottom: 10, right: 8, zIndex: 2, width: 30, height: 30, borderRadius: "var(--radius-input)", background: "#e8f4ff", border: "1.5px solid #000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={ICONS.water} alt="Log watering" style={{ width: 16, height: 16, objectFit: "contain" }} />
        </button>
      )}
    </div>
  );
}

// ─── Plant List Card (compact list view) ──────────────────────────────────────

function PlantListCard({ plant, onTap, onWater, showZone }) {
  const harvestDate = calcHarvestDate(plant.dateStarted, plant.dtm);
  const daysLeft = harvestDate ? daysUntil(harvestDate) : null;
  const statusObj = STATUSES.find(s => s.label === plant.status) || STATUSES[0];
  const isDone = plant.status === "Harvested" || plant.status === "Dead";
  const watered = lastWateredLabel(plant.careLog);
  const { imgRef, handleTap } = useSpriteAnim(plant.status, onTap);

  return (
    <div style={{ position: "relative", opacity: isDone ? 0.5 : 1, paddingBottom: 4, marginBottom: 8 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 'var(--radius-card-sm)', zIndex: 0 }} />
      <button onClick={handleTap} className="plant-card" style={{ position: "relative", zIndex: 1, background: "#fff", border: "2px solid #000", borderRadius: 'var(--radius-card-sm)', padding: "12px 14px", cursor: "pointer", textAlign: "left", width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 48, height: 48, background: "#f5f5f3", borderRadius: 'var(--radius-input)', display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {plant.imageUrl || getAutoIcon(plant.name)
          ? <img ref={imgRef} src={plant.imageUrl || getAutoIcon(plant.name)?.url} alt={plant.name} style={{ width: 40, height: 40, objectFit: "contain", imageRendering: "pixelated" }} />
          : <img ref={imgRef} src={statusObj.img} alt={statusObj.label} style={{ width: 28, height: 28, objectFit: "contain" }} />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>{plant.name}</span>
          {plant.quantity > 1 && (
            <span style={{ fontSize: 11, fontWeight: 700, background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 6, padding: "1px 6px", color: "#666" }}>×{plant.quantity}</span>
          )}
        </div>
        {plant.variety && <div style={{ fontSize: 12, color: "#888" }}>{plant.variety}</div>}
        {showZone && plant.zone && (
          <span style={{ fontSize: 10, fontWeight: 700, background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 6, padding: "1px 6px", color: "#666" }}>
            {plant.zone.replace(" Grow Station", "").replace("In-Ground Beds", "In-Ground")}
          </span>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
          {daysLeft !== null && (
            <div style={{ fontSize: 12, color: daysLeft <= 0 ? "#2d8a3f" : daysLeft <= 14 ? "#c0392b" : "#888", fontWeight: 600 }}>
              {daysLeft <= 0 ? <><img src={ICONS.harvest} alt="" style={{ width: 14, height: 14, objectFit: "contain", marginRight: 3, verticalAlign: "middle" }} />Ready!</> : `${daysLeft}d to harvest`}
            </div>
          )}
          {watered && <div style={{ fontSize: 12, color: watered.color, fontWeight: 600, display: "flex", alignItems: "center" }}><img src={ICONS.water} style={{ width: 11, height: 11, objectFit: "contain", marginRight: 3 }} alt="" />{watered.label}</div>}
        </div>
      </div>
      <span style={{ background: STATUS_COLORS[plant.status] || "#eee", borderRadius: 'var(--radius-icon)', padding: "2px 8px", fontSize: 11, fontWeight: 600, color: "#555", flexShrink: 0, whiteSpace: "nowrap" }}>
        {plant.status}
      </span>
      {!isDone && onWater ? (
        <button onClick={e => { e.stopPropagation(); onWater(plant); }}
          style={{ width: 34, height: 34, borderRadius: "var(--radius-input)", background: "#e8f4ff", border: "1.5px solid #000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <img src={ICONS.water} alt="Log watering" style={{ width: 16, height: 16, objectFit: "contain" }} />
        </button>
      ) : (
        <span style={{ fontSize: 12, color: "#888" }}>›</span>
      )}
    </button>
    </div>
  );
}

export { PlantGridCard, PlantListCard };
