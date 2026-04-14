import { useState, useEffect, useRef } from "react";
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, CARE_ICONS, PLANT_DB, COMPANION_DB, CALENDAR_DATA, MONTHS, ICON_LIBRARY, lbl, sel, ZONES, DEFAULT_ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon } from "../utils.js";
import { Modal } from "./Modal.jsx";
import { CTAButton } from "./CTAButton.jsx";
import { IconPicker } from "./IconPicker.jsx";

function EditPlantModal({ plant, onSave, onClose, onDelete }) {
  const [form, setForm] = useState({ ...plant });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(
    plant.imageUrl ? ICON_LIBRARY.find(i => i.url === plant.imageUrl) || { name: "Custom", url: plant.imageUrl } : null
  );

  function handleIconSelect(icon) {
    setSelectedIcon(icon);
    setForm(f => ({ ...f, imageUrl: icon ? icon.url : "" }));
  }

  function handleSubmit() {
    onSave(form);
    onClose();
  }

  const input = (key, placeholder, type = "text") => (
    <input type={type} placeholder={placeholder} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
  );

  return (
    <Modal onClose={onClose}>
      <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700 }}>Edit Plant</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <div><label style={lbl}>Plant Name</label>{input("name", "Plant name")}</div>
        <div><label style={lbl}>Variety</label>{input("variety", "Variety")}</div>
        <div style={{ gridColumn: "span 2" }}><label style={lbl}>About</label><textarea value={form.about || ""} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", minHeight: 70, resize: "vertical" }} /></div>
        <div><label style={lbl}>💧 Water</label>
          <select value={form.water || ""} onChange={e => setForm(f => ({ ...f, water: e.target.value }))} style={sel}>
            <option value="">Select...</option>
            {["Low","Moderate","Regular","High"].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div><label style={lbl}>☀️ Sun</label>
          <select value={form.sun || ""} onChange={e => setForm(f => ({ ...f, sun: e.target.value }))} style={sel}>
            <option value="">Select...</option>
            {["Full Sun","Partial Shade","Full Shade"].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Zone</label>
          <select value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))} style={sel}>
            {ZONES.map(z => <option key={z}>{z}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={sel}>
            {STATUSES.map(s => <option key={s.label} value={s.label}>{s.icon} {s.label}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Date Started</label>{input("dateStarted", "", "date")}</div>
        <div><label style={lbl}>Days to Maturity</label>{input("dtm", "e.g. 75", "number")}</div>
        <div><label style={lbl}>Quantity</label>{input("quantity", "e.g. 4", "number")}</div>
        <div style={{ gridColumn: "span 2" }}><label style={lbl}>Notes</label><textarea value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", minHeight: 70, resize: "vertical" }} /></div>
        <div style={{ gridColumn: "span 2" }}>
          <IconPicker selected={selectedIcon} onSelect={handleIconSelect} plantName={form.name} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid #ccc", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 14 }}>Cancel</button>
        <CTAButton onClick={handleSubmit} style={{ padding: "11px 24px", fontSize: 14 }}>Save Changes</CTAButton>
      </div>

      {/* Delete zone — at the bottom, separated */}
      {onDelete && (
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #f0f0f0" }}>
          {confirmDelete ? (
            <div style={{ background: "#fdecea", border: "2px solid #c0392b", borderRadius: 12, padding: 16, textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#c0392b", marginBottom: 8 }}>Delete {plant.name}?</div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>This can't be undone.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onDelete(plant.id)}
                  style={{ flex: 1, padding: "10px", background: "#c0392b", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Yes, delete</button>
                <button onClick={() => setConfirmDelete(false)}
                  style={{ flex: 1, padding: "10px", background: "#fff", border: "1.5px solid #ccc", borderRadius: 10, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              style={{ width: "100%", padding: "11px", background: "none", border: "1.5px solid #e0e0e0", borderRadius: 12, cursor: "pointer", fontSize: 14, color: "#c0392b", fontWeight: 600 }}>
              🗑 Delete Plant
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}

export { EditPlantModal };
