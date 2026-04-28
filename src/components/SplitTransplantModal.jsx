import { useState } from "react";
import { generateId } from "../utils.js";
import { CTAButton } from "./CTAButton.jsx";

const PRE_TRANSPLANT = ["Seed", "Germinating", "Seedling"];

export function SplitTransplantModal({ plant, zones, onSplit, onClose }) {
  const total = parseInt(plant.quantity) || 1;
  const [rows, setRows] = useState([{ id: generateId(), zone: zones[0]?.name || "", quantity: "" }]);

  const assigned = rows.reduce((sum, r) => sum + (parseInt(r.quantity) || 0), 0);
  const remaining = total - assigned;
  const isOver = assigned > total;
  const canSave = rows.length > 0 && assigned > 0 && !isOver && rows.every(r => r.zone && parseInt(r.quantity) > 0);

  function addRow() {
    setRows(r => [...r, { id: generateId(), zone: zones[0]?.name || "", quantity: "" }]);
  }

  function removeRow(id) {
    setRows(r => r.filter(row => row.id !== id));
  }

  function updateRow(id, field, value) {
    setRows(r => r.map(row => row.id === id ? { ...row, [field]: value } : row));
  }

  function handleSave() {
    if (!canSave) return;
    const today = new Date().toISOString().split("T")[0];
    const newPlants = rows.map(row => ({
      ...plant,
      id: generateId(),
      zone: row.zone,
      quantity: parseInt(row.quantity),
      status: "Transplanted",
      transplantedAt: today,
      careLog: [],
      splitFrom: plant.id,
    }));

    // If all plants are split out, mark original as transplanted with 0 left.
    // If some remain, reduce original quantity.
    const updatedOriginal = remaining > 0
      ? { ...plant, quantity: remaining }
      : { ...plant, quantity: 0, status: "Transplanted", transplantedAt: today };

    onSplit(updatedOriginal, newPlants);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", padding: "28px 20px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Split & Transplant</div>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5, lineHeight: 1.1 }}>{plant.name}</div>
          <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
            {total} plant{total !== 1 ? "s" : ""} to distribute across zones
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
            <span style={{ color: isOver ? "#c0392b" : "#000" }}>{assigned} assigned</span>
            <span style={{ color: remaining > 0 ? "#888" : "#2d8a3f" }}>
              {remaining > 0 ? `${remaining} remaining` : "All assigned ✓"}
            </span>
          </div>
          <div style={{ height: 6, background: "#ebebeb", borderRadius: 'var(--radius-pill)', overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.min(100, (assigned / total) * 100)}%`,
              background: isOver ? "#c0392b" : assigned === total ? "#2d8a3f" : "#a8e063",
              borderRadius: 'var(--radius-pill)',
              transition: "width 0.2s ease",
            }} />
          </div>
        </div>

        {/* Zone rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {rows.map((row, i) => (
            <div key={row.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                value={row.zone}
                onChange={e => updateRow(row.id, "zone", e.target.value)}
                style={{ flex: 1, padding: "10px 12px", border: "2px solid #000", borderRadius: 'var(--radius-input)', fontSize: 14, fontFamily: "inherit", background: "#fff", appearance: "none" }}
              >
                {zones.map(z => <option key={z.id} value={z.name}>{z.icon} {z.name}</option>)}
              </select>
              <input
                type="number"
                min="1"
                max={total}
                placeholder="Qty"
                value={row.quantity}
                onChange={e => updateRow(row.id, "quantity", e.target.value)}
                style={{ width: 64, padding: "10px 10px", border: "2px solid #000", borderRadius: 'var(--radius-input)', fontSize: 14, fontFamily: "inherit", textAlign: "center" }}
              />
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(row.id)}
                  style={{ width: 36, height: 36, border: "1.5px solid #ddd", borderRadius: 'var(--radius-sm)', background: "#fff", cursor: "pointer", fontSize: 16, color: "#888", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                >×</button>
              )}
            </div>
          ))}
        </div>

        {/* Add zone row */}
        <button
          onClick={addRow}
          style={{ width: "100%", padding: "10px", border: "2px dashed #ccc", borderRadius: 'var(--radius-input)', background: "transparent", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#888", marginBottom: 24 }}
        >
          + Add another zone
        </button>

        {/* Remaining note */}
        {remaining > 0 && assigned > 0 && !isOver && (
          <div style={{ background: "#f5f5f3", borderRadius: 'var(--radius-input)', padding: "10px 14px", fontSize: 13, color: "#666", marginBottom: 20 }}>
            <strong>{remaining}</strong> plant{remaining !== 1 ? "s" : ""} will stay in <strong>{plant.zone}</strong> as {plant.status.toLowerCase()}.
          </div>
        )}

        {isOver && (
          <div style={{ background: "#fdecea", borderRadius: 'var(--radius-input)', padding: "10px 14px", fontSize: 13, color: "#c0392b", marginBottom: 20 }}>
            You've assigned more than {total} — reduce the quantities above.
          </div>
        )}

        {/* Actions */}
        <CTAButton onClick={handleSave} disabled={!canSave}>
          Transplant {assigned > 0 ? assigned : ""} Plant{assigned !== 1 ? "s" : ""}
        </CTAButton>
        <button
          onClick={onClose}
          style={{ width: "100%", marginTop: 12, padding: "12px", border: "none", background: "transparent", cursor: "pointer", fontSize: 14, color: "#888", fontFamily: "inherit" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export { PRE_TRANSPLANT };
