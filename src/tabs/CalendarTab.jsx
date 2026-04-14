import { useState, useEffect, useRef } from "react";
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, CARE_ICONS, PLANT_DB, COMPANION_DB, CALENDAR_DATA, MONTHS, ICON_LIBRARY, lbl, sel, ZONES, DEFAULT_ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon } from "../utils.js";
import { Modal } from "../components/Modal.jsx";
import { CTAButton } from "../components/CTAButton.jsx";

function CalendarTab({ plants }) {
  const currentMonth = new Date().getMonth();

  // Get unique plant names from user's garden and match to CALENDAR_DATA
  const myPlantNames = [...new Set(plants.map(p => p.name))];

  // Build calendar rows: use CALENDAR_DATA if match exists, otherwise build basic row from plant data
  const calendarRows = myPlantNames.map(name => {
    const calEntry = CALENDAR_DATA.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (calEntry) return { ...calEntry, variety: plants.find(p => p.name === name)?.variety };
    // For plants not in CALENDAR_DATA, derive basic timing from dateStarted
    const plant = plants.find(p => p.name === name);
    const startedMonth = plant?.dateStarted ? new Date(plant.dateStarted).getMonth() + 1 : null;
    return {
      name,
      variety: plant?.variety,
      type: "My Plant",
      indoors: startedMonth ? [startedMonth] : [],
      transplant: [],
      direct: [],
      custom: true,
      dateStarted: plant?.dateStarted,
    };
  });

  if (calendarRows.length === 0) {
    return (
      <div>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>Seasonal Planting Calendar</h2>
        <p style={{ color: "#888", marginBottom: 20, fontSize: 14 }}>Shows timing for plants you've started.</p>
        <div style={{ border: "1.5px dashed #ddd", borderRadius: 14, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <div style={{ color: "#888", fontSize: 15 }}>No plants added yet.</div>
          <div style={{ color: "#bbb", fontSize: 14, marginTop: 4 }}>Add plants in My Garden and they'll appear here.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>Seasonal Planting Calendar</h2>
      <p style={{ color: "#888", marginBottom: 16, fontSize: 14 }}>Based on your {calendarRows.length} plant{calendarRows.length !== 1 ? "s" : ""}. I = Start Indoors · T = Transplant · D = Direct Sow · ★ = Your start date</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { label: "Start Indoors", color: "#e8e4f8", text: "#5a4aaa" },
          { label: "Transplant", color: "#f5ece0", text: "#5c3d1e" },
          { label: "Direct Sow", color: "#fef3c7", text: "#92400e" },
          { label: "Your start", color: "#fff3cd", text: "#856404" },
        ].map(b => (
          <span key={b.label} style={{ background: b.color, color: b.text, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>{b.label}</span>
        ))}
      </div>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
          <thead>
            <tr style={{ background: "#f8f8f8" }}>
              <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, width: 150, borderBottom: "1px solid #eee", position: "sticky", left: 0, background: "#f8f8f8", zIndex: 2 }}>Plant</th>
              {MONTHS.map((m, i) => (
                <th key={m} style={{ textAlign: "center", padding: "10px 4px", fontWeight: 600, width: 44, borderBottom: "1px solid #eee", color: i === currentMonth ? "#5c3d1e" : "#555", background: i === currentMonth ? "#fdf6ee" : "#f8f8f8", fontSize: 12 }}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendarRows.map((plant, i) => {
              const startedMonth = plant.dateStarted ? new Date(plant.dateStarted).getMonth() + 1 : null;
              return (
                <tr key={plant.name + i} style={{ background: i % 2 === 0 ? "#fff" : "#fafaf8" }}>
                  <td style={{ padding: "8px 14px", fontWeight: 600, fontSize: 13, position: "sticky", left: 0, background: i % 2 === 0 ? "#fff" : "#fafaf8", zIndex: 1, borderRight: "1px solid #f0f0f0" }}>
                    <div>{plant.name}</div>
                    {plant.variety && <div style={{ fontWeight: 400, color: "#888", fontSize: 12 }}>{plant.variety}</div>}
                  </td>
                  {MONTHS.map((m, mi) => {
                    const mo = mi + 1;
                    const isStarted = startedMonth === mo;
                    const isI = !plant.custom && plant.indoors.includes(mo);
                    const isT = !plant.custom && plant.transplant.includes(mo);
                    const isD = !plant.custom && plant.direct.includes(mo);
                    const isCurrent = mi === currentMonth;
                    let bg = "transparent", color = "transparent", label = "";
                    if (isStarted) { bg = "#fff3cd"; color = "#856404"; label = "★"; }
                    else if (isI) { bg = "#e8e4f8"; color = "#5a4aaa"; label = "I"; }
                    else if (isT) { bg = "#f5ece0"; color = "#5c3d1e"; label = "T"; }
                    else if (isD) { bg = "#fef3c7"; color = "#92400e"; label = "D"; }
                    return (
                      <td key={m} style={{ textAlign: "center", padding: "4px 2px", background: isCurrent ? "#f8fff8" : "transparent" }}>
                        {label && <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: bg, color, fontWeight: 700, fontSize: 12, width: 26, height: 26, borderRadius: 6 }}>{label}</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { CalendarTab };
