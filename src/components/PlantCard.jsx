import { useState, useEffect, useRef } from "react";
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, CARE_ICONS, PLANT_DB, COMPANION_DB, CALENDAR_DATA, MONTHS, ICON_LIBRARY, lbl, sel, ZONES, DEFAULT_ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon } from "../utils.js";
import { Modal } from "./Modal.jsx";
import { CTAButton } from "./CTAButton.jsx";

function lastWateredLabel(careLog) {
  const entry = [...(careLog || [])].filter(e => e.type === "Watering").sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  if (!entry) return null;
  const d = daysSince(entry.date);
  if (d === 0) return { label: "💧 today", color: "#2d8a3f" };
  if (d === 1) return { label: "💧 yesterday", color: "#2d8a3f" };
  if (d <= 3) return { label: `💧 ${d}d ago`, color: "#888" };
  if (d <= 6) return { label: `💧 ${d}d ago`, color: "#d4820a" };
  return { label: `💧 ${d}d ago`, color: "#c0392b" };
}

function PlantGridCard({ plant, onTap }) {
  const harvestDate = calcHarvestDate(plant.dateStarted, plant.dtm);
  const daysLeft = harvestDate ? daysUntil(harvestDate) : null;
  const isDone = plant.status === "Harvested" || plant.status === "Dead";
  const imageUrl = plant.imageUrl || getAutoIcon(plant.name)?.url || null;
  const statusObj = STATUSES.find(s => s.label === plant.status) || STATUSES[0];
  const watered = lastWateredLabel(plant.careLog);

  return (
    // Offset shadow wrapper — paddingBottom gives shadow room so it doesn't bleed into next card
    <div style={{ position: "relative", opacity: isDone ? 0.5 : 1, paddingBottom: 4 }}>
      {/* Black shadow layer */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 16, zIndex: 0 }} />
      {/* Main card on top */}
      <button onClick={onTap} className="plant-card" style={{ position: "relative", zIndex: 1, background: "#fff", border: "2px solid #000", borderRadius: 16, padding: 12, cursor: "pointer", textAlign: "left", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 0 }}>

        {/* Row 1 — Harvest info + menu button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#000" }}>
              {daysLeft !== null ? (daysLeft <= 0 ? "🎉 Ready!" : "Harvest in:") : "Started:"}
            </div>
            <div style={{ fontSize: 12, color: daysLeft !== null && daysLeft <= 14 ? "#c0392b" : "#888", fontWeight: 500 }}>
              {daysLeft !== null
                ? (daysLeft <= 0 ? "Harvest now" : `${daysLeft} days · ${formatDate(harvestDate)}`)
                : (plant.dateStarted ? formatDate(plant.dateStarted) : plant.status)}
            </div>
          </div>
          <div style={{ width: 32, height: 32, border: "1.5px solid #e0e0e0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <img src={ICONS.menu} alt="Menu" style={{ width: 16, height: 16, objectFit: "contain" }} />
          </div>
        </div>

        {/* Harvest progress bar */}
        {plant.dateStarted && !isDone && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ height: 5, background: "#ebebeb", borderRadius: 999, overflow: "hidden" }}>
              {plant.dtm && (
                <div style={{
                  height: "100%",
                  width: `${Math.min(100, Math.max(2, (daysSince(plant.dateStarted) / parseInt(plant.dtm)) * 100))}%`,
                  background: daysLeft !== null && daysLeft <= 0 ? "#2d8a3f" : daysLeft !== null && daysLeft <= 14 ? "#c0392b" : "#a8e063",
                  borderRadius: 999,
                  transition: "width 0.3s ease",
                }} />
              )}
            </div>
          </div>
        )}

        {/* Row 2 — Pixel art image centered */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 80, marginBottom: 10 }}>
          {imageUrl
            ? <img src={imageUrl} alt={plant.name} style={{ width: 70, height: 70, objectFit: "contain", imageRendering: "pixelated" }} />
            : <img src={statusObj.img} alt={statusObj.label} style={{ width: 52, height: 52, objectFit: "contain" }} />
          }
        </div>

        {/* Row 3 — Status icon + plant name */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <img src={statusObj.img} alt={statusObj.label} style={{ width: 16, height: 16, objectFit: "contain" }} />
          <span style={{ fontWeight: 800, fontSize: 15, color: "#000", lineHeight: 1.2 }}>{plant.name}</span>
        </div>

        {/* Row 4 — Variety + last watered */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
          {plant.variety && <div style={{ fontSize: 12, color: "#666" }}>({plant.variety})</div>}
          {watered && <div style={{ fontSize: 11, color: watered.color, fontWeight: 600, marginLeft: "auto" }}>{watered.label}</div>}
        </div>
      </button>
    </div>
  );
}

// ─── Plant List Card (compact list view) ──────────────────────────────────────

function PlantListCard({ plant, onTap }) {
  const harvestDate = calcHarvestDate(plant.dateStarted, plant.dtm);
  const daysLeft = harvestDate ? daysUntil(harvestDate) : null;
  const statusObj = STATUSES.find(s => s.label === plant.status) || STATUSES[0];
  const isDone = plant.status === "Harvested" || plant.status === "Dead";
  const watered = lastWateredLabel(plant.careLog);

  return (
    <button onClick={onTap} className="plant-card" style={{ background: "#fff", border: "2px solid #000", borderRadius: 14, padding: "12px 14px", cursor: "pointer", textAlign: "left", width: "100%", display: "flex", alignItems: "center", gap: 12, marginBottom: 8, opacity: isDone ? 0.5 : 1 }}>
      <div style={{ width: 48, height: 48, background: "#f5f5f3", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
        {plant.imageUrl || getAutoIcon(plant.name)
          ? <img src={plant.imageUrl || getAutoIcon(plant.name)?.url} alt={plant.name} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
          : <img src={statusObj.img} alt={statusObj.label} style={{ width: 32, height: 32, objectFit: "contain" }} />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{plant.name}</div>
        {plant.variety && <div style={{ fontSize: 12, color: "#888" }}>{plant.variety}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
          {daysLeft !== null && (
            <div style={{ fontSize: 12, color: daysLeft <= 0 ? "#2d8a3f" : daysLeft <= 14 ? "#c0392b" : "#888", fontWeight: 600 }}>
              {daysLeft <= 0 ? "🎉 Ready!" : `${daysLeft}d to harvest`}
            </div>
          )}
          {watered && <div style={{ fontSize: 12, color: watered.color, fontWeight: 600 }}>{watered.label}</div>}
        </div>
      </div>
      <span style={{ background: STATUS_COLORS[plant.status] || "#eee", borderRadius: 12, padding: "2px 8px", fontSize: 11, fontWeight: 600, color: "#555", flexShrink: 0, whiteSpace: "nowrap" }}>
        {plant.status}
      </span>
      <span style={{ fontSize: 12, color: "#888" }}>›</span>
    </button>
  );
}

export { PlantGridCard, PlantListCard };
