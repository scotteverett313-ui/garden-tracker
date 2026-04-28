import { useState, useEffect, useRef } from "react";
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, CARE_ICONS, PLANT_DB, COMPANION_DB, CALENDAR_DATA, MONTHS, ICON_LIBRARY, lbl, sel, ZONES, DEFAULT_ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon } from "../utils.js";
import { Modal } from "../components/Modal.jsx";
import { CTAButton } from "../components/CTAButton.jsx";
import { PlantGridCard, PlantListCard } from "../components/PlantCard.jsx";
import { PlantDetailSheet } from "../components/PlantDetailSheet.jsx";

function GardenTab({ plants, frostDates, onUpdate, onDelete, onSplit, search, setSearch, filterZone, setFilterZone, filterStatus, setFilterStatus, onAddPlant, toast, zones = ZONES.map((name, i) => ({ id: `zone_${i}`, name })), isWide = false }) {
  const [viewMode, setViewMode] = useState("grid");
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [favOnly, setFavOnly] = useState(false);

  const filtered = plants.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.variety || "").toLowerCase().includes(q) || (p.notes || "").toLowerCase().includes(q);
    const matchZone = !filterZone || p.zone === filterZone;
    const matchStatus = !filterStatus || p.status === filterStatus;
    const matchFav = !favOnly || p.favorite;
    return matchSearch && matchZone && matchStatus && matchFav;
  }).sort((a, b) => a.name.localeCompare(b.name));
  const hasActiveFilters = !!(search || filterZone || filterStatus || favOnly);
  const showEmptyState = hasActiveFilters && filtered.length === 0;

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const statusCounts = STATUSES
    .map(s => ({ ...s, count: plants.filter(p => p.status === s.label).length }))
    .filter(s => s.count > 0);

  const STATUS_DOT = {
    "Seed": "#c4a265", "Germinating": "#7db87d", "Seedling": "#5a9e5a",
    "Transplanted": "#e8a855", "Growing": "#6ab06a", "Flowering": "#c47db8",
    "Fruiting": "#e06060", "Harvesting": "#8abe5a", "Dormant": "#aaaaaa",
    "Harvested": "#4caf7d", "Dead": "#888888",
  };

  return (
    <div>
      {/* Date + Title + Add button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#000" }}>{dateLabel}</div>
          <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1 }}>My Garden</div>
        </div>
        <div style={{ position: "relative", paddingBottom: 4, flexShrink: 0 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 'var(--radius-pill)', zIndex: 0 }} />
          <button onClick={onAddPlant} style={{ position: "relative", zIndex: 1, width: 48, height: 48, borderRadius: 'var(--radius-pill)', background: "#a8e063", border: "2.5px solid #000", cursor: "pointer", fontSize: 28, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>+</button>
        </div>
      </div>

      {/* Search row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input placeholder="Search plants..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 0, padding: "10px 14px", border: "2px solid #000", borderRadius: 'var(--radius-btn)', fontSize: 14, fontFamily: "inherit", background: "#fff" }} />
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {/* Favorites toggle */}
          <button onClick={() => setFavOnly(v => !v)}
            style={{ width: 40, height: 40, border: `2px solid ${favOnly ? "#000" : "#ddd"}`, borderRadius: 'var(--radius-input)', background: favOnly ? "#000" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={favOnly ? ICONS.favActive : ICONS.favorite} alt="Favorites" style={{ width: 20, height: 20, objectFit: "contain", filter: favOnly ? "invert(1)" : "none" }} />
          </button>
          {/* Grid/List toggle */}
          <div style={{ display: "flex", border: "2px solid #000", borderRadius: 'var(--radius-input)', overflow: "hidden" }}>
            <button onClick={() => setViewMode("grid")} style={{ padding: "8px 10px", border: "none", background: viewMode === "grid" ? "#000" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={ICONS.grid} alt="Grid" style={{ width: 18, height: 18, objectFit: "contain", filter: viewMode === "grid" ? "invert(1)" : "none" }} />
            </button>
            <button onClick={() => setViewMode("list")} style={{ padding: "8px 10px", border: "none", background: viewMode === "list" ? "#000" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={ICONS.list} alt="List" style={{ width: 18, height: 18, objectFit: "contain", filter: viewMode === "list" ? "invert(1)" : "none" }} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...sel, flex: 1, borderRadius: 'var(--radius-btn)', border: "2px solid #000" }}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
        </select>
        <select value={filterZone} onChange={e => setFilterZone(e.target.value)} style={{ ...sel, flex: 1, borderRadius: 'var(--radius-btn)', border: "2px solid #000" }}>
          <option value="">All Zones</option>
          {zones.map(z => <option key={z.id} value={z.name}>{z.name.replace(" Grow Station", "").replace("In-Ground Beds", "In-Ground")}</option>)}
        </select>
      </div>

      {hasActiveFilters && (
        <button onClick={() => { setSearch(""); setFilterZone(""); setFilterStatus(""); setFavOnly(false); }}
          style={{ background: "#f0f0f0", border: "none", borderRadius: 'var(--radius-sm)', padding: "5px 14px", cursor: "pointer", fontSize: 13, marginBottom: 14 }}>× Clear</button>
      )}

      {/* Status count chips */}
      {statusCounts.length > 0 && !favOnly && !showEmptyState && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 2, scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {statusCounts.map(s => (
            <button key={s.label} onClick={() => setFilterStatus(filterStatus === s.label ? "" : s.label)}
              style={{ flexShrink: 0, background: filterStatus === s.label ? "#000" : "#fff", border: "2px solid #000", borderRadius: 'var(--radius-card-sm)', padding: "10px 14px", cursor: "pointer", textAlign: "left", minWidth: 76 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_DOT[s.label] || "#aaa", flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: filterStatus === s.label ? "#ccc" : "#666" }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: filterStatus === s.label ? "#fff" : "#000", lineHeight: 1 }}>{s.count}</div>
            </button>
          ))}
        </div>
      )}

      {/* Empty state when filters return no results */}
      {showEmptyState && (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{favOnly ? "🤍" : "🌱"}</div>
          <div style={{ fontWeight: 800, fontSize: 17, color: "#444", marginBottom: 6 }}>
            {favOnly ? "No favorites yet" : "No plants found"}
          </div>
          <div style={{ fontSize: 14, color: "#aaa", marginBottom: 20 }}>
            {favOnly ? "Open any plant and tap ❤️ to save it here" : "Try adjusting your search or filters"}
          </div>
        </div>
      )}

      {/* Favorites — flat list across all zones */}
      {!showEmptyState && favOnly && (
        <div>
          <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: -0.5, marginBottom: 4 }}>Your Favorites</div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>{filtered.length} plant{filtered.length !== 1 ? "s" : ""}</div>
          {viewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: isWide ? "repeat(3, 1fr)" : "1fr 1fr", gap: 10 }}>
              {filtered.map(p => <PlantGridCard key={p.id} plant={p} onTap={() => setSelectedPlant(p)} showZone />)}
            </div>
          ) : (
            <div>
              {filtered.map(p => <PlantListCard key={p.id} plant={p} onTap={() => setSelectedPlant(p)} showZone />)}
            </div>
          )}
        </div>
      )}

      {/* Zone sections — normal view */}
      {!showEmptyState && !favOnly && zones.map(zone => {
        const zonePlants = filtered.filter(p => p.zone === zone.name);
        if (filterZone && filterZone !== zone.name) return null;
        const displayName = zone.name.replace(" Grow Station", "").replace("In-Ground Beds", "In-Ground");
        return (
          <div key={zone.id} style={{ marginBottom: 28 }}>
            {/* Zone header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: -0.5, lineHeight: 1 }}>{displayName}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{zonePlants.length} plant{zonePlants.length !== 1 ? "s" : ""}</div>
              </div>
              <CTAButton onClick={onAddPlant} style={{ padding: "8px 16px", fontSize: 13, width: "auto" }}>+ Add Plant</CTAButton>
            </div>

            {/* Plants */}
            {zonePlants.length === 0 ? (
              <button onClick={onAddPlant} className="add-zone-btn" style={{ width: "100%", border: "2px dashed #ccc", borderRadius: 'var(--radius-card-sm)', padding: 20, textAlign: "center", color: "#aaa", fontSize: 14, background: "none", cursor: "pointer" }}>
                + Add Plant
              </button>
            ) : viewMode === "grid" ? (
              <div style={{ display: "grid", gridTemplateColumns: isWide ? "repeat(3, 1fr)" : "1fr 1fr", gap: 10 }}>
                {zonePlants.map(p => <PlantGridCard key={p.id} plant={p} onTap={() => setSelectedPlant(p)} />)}
              </div>
            ) : (
              <div>
                {zonePlants.map(p => <PlantListCard key={p.id} plant={p} onTap={() => setSelectedPlant(p)} />)}
              </div>
            )}
          </div>
        );
      })}

      {/* Plant detail sheet */}
      {selectedPlant && (
        <PlantDetailSheet
          plant={plants.find(p => p.id === selectedPlant.id) || selectedPlant}
          frostDates={frostDates}
          zones={zones}
          onUpdate={updated => { onUpdate(updated); setSelectedPlant(updated); }}
          onDelete={id => { onDelete(id); setSelectedPlant(null); }}
          onSplit={(updatedOriginal, newPlants) => { onSplit(updatedOriginal, newPlants); setSelectedPlant(null); }}
          onClose={() => setSelectedPlant(null)}
          toast={toast}
        />
      )}
    </div>
  );
}

export { GardenTab };
