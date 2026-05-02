import { CALENDAR_DATA, MONTHS } from "../constants.js";
import { getAutoIcon } from "../utils.js";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const ACTION_TYPES = [
  { key: "indoors",    label: "Start Indoors", bg: "#e8e4f8", color: "#5a4aaa" },
  { key: "transplant", label: "Transplant",    bg: "#f5ece0", color: "#5c3d1e" },
  { key: "direct",    label: "Direct Sow",     bg: "#fef3c7", color: "#92400e" },
];

function CalendarTab({ plants, frostDates, seeds = [] }) {
  const today = new Date();
  const monthIdx = today.getMonth();     // 0-based, for array indexing
  const monthNum = monthIdx + 1;         // 1-based, for CALENDAR_DATA arrays
  const monthName = MONTH_NAMES[monthIdx];

  // ── This Month ────────────────────────────────────────────────────────────
  const seen = { indoors: new Set(), transplant: new Set(), direct: new Set() };
  const thisMonth = { indoors: [], transplant: [], direct: [] };

  plants.forEach(plant => {
    const cal = CALENDAR_DATA.find(c => c.name.toLowerCase() === plant.name.toLowerCase());
    if (!cal) return;
    ACTION_TYPES.forEach(({ key }) => {
      if (cal[key].includes(monthNum) && !seen[key].has(plant.name)) {
        seen[key].add(plant.name);
        thisMonth[key].push(plant);
      }
    });
  });

  const hasThisMonth = ACTION_TYPES.some(a => thisMonth[a.key].length > 0);

  // ── Seeds you have that are good to plant this month ──────────────────────
  const activePlantNames = new Set(
    plants.filter(p => !["Harvested", "Dead"].includes(p.status)).map(p => p.name.toLowerCase())
  );
  const fromSeeds = { indoors: [], transplant: [], direct: [] };
  const seenSeeds = { indoors: new Set(), transplant: new Set(), direct: new Set() };

  seeds.forEach(seed => {
    if (!seed.name) return;
    const cal = CALENDAR_DATA.find(c => c.name.toLowerCase() === seed.name.toLowerCase());
    if (!cal) return;
    if (activePlantNames.has(seed.name.toLowerCase())) return; // already growing
    ACTION_TYPES.forEach(({ key }) => {
      if (cal[key].includes(monthNum) && !seenSeeds[key].has(seed.name.toLowerCase())) {
        seenSeeds[key].add(seed.name.toLowerCase());
        fromSeeds[key].push(seed);
      }
    });
  });

  const hasFromSeeds = ACTION_TYPES.some(a => fromSeeds[a.key].length > 0);

  // ── Coming Up ─────────────────────────────────────────────────────────────
  const comingUp = plants
    .filter(p => p.dateStarted && p.dtm && !["Harvested", "Dead"].includes(p.status))
    .map(p => {
      const start = new Date(p.dateStarted + "T12:00:00");
      const harvestDate = new Date(start.getTime() + Number(p.dtm) * 86400000);
      const daysLeft = Math.ceil((harvestDate - today) / 86400000);
      return { ...p, daysLeft };
    })
    .filter(p => p.daysLeft <= 60 && p.daysLeft > -14)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // ── Reference table rows ──────────────────────────────────────────────────
  const myPlantNames = [...new Set(plants.map(p => p.name))];
  const calendarRows = myPlantNames.map(name => {
    const cal = CALENDAR_DATA.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (cal) return { ...cal, variety: plants.find(p => p.name === name)?.variety };
    const plant = plants.find(p => p.name === name);
    const startedMonth = plant?.dateStarted ? new Date(plant.dateStarted).getMonth() + 1 : null;
    return { name, variety: plant?.variety, indoors: startedMonth ? [startedMonth] : [], transplant: [], direct: [], custom: true, dateStarted: plant?.dateStarted };
  });

  if (plants.length === 0) {
    return (
      <div>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 800 }}>Calendar</h2>
        <div style={{ border: "1.5px dashed #ddd", borderRadius: "var(--radius-card-sm)", padding: 48, textAlign: "center", marginTop: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <div style={{ color: "#888", fontSize: 15 }}>No plants added yet.</div>
          <div style={{ color: "#bbb", fontSize: 14, marginTop: 4 }}>Add plants in My Garden and they'll appear here.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800 }}>Calendar</h2>

      {/* ── This Month ──────────────────────────────────────── */}
      {(hasThisMonth || hasFromSeeds) && (
        <div style={{ position: "relative", paddingBottom: 5, marginBottom: 20 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 5, bottom: 0, background: "#000", borderRadius: "var(--radius-card)", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1, background: "#fff", border: "2px solid #000", borderRadius: "var(--radius-card)", padding: "18px 18px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>{monthName}</div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.5, marginBottom: 16 }}>What to do this month</div>

            {/* Garden plants */}
            {hasThisMonth && ACTION_TYPES.filter(a => thisMonth[a.key].length > 0).map(action => (
              <div key={action.key} style={{ marginBottom: 14 }}>
                <span style={{ background: action.bg, color: action.color, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-pill)", display: "inline-block", marginBottom: 8 }}>
                  {action.label}
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {thisMonth[action.key].map(plant => {
                    const icon = getAutoIcon(plant.name);
                    return (
                      <div key={plant.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5f5f3", border: "1.5px solid #e8e8e8", borderRadius: "var(--radius-card-sm)", padding: "6px 10px" }}>
                        {icon && <img src={icon.url} alt="" style={{ width: 20, height: 20, objectFit: "contain", imageRendering: "pixelated" }} />}
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{plant.name}</span>
                        {plant.variety && <span style={{ fontSize: 12, color: "#999" }}>{plant.variety}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Seeds in library */}
            {hasFromSeeds && (
              <>
                {hasThisMonth && <div style={{ borderTop: "1px solid #f0f0f0", margin: "4px 0 14px" }} />}
                <div style={{ fontSize: 11, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>From your seeds</div>
                {ACTION_TYPES.filter(a => fromSeeds[a.key].length > 0).map(action => (
                  <div key={action.key} style={{ marginBottom: 14 }}>
                    <span style={{ background: action.bg, color: action.color, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-pill)", display: "inline-block", marginBottom: 8 }}>
                      {action.label}
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {fromSeeds[action.key].map(seed => {
                        const icon = getAutoIcon(seed.name);
                        return (
                          <div key={seed.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fffdf5", border: "1.5px dashed #d4a96a", borderRadius: "var(--radius-card-sm)", padding: "6px 10px" }}>
                            {icon && <img src={icon.url} alt="" style={{ width: 20, height: 20, objectFit: "contain", imageRendering: "pixelated" }} />}
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{seed.name}</span>
                            {seed.variety && <span style={{ fontSize: 12, color: "#999" }}>{seed.variety}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Coming Up ───────────────────────────────────────── */}
      {comingUp.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>Harvest Countdown</div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {comingUp.map(plant => {
              const icon = getAutoIcon(plant.name);
              const isReady = plant.daysLeft <= 0 && plant.daysLeft > -14;
              const isOverdue = plant.daysLeft < 0;
              const bg = isReady ? "#f0fbe0" : "#fff";
              const borderColor = isReady ? "#a8e063" : "#e8e8e8";
              const label = isOverdue ? `${Math.abs(plant.daysLeft)}d late` : isReady ? "Ready!" : `${plant.daysLeft}d`;
              const labelColor = isOverdue ? "#c0392b" : isReady ? "#5a9e2a" : "#555";
              return (
                <div key={plant.id} style={{ flexShrink: 0, width: 86, background: bg, border: `2px solid ${borderColor}`, borderRadius: "var(--radius-card-sm)", padding: "12px 8px", textAlign: "center" }}>
                  {icon
                    ? <img src={icon.url} alt="" style={{ width: 36, height: 36, objectFit: "contain", imageRendering: "pixelated", marginBottom: 6, display: "block", margin: "0 auto 6px" }} />
                    : <div style={{ height: 42, marginBottom: 6 }} />
                  }
                  <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 2, lineHeight: 1.2 }}>{plant.name}</div>
                  {plant.variety && <div style={{ fontSize: 10, color: "#aaa", marginBottom: 4 }}>{plant.variety}</div>}
                  <div style={{ fontSize: 13, fontWeight: 900, color: labelColor }}>{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Full Season Reference Table ──────────────────────── */}
      <div style={{ fontSize: 11, fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Full Season Calendar</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {[
          { label: "Start Indoors", bg: "#e8e4f8", color: "#5a4aaa" },
          { label: "Transplant",    bg: "#f5ece0", color: "#5c3d1e" },
          { label: "Direct Sow",   bg: "#fef3c7", color: "#92400e" },
          { label: "Your start",   bg: "#fff3cd", color: "#856404" },
        ].map(b => (
          <span key={b.label} style={{ background: b.bg, color: b.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-card-lg)" }}>{b.label}</span>
        ))}
      </div>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
          <thead>
            <tr style={{ background: "#f8f8f8" }}>
              <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, width: 150, borderBottom: "1px solid #eee", position: "sticky", left: 0, background: "#f8f8f8", zIndex: 2 }}>Plant</th>
              {MONTHS.map((m, i) => (
                <th key={m} style={{ textAlign: "center", padding: "10px 4px", fontWeight: 600, width: 44, borderBottom: "1px solid #eee", color: i === monthIdx ? "#5c3d1e" : "#555", background: i === monthIdx ? "#fdf6ee" : "#f8f8f8", fontSize: 12 }}>{m}</th>
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
                    let bg = "transparent", color = "transparent", label = "";
                    if (isStarted)     { bg = "#fff3cd"; color = "#856404"; label = "★"; }
                    else if (isI)      { bg = "#e8e4f8"; color = "#5a4aaa"; label = "I"; }
                    else if (isT)      { bg = "#f5ece0"; color = "#5c3d1e"; label = "T"; }
                    else if (isD)      { bg = "#fef3c7"; color = "#92400e"; label = "D"; }
                    return (
                      <td key={m} style={{ textAlign: "center", padding: "4px 2px", background: mi === monthIdx ? "#f8fff8" : "transparent" }}>
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
