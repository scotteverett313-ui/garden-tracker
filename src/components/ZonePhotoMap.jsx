import { useState, useRef } from "react";
import { generateId, getAutoIcon } from "../utils.js";

async function compressPhoto(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 900;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = url;
  });
}

const BED_TEMPLATES = [
  { id: "4x4", label: "4×4", desc: "Classic square foot bed", rows: 4, cols: 4 },
  { id: "4x8", label: "4×8", desc: "Long rectangular bed", rows: 4, cols: 8 },
  { id: "3x6", label: "3×6", desc: "Compact long bed", rows: 3, cols: 6 },
];

const WOOD      = "#8b6332";
const WOOD_DARK = "#5c3d1e";
const SOIL      = "#3a5e40";

function BedThumb({ rows, cols }) {
  const cw = 7, ch = 7, gap = 1, pad = 4;
  const w = cols * cw + (cols - 1) * gap + pad * 2;
  const h = rows * ch + (rows - 1) * gap + pad * 2;
  return (
    <svg width={w + 4} height={h + 9} style={{ display: "block" }}>
      {/* front wall */}
      <rect x={2} y={h} width={w + 2} height={7} fill={WOOD_DARK} rx={1} />
      {/* top face frame */}
      <rect x={0} y={0} width={w} height={h} fill={WOOD} rx={2} />
      {/* soil cells */}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <rect key={`${r}${c}`}
            x={pad + c * (cw + gap)} y={pad + r * (ch + gap)}
            width={cw} height={ch} fill={SOIL} rx={0.5} />
        ))
      )}
    </svg>
  );
}

function cellKey(r, c) { return `${r},${c}`; }

export function ZonePhotoMap({ zone, plants, onSaveZone, onClose }) {
  const [mode, setMode]               = useState("photo");
  const [pendingPin, setPendingPin]   = useState(null);
  const [selectedCell, setSelectedCell] = useState(null); // { r, c }
  const [compressing, setCompressing] = useState(false);
  const imgRef  = useRef(null);
  const fileRef = useRef(null);

  const pins       = zone.pins || [];
  const sqftBed    = zone.sqftBed || {};
  const bedCells   = sqftBed.cells || {};
  const bedTpl     = BED_TEMPLATES.find(t => t.id === sqftBed.template) || null;
  const zonePlants = plants.filter(p => p.zone === zone.name && !["Harvested", "Dead"].includes(p.status));
  const displayName = zone.name.replace(" Grow Station", "").replace("In-Ground Beds", "In-Ground");

  // ── Photo handlers ──────────────────────────────────────────
  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setCompressing(true);
    const photoUrl = await compressPhoto(file);
    onSaveZone({ ...zone, photoUrl });
    setCompressing(false);
    e.target.value = "";
  }

  function handleImageTap(e) {
    const rect = imgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top)  / rect.height;
    setPendingPin({ x, y });
  }

  function placePin(plant) {
    if (!pendingPin) return;
    const newPin = { id: generateId(), x: pendingPin.x, y: pendingPin.y, plantId: plant.id };
    onSaveZone({ ...zone, pins: [...pins, newPin] });
    setPendingPin(null);
  }

  function removePin(pinId) {
    onSaveZone({ ...zone, pins: pins.filter(p => p.id !== pinId) });
  }

  // ── Bed map handlers ────────────────────────────────────────
  function selectTemplate(tpl) {
    onSaveZone({ ...zone, sqftBed: { template: tpl.id, cells: {} } });
  }

  function updateCell(r, c, data) {
    const key = cellKey(r, c);
    const next = { ...bedCells };
    if (data === null) delete next[key];
    else next[key] = data;
    onSaveZone({ ...zone, sqftBed: { ...sqftBed, cells: next } });
    setSelectedCell(null);
  }

  // ── Computed ────────────────────────────────────────────────
  const viewportW = Math.min(typeof window !== "undefined" ? window.innerWidth : 390, 460);
  const cellSize  = bedTpl
    ? Math.min(72, Math.floor((viewportW - 56) / bedTpl.cols))
    : 64;

  const selCellData = selectedCell ? (bedCells[cellKey(selectedCell.r, selectedCell.c)] || null) : null;

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "#111", display: "flex", flexDirection: "column", fontFamily: "'Cabin', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ padding: "52px 20px 12px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Bed Map</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{displayName}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {mode === "photo" && (
              <button onClick={() => fileRef.current?.click()}
                style={{ background: "#333", border: "none", borderRadius: "var(--radius-input)", padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "inherit" }}>
                {compressing ? "Loading…" : zone.photoUrl ? "Change Photo" : "📷 Add Photo"}
              </button>
            )}
            {mode === "bedmap" && bedTpl && (
              <button onClick={() => onSaveZone({ ...zone, sqftBed: { cells: {} } })}
                style={{ background: "#333", border: "none", borderRadius: "var(--radius-input)", padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "inherit" }}>
                Change Bed
              </button>
            )}
            <button onClick={onClose}
              style={{ background: "#333", border: "none", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
              ×
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", background: "#222", borderRadius: 10, padding: 3, gap: 3 }}>
          {["photo", "bedmap"].map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex: 1, padding: "7px 0", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#000" : "#666" }}>
              {m === "photo" ? "📷 Photo" : "🌱 Bed Layout"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Photo mode ── */}
      {mode === "photo" && (
        <>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "0 0 8px" }}>
            {zone.photoUrl ? (
              <div style={{ position: "relative" }}>
                <img ref={imgRef} src={zone.photoUrl} alt={zone.name} onClick={handleImageTap}
                  style={{ maxWidth: "100vw", maxHeight: "55vh", display: "block", objectFit: "contain", cursor: "crosshair" }} />
                {pins.map(pin => {
                  const plant = plants.find(p => p.id === pin.plantId);
                  if (!plant) return null;
                  const icon = getAutoIcon(plant.name);
                  return (
                    <div key={pin.id} style={{ position: "absolute", left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}>
                      <button onClick={e => { e.stopPropagation(); removePin(pin.id); }}
                        style={{ position: "absolute", transform: "translate(-50%, -50%)", background: "#fff", border: "2.5px solid #000", borderRadius: "50%", width: 36, height: 36, padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                        {icon
                          ? <img src={icon.url} alt={plant.name} style={{ width: 22, height: 22, objectFit: "contain", imageRendering: "pixelated" }} />
                          : <span style={{ fontSize: 11, fontWeight: 800 }}>{plant.name[0]}</span>}
                      </button>
                      <div style={{ position: "absolute", top: 21, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.72)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap", maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis", pointerEvents: "none" }}>
                        {plant.name}
                      </div>
                    </div>
                  );
                })}
                {pendingPin && (
                  <div style={{ position: "absolute", left: `${pendingPin.x * 100}%`, top: `${pendingPin.y * 100}%`, transform: "translate(-50%, -50%)", width: 30, height: 30, border: "2.5px dashed #a8e063", borderRadius: "50%", background: "rgba(168,224,99,0.2)", pointerEvents: "none" }} />
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#555" }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>📷</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#777", marginBottom: 6 }}>No bed photo yet</div>
                <div style={{ fontSize: 13, color: "#444" }}>Tap "Add Photo" to snap your garden bed</div>
              </div>
            )}
          </div>

          {pendingPin && (
            <div style={{ background: "#fff", borderRadius: "var(--radius-card) var(--radius-card) 0 0", padding: "20px 20px calc(env(safe-area-inset-bottom) + 20px)", maxHeight: "45vh", overflowY: "auto" }}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>Which plant is here?</div>
              {zonePlants.length === 0
                ? <div style={{ color: "#aaa", fontSize: 14 }}>No active plants in this zone.</div>
                : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {zonePlants.map(plant => {
                      const icon = getAutoIcon(plant.name);
                      const pinCount = pins.filter(p => p.plantId === plant.id).length;
                      return (
                        <button key={plant.id} onClick={() => placePin(plant)}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fff", border: "2px solid #e0e0e0", borderRadius: "var(--radius-card-sm)", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                          {icon && <img src={icon.url} alt="" style={{ width: 30, height: 30, objectFit: "contain", imageRendering: "pixelated" }} />}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{plant.name}</div>
                            {plant.variety && <div style={{ fontSize: 12, color: "#888" }}>{plant.variety}</div>}
                          </div>
                          {pinCount > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "#a8e063", background: "#000", borderRadius: 99, padding: "2px 8px" }}>×{pinCount}</span>}
                        </button>
                      );
                    })}
                  </div>
              }
              <button onClick={() => setPendingPin(null)}
                style={{ marginTop: 14, width: "100%", padding: "11px", background: "#f5f5f3", border: "none", borderRadius: "var(--radius-input)", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}>
                Cancel
              </button>
            </div>
          )}

          {!pendingPin && (
            <div style={{ background: "#1a1a1a", padding: "12px 20px calc(env(safe-area-inset-bottom) + 12px)" }}>
              {pins.length > 0 ? (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Pinned</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {pins.map(pin => {
                      const plant = plants.find(p => p.id === pin.plantId);
                      if (!plant) return null;
                      const icon = getAutoIcon(plant.name);
                      return (
                        <div key={pin.id} style={{ display: "flex", alignItems: "center", gap: 5, background: "#222", border: "1px solid #333", borderRadius: "var(--radius-card-sm)", padding: "4px 10px" }}>
                          {icon && <img src={icon.url} alt="" style={{ width: 16, height: 16, objectFit: "contain", imageRendering: "pixelated" }} />}
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#ccc" }}>{plant.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  {zone.photoUrl && <div style={{ fontSize: 11, color: "#444", marginTop: 8 }}>Tap photo to add pins · Tap a pin to remove</div>}
                </>
              ) : (
                zone.photoUrl && <div style={{ fontSize: 13, color: "#444", textAlign: "center" }}>Tap anywhere on the photo to mark a plant</div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Bed map mode ── */}
      {mode === "bedmap" && !bedTpl && (
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px calc(env(safe-area-inset-bottom) + 20px)" }}>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>Choose a bed shape to set up your square foot garden layout.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {BED_TEMPLATES.map(tpl => (
              <button key={tpl.id} onClick={() => selectTemplate(tpl)}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px", background: "#1e1e1e", border: "2px solid #333", borderRadius: 14, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                <div style={{ flexShrink: 0 }}>
                  <BedThumb rows={tpl.rows} cols={tpl.cols} />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{tpl.label} Raised Bed</div>
                  <div style={{ fontSize: 13, color: "#666" }}>{tpl.desc}</div>
                  <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>{tpl.rows * tpl.cols} square feet</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === "bedmap" && bedTpl && (
        <>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 20px", overflow: "hidden" }}>
            {/* Isometric raised bed */}
            <div style={{ perspective: "900px" }}>
              <div style={{
                transform: "rotateX(28deg)",
                transformOrigin: "center bottom",
                display: "inline-block",
              }}>
                {/* Wood frame */}
                <div style={{
                  background: WOOD,
                  padding: 8,
                  borderRadius: 4,
                  boxShadow: `0 22px 0 ${WOOD_DARK}, 0 28px 18px rgba(0,0,0,0.55)`,
                }}>
                  {/* Grid */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${bedTpl.cols}, ${cellSize}px)`,
                    gap: 2,
                    background: WOOD_DARK,
                  }}>
                    {Array.from({ length: bedTpl.rows }, (_, r) =>
                      Array.from({ length: bedTpl.cols }, (_, c) => {
                        const data = bedCells[cellKey(r, c)] || null;
                        const plant = data?.plantId ? plants.find(p => p.id === data.plantId) : null;
                        const icon = plant ? getAutoIcon(plant.name) : null;
                        const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                        return (
                          <div key={`${r},${c}`}
                            onClick={() => setSelectedCell(isSelected ? null : { r, c })}
                            style={{
                              width: cellSize, height: cellSize,
                              background: isSelected
                                ? "#a8e163"
                                : data?.planned
                                  ? "#1a3320"
                                  : plant
                                    ? "#1e4025"
                                    : SOIL,
                              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                              cursor: "pointer",
                              border: isSelected ? "2px solid #a8e163" : "none",
                              boxSizing: "border-box",
                              overflow: "hidden",
                              gap: 1,
                            }}>
                            {plant && icon && (
                              <img src={icon.url} alt={plant.name}
                                style={{ width: cellSize * 0.44, height: cellSize * 0.44, objectFit: "contain", imageRendering: "pixelated" }} />
                            )}
                            {plant && !icon && (
                              <span style={{ fontSize: cellSize * 0.32, fontWeight: 800, color: "#a8e163" }}>{plant.name[0]}</span>
                            )}
                            {plant && cellSize >= 52 && (
                              <span style={{ fontSize: 9, fontWeight: 700, color: "#a8e163", textAlign: "center", lineHeight: 1, maxWidth: cellSize - 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {plant.name}
                              </span>
                            )}
                            {data?.planned && (
                              <>
                                <span style={{ fontSize: cellSize * 0.36 }}>🌱</span>
                                {cellSize >= 52 && <span style={{ fontSize: 9, fontWeight: 700, color: "#4caf50" }}>Plan</span>}
                              </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid legend */}
            <div style={{ marginTop: 32, display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, background: SOIL, borderRadius: 2 }} />
                <span style={{ fontSize: 11, color: "#555", fontWeight: 600 }}>Empty</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, background: "#1e4025", borderRadius: 2 }} />
                <span style={{ fontSize: 11, color: "#555", fontWeight: 600 }}>Planted</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, background: "#1a3320", borderRadius: 2 }} />
                <span style={{ fontSize: 11, color: "#555", fontWeight: 600 }}>Planned</span>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: "#444" }}>Tap a square to label it</div>
          </div>

          {/* Cell picker */}
          {selectedCell && (
            <div style={{ background: "#fff", borderRadius: "var(--radius-card) var(--radius-card) 0 0", padding: "20px 20px calc(env(safe-area-inset-bottom) + 20px)", maxHeight: "50vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>
                  Square {selectedCell.r + 1},{selectedCell.c + 1}
                </div>
                {selCellData && (
                  <button onClick={() => updateCell(selectedCell.r, selectedCell.c, null)}
                    style={{ fontSize: 12, fontWeight: 700, color: "#c0392b", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                    Clear
                  </button>
                )}
              </div>

              {/* Plan Here option */}
              <button onClick={() => updateCell(selectedCell.r, selectedCell.c, { planned: true })}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", width: "100%", background: selCellData?.planned ? "#e8f5e0" : "#fff", border: `2px solid ${selCellData?.planned ? "#a8e163" : "#e0e0e0"}`, borderRadius: "var(--radius-card-sm)", cursor: "pointer", textAlign: "left", fontFamily: "inherit", marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>🌱</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Plan Here</div>
                  <div style={{ fontSize: 12, color: "#888" }}>Reserve for future planting</div>
                </div>
                {selCellData?.planned && <span style={{ marginLeft: "auto", fontSize: 16 }}>✓</span>}
              </button>

              {/* Divider */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, margin: "12px 0 8px" }}>
                {zonePlants.length > 0 ? "Or assign a plant" : "No active plants in this zone"}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {zonePlants.map(plant => {
                  const icon = getAutoIcon(plant.name);
                  const isAssigned = selCellData?.plantId === plant.id;
                  const sqCount = Object.values(bedCells).filter(d => d?.plantId === plant.id).length;
                  return (
                    <button key={plant.id} onClick={() => updateCell(selectedCell.r, selectedCell.c, { plantId: plant.id })}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: isAssigned ? "#e8f5e0" : "#fff", border: `2px solid ${isAssigned ? "#a8e163" : "#e0e0e0"}`, borderRadius: "var(--radius-card-sm)", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                      {icon
                        ? <img src={icon.url} alt="" style={{ width: 30, height: 30, objectFit: "contain", imageRendering: "pixelated" }} />
                        : <div style={{ width: 30, height: 30, background: "#e0e0e0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>{plant.name[0]}</div>
                      }
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{plant.name}</div>
                        {plant.variety && <div style={{ fontSize: 12, color: "#888" }}>{plant.variety}</div>}
                      </div>
                      {sqCount > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "#888" }}>{sqCount} sq</span>}
                      {isAssigned && <span style={{ fontSize: 16, marginLeft: 4 }}>✓</span>}
                    </button>
                  );
                })}
              </div>

              <button onClick={() => setSelectedCell(null)}
                style={{ marginTop: 14, width: "100%", padding: "11px", background: "#f5f5f3", border: "none", borderRadius: "var(--radius-input)", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}>
                Cancel
              </button>
            </div>
          )}

          {!selectedCell && (
            <div style={{ background: "#1a1a1a", padding: "12px 20px calc(env(safe-area-inset-bottom) + 12px)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                {bedTpl.label} · {bedTpl.rows * bedTpl.cols} sq ft
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(
                  Object.values(bedCells).reduce((acc, d) => {
                    if (d?.plantId) acc[d.plantId] = (acc[d.plantId] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([plantId, count]) => {
                  const plant = plants.find(p => p.id === plantId);
                  if (!plant) return null;
                  const icon = getAutoIcon(plant.name);
                  return (
                    <div key={plantId} style={{ display: "flex", alignItems: "center", gap: 5, background: "#222", border: "1px solid #333", borderRadius: "var(--radius-card-sm)", padding: "4px 10px" }}>
                      {icon && <img src={icon.url} alt="" style={{ width: 14, height: 14, objectFit: "contain", imageRendering: "pixelated" }} />}
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#ccc" }}>{plant.name}</span>
                      <span style={{ fontSize: 11, color: "#555" }}>×{count}</span>
                    </div>
                  );
                })}
                {Object.values(bedCells).some(d => d?.planned) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#222", border: "1px solid #333", borderRadius: "var(--radius-card-sm)", padding: "4px 10px" }}>
                    <span style={{ fontSize: 12 }}>🌱</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#ccc" }}>
                      {Object.values(bedCells).filter(d => d?.planned).length} planned
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
