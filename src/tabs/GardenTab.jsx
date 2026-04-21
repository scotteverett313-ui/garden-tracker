import { useState } from "react";
import { ICONS, STATUSES, STATUS_COLORS, sel, ZONES } from "../constants.js";
import { CTAButton } from "../components/CTAButton.jsx";
import { PlantGridCard, PlantListCard } from "../components/PlantCard.jsx";
import { PlantDetailSheet } from "../components/PlantDetailSheet.jsx";

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function GardenTab({ plants, frostDates, onUpdate, onDelete, search, setSearch, filterZone, setFilterZone, filterStatus, setFilterStatus, onAddPlant, toast, zones = ZONES.map((name, i) => ({ id: `zone_${i}`, name })), isWide = false }) {
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
  });
  const hasActiveFilters = !!(search || filterZone || filterStatus || favOnly);
  const showEmptyState = hasActiveFilters && filtered.length === 0;

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", { month: "long" }) + " " + ordinal(today.getDate());
  const statusCounts = {};
  STATUSES.forEach(s => { statusCounts[s.label] = plants.filter(p => p.status === s.label).length; });
  const activeStatuses = STATUSES.filter(s => statusCounts[s.label] > 0);

  return (
    <div>
      {/* Date + title + FAB */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 14, color: "#aaa", fontWeight: 600, marginBottom: 2 }}>{dateLabel}</div>
          <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1, lineHeight: 1 }}>My Garden</div>
        </div>
        <div style={{ position: "relative", paddingBottom: 3, flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: "3px 0 0", background: "#000", borderRadius: "50%", zIndex: 0 }} />
          <button onClick={onAddPlant} style={{ position: "relative", zIndex: 1, width: 46, height: 46, borderRadius: "50%", background: "#a8e063", border: "2px solid #000", cursor: "pointer", fontSize: 24, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>+</button>
        </div>
      </div>

      {/* Search row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input placeholder="Search plants..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 0, padding: "10px 14px", border: "2px solid #000", borderRadius: 50, fontSize: 14, fontFamily: "inherit", background: "#fff" }} />
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {/* Favorites toggle */}
          <button onClick={() => setFavOnly(v => !v)}
            style={{ width: 40, height: 40, border: `2px solid ${favOnly ? "#000" : "#ddd"}`, borderRadius: 10, background: favOnly ? "#000" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={favOnly ? ICONS.favActive : ICONS.favorite} alt="Favorites" style={{ width: 20, height: 20, objectFit: "contain", filter: favOnly ? "invert(1)" : "none" }} />
          </button>
          {/* Grid/List toggle */}
          <div style={{ display: "flex", border: "2px solid #000", borderRadius: 10, overflow: "hidden" }}>
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
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...sel, flex: 1, borderRadius: 50, border: "2px solid #000" }}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
        </select>
        <select value={filterZone} onChange={e => setFilterZone(e.target.value)} style={{ ...sel, flex: 1, borderRadius: 50, border: "2px solid #000" }}>
          <option value="">All Zones</option>
          {zones.map(z => <option key={z.id} value={z.name}>{z.name.replace(" Grow Station", "").replace("In-Ground Beds", "In-Ground")}</option>)}
        </select>
      </div>

      {/* Status summary bar */}
      {plants.length > 0 && !favOnly && (
        <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 4, marginBottom: 16, scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {activeStatuses.map(s => (
            <button key={s.label} onClick={() => setFilterStatus(filterStatus === s.label ? "" : s.label)}
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: "0 0 2px", fontFamily: "inherit", opacity: filterStatus && filterStatus !== s.label ? 0.35 : 1, transition: "opacity 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[s.label] || "#ccc", border: "1px solid rgba(0,0,0,0.12)" }} />
                <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>{s.label}</span>
              </div>
              <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1, lineHeight: 1, color: "#000" }}>{statusCounts[s.label]}</span>
            </button>
          ))}
        </div>
      )}

      {hasActiveFilters && (
        <button onClick={() => { setSearch(""); setFilterZone(""); setFilterStatus(""); setFavOnly(false); }}
          style={{ background: "#f0f0f0", border: "none", borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontSize: 13, marginBottom: 14 }}>× Clear</button>
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
              <div style={{ position: "relative", paddingBottom: 3 }}>
                <div style={{ position: "absolute", inset: "3px 0 0", background: "#000", borderRadius: 999, zIndex: 0 }} />
                <button onClick={onAddPlant} style={{ position: "relative", zIndex: 1, background: "#a8e063", border: "2px solid #000", borderRadius: 999, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 800, fontFamily: "inherit" }}>+ Add Plant</button>
              </div>
            </div>

            {/* Plants */}
            {zonePlants.length === 0 ? (
              <button onClick={onAddPlant} className="add-zone-btn" style={{ width: "100%", border: "2px dashed #ccc", borderRadius: 14, padding: 20, textAlign: "center", color: "#aaa", fontSize: 14, background: "none", cursor: "pointer" }}>
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
          onClose={() => setSelectedPlant(null)}
          toast={toast}
        />
      )}
    </div>
  );
}

export { GardenTab };
