import { useState, useEffect, useRef } from "react";
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, CARE_ICONS, PLANT_DB, COMPANION_DB, CALENDAR_DATA, MONTHS, ICON_LIBRARY, lbl, sel, ZONES, DEFAULT_ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon } from "../utils.js";
import { Modal } from "./Modal.jsx";
import { CTAButton } from "./CTAButton.jsx";
import { IconPicker } from "./IconPicker.jsx";
import { DBSearchPicker } from "./DBSearchPicker.jsx";
import { SeedScanPicker } from "./SeedScanPicker.jsx";

function AddPlantModal({ onAdd, onClose, userDB, onSaveUserDB, prefill, zones = DEFAULT_ZONES }) {
  const [form, setForm] = useState({
    name: prefill?.name || "",
    variety: prefill?.variety || "",
    about: prefill?.about || "",
    water: prefill?.water || "",
    sun: prefill?.sun || "",
    zone: zones[0]?.name || ZONES[0],
    status: "Seed",
    dateStarted: new Date().toISOString().split("T")[0],
    dtm: prefill?.dtm || "",
    quantity: "",
    notes: "",
    imageUrl: prefill?.imageUrl || "",
  });
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const [nameError, setNameError] = useState(false);

  function handleNameChange(val) {
    setForm(f => ({ ...f, name: val }));
    if (val.trim()) setNameError(false);
    if (!selectedIcon) {
      const auto = getAutoIcon(val);
      if (auto) setForm(f => ({ ...f, imageUrl: auto.url }));
    }
    if (val.length > 1) {
      const builtIn = PLANT_DB.filter(p => p.name.toLowerCase().startsWith(val.toLowerCase()));
      const custom = (userDB || []).filter(p => p.name.toLowerCase().startsWith(val.toLowerCase()) && !builtIn.find(b => b.name.toLowerCase() === p.name.toLowerCase()));
      const all = [...builtIn, ...custom.map(p => ({ ...p, isCustom: true }))];
      setSuggestions(all);
      setShowSugg(all.length > 0);
    } else {
      setShowSugg(false);
    }
  }

  function handleIconSelect(icon) {
    setSelectedIcon(icon);
    setForm(f => ({ ...f, imageUrl: icon ? icon.url : "" }));
  }

  function selectSuggestion(plant) {
    setForm(f => ({ ...f, name: plant.name, about: plant.about || "", water: plant.water || "", sun: plant.sun || "", dtm: plant.dtm || "" }));
    if (!selectedIcon) {
      const auto = getAutoIcon(plant.name);
      if (auto) setForm(f => ({ ...f, imageUrl: auto.url }));
    }
    setShowSugg(false);
  }

  function handleSubmit() {
    if (!form.name.trim()) { setNameError(true); return; }
    const plant = { ...form, id: generateId(), companions: { good: [...(COMPANION_DB[form.name]?.good || [])], bad: [...(COMPANION_DB[form.name]?.bad || [])] }, careLog: [] };
    onAdd(plant);
    const inBuiltIn = PLANT_DB.find(p => p.name.toLowerCase() === form.name.toLowerCase());
    const inUserDB = (userDB || []).find(p => p.name.toLowerCase() === form.name.toLowerCase());
    if (!inBuiltIn && !inUserDB && form.name.trim()) {
      onSaveUserDB([...(userDB || []), { name: form.name.trim(), dtm: form.dtm, water: form.water, sun: form.sun, about: form.about, addedAt: new Date().toISOString() }]);
    } else if (!inBuiltIn && inUserDB) {
      onSaveUserDB((userDB || []).map(p => p.name.toLowerCase() === form.name.toLowerCase() ? { ...p, dtm: form.dtm || p.dtm, water: form.water || p.water, sun: form.sun || p.sun, about: form.about || p.about } : p));
    }
    onClose();
  }

  const input = (key, placeholder, type = "text") => (
    <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 'var(--radius-input)', fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
  );

  return (
    <Modal onClose={onClose}>
      <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700 }}>Add New Plant</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <div style={{ position: "relative", paddingBottom: 3 }}>
          <label style={lbl}>Plant Name *</label>
          <input placeholder="e.g. Tomato" value={form.name} onChange={e => handleNameChange(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${nameError ? "#c0392b" : "#3a7a4a"}`, borderRadius: 'var(--radius-input)', fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
          {nameError && <div style={{ fontSize: 12, color: "#c0392b", marginTop: 4, fontWeight: 600 }}>Plant name is required</div>}
          {showSugg && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 'var(--radius-input)', zIndex: 10, boxShadow: "var(--shadow-soft)", maxHeight: 200, overflowY: "auto" }}>
              {suggestions.map(p => (
                <div key={p.name} onClick={() => selectSuggestion(p)} style={{ padding: "10px 14px", cursor: "pointer", fontSize: 14, borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fdf6ee"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                  <span>{p.name}</span>
                  {p.isCustom && <span style={{ fontSize: 11, background: "#fff3cd", color: "#856404", padding: "2px 7px", borderRadius: 'var(--radius-input)', fontWeight: 600 }}>my db</span>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div><label style={lbl}>Variety</label>{input("variety", "e.g. Cherokee Purple")}</div>
        <div style={{ gridColumn: "span 2" }}>
          <IconPicker selected={selectedIcon} onSelect={handleIconSelect} plantName={form.name} />
        </div>
        <div style={{ gridColumn: "span 2" }}><label style={lbl}>About</label><textarea placeholder="Short description or growing tips..." value={form.about} onChange={e => setForm(f => ({ ...f, about: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 'var(--radius-input)', fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", minHeight: 70, resize: "vertical" }} /></div>
        <div><label style={lbl}><img src={ICONS.water} style={{width:14,height:14,objectFit:"contain",marginRight:4,verticalAlign:"middle"}} alt="" />Water</label>
          <select value={form.water} onChange={e => setForm(f => ({ ...f, water: e.target.value }))} style={sel}>
            <option value="">Select...</option>
            {["Low","Moderate","Regular","High"].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div><label style={lbl}><img src={ICONS.sun} style={{width:14,height:14,objectFit:"contain",marginRight:4,verticalAlign:"middle"}} alt="" />Sun</label>
          <select value={form.sun} onChange={e => setForm(f => ({ ...f, sun: e.target.value }))} style={sel}>
            <option value="">Select...</option>
            {["Full Sun","Partial Shade","Full Shade"].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Zone *</label>
          <select value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))} style={sel}>
            {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
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
        <div style={{ gridColumn: "span 2" }}><label style={lbl}>Notes</label><textarea placeholder="Optional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 'var(--radius-input)', fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", minHeight: 70, resize: "vertical" }} /></div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
        <button onClick={onClose} style={{ padding: "10px 20px", border: "1.5px solid #ccc", borderRadius: 'var(--radius-input)', background: "#fff", cursor: "pointer", fontSize: 14 }}>Cancel</button>
        <CTAButton onClick={handleSubmit} style={{ padding: "11px 24px", fontSize: 14 }}>+ Add Plant</CTAButton>
      </div>
    </Modal>
  );
}

export { AddPlantModal };
