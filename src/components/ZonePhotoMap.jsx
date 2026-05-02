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

export function ZonePhotoMap({ zone, plants, onSaveZone, onClose }) {
  const [pendingPin, setPendingPin] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const imgRef = useRef(null);
  const fileRef = useRef(null);

  const pins = zone.pins || [];
  const zonePlants = plants.filter(p => p.zone === zone.name && !["Harvested", "Dead"].includes(p.status));
  const displayName = zone.name.replace(" Grow Station", "").replace("In-Ground Beds", "In-Ground");

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
    const y = (e.clientY - rect.top) / rect.height;
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

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "#111", display: "flex", flexDirection: "column", fontFamily: "'Cabin', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 20px 16px" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>Bed Map</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{displayName}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => fileRef.current?.click()} style={{ background: "#333", border: "none", borderRadius: "var(--radius-input)", padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "inherit" }}>
            {compressing ? "Loading…" : zone.photoUrl ? "Change Photo" : "📷 Add Photo"}
          </button>
          <button onClick={onClose} style={{ background: "#333", border: "none", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
      </div>

      {/* Photo area */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "0 0 8px" }}>
        {zone.photoUrl ? (
          <div style={{ position: "relative" }}>
            <img
              ref={imgRef}
              src={zone.photoUrl}
              alt={zone.name}
              onClick={handleImageTap}
              style={{ maxWidth: "100vw", maxHeight: "55vh", display: "block", objectFit: "contain", cursor: "crosshair" }}
            />
            {/* Placed pins */}
            {pins.map(pin => {
              const plant = plants.find(p => p.id === pin.plantId);
              if (!plant) return null;
              const icon = getAutoIcon(plant.name);
              return (
                <button key={pin.id} onClick={e => { e.stopPropagation(); removePin(pin.id); }}
                  style={{ position: "absolute", left: `${pin.x * 100}%`, top: `${pin.y * 100}%`, transform: "translate(-50%, -100%)", background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{ background: "#fff", border: "2.5px solid #000", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                    {icon
                      ? <img src={icon.url} alt={plant.name} style={{ width: 22, height: 22, objectFit: "contain", imageRendering: "pixelated" }} />
                      : <span style={{ fontSize: 11, fontWeight: 800 }}>{plant.name[0]}</span>
                    }
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.72)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap", maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {plant.name}
                  </div>
                </button>
              );
            })}
            {/* Pending pin indicator */}
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

      {/* Plant picker — appears after tapping image */}
      {pendingPin && (
        <div style={{ background: "#fff", borderRadius: "var(--radius-card) var(--radius-card) 0 0", padding: "20px 20px calc(env(safe-area-inset-bottom) + 20px)", maxHeight: "45vh", overflowY: "auto" }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>Which plant is here?</div>
          {zonePlants.length === 0
            ? <div style={{ color: "#aaa", fontSize: 14 }}>No active plants in this zone.</div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {zonePlants.map(plant => {
                  const icon = getAutoIcon(plant.name);
                  const alreadyPinned = pins.some(p => p.plantId === plant.id);
                  return (
                    <button key={plant.id} onClick={() => placePin(plant)} disabled={alreadyPinned}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: alreadyPinned ? "#f5f5f3" : "#fff", border: "2px solid #e0e0e0", borderRadius: "var(--radius-card-sm)", cursor: alreadyPinned ? "default" : "pointer", textAlign: "left", fontFamily: "inherit", opacity: alreadyPinned ? 0.5 : 1 }}>
                      {icon && <img src={icon.url} alt="" style={{ width: 30, height: 30, objectFit: "contain", imageRendering: "pixelated" }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{plant.name}</div>
                        {plant.variety && <div style={{ fontSize: 12, color: "#888" }}>{plant.variety}</div>}
                      </div>
                      {alreadyPinned && <span style={{ fontSize: 12, color: "#aaa" }}>Pinned</span>}
                    </button>
                  );
                })}
              </div>
          }
          <button onClick={() => setPendingPin(null)} style={{ marginTop: 14, width: "100%", padding: "11px", background: "#f5f5f3", border: "none", borderRadius: "var(--radius-input)", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}>
            Cancel
          </button>
        </div>
      )}

      {/* Footer — pin legend or hint */}
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
    </div>
  );
}
