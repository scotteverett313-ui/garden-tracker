import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import { ICONS, STATUSES, STATUS_COLORS, CARE_TYPES, CARE_ICONS, PLANT_DB, COMPANION_DB, CALENDAR_DATA, MONTHS, ICON_LIBRARY, lbl, sel, ZONES, DEFAULT_ZONES } from "../constants.js";
import { generateId, daysUntil, daysSince, formatDate, calcHarvestDate, getAutoIcon } from "../utils.js";
import { Modal } from "../components/Modal.jsx";
import { CTAButton } from "../components/CTAButton.jsx";

function getNextPlantSuggestions({ zone, harvestedPlant, frostDates, existingPlants }) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const firstFall = frostDates?.firstFall ? new Date(frostDates.firstFall) : null;
  const weeksToFrost = firstFall ? Math.floor((firstFall - today) / (1000 * 60 * 60 * 24 * 7)) : 99;

  // Get names already in this zone
  const inZone = existingPlants.filter(p => p.zone === zone && p.status !== "Harvesting").map(p => p.name);
  // Get bad companions of those plants
  const avoid = new Set(inZone.flatMap(n => COMPANION_DB[n]?.bad || []));
  // Get good companions of those plants
  const prefer = new Set(inZone.flatMap(n => COMPANION_DB[n]?.good || []));

  return CALENDAR_DATA
    .filter(p => {
      // Must be plantable this month or next in this zone
      const isOutdoorZone = zone === "Raised Beds" || zone === "In-Ground Beds";
      const isIndoorZone = zone === "Basement Grow Station" || zone === "Greenhouse";
      const plantableMonths = isOutdoorZone
        ? [...p.transplant, ...p.direct]
        : isIndoorZone
        ? p.indoors
        : [...p.indoors, ...p.transplant];
      const soonEnough = plantableMonths.includes(currentMonth) || plantableMonths.includes(currentMonth + 1);
      // Must have enough time before frost
      const dbEntry = PLANT_DB.find(d => d.name === p.name);
      const dtm = dbEntry?.dtm || 60;
      const enoughTime = weeksToFrost * 7 > dtm * 0.7;
      // Not already in this zone
      const notAlreadyGrowing = !inZone.includes(p.name);
      // Not the same as what was just harvested
      const notSame = p.name !== harvestedPlant;
      return soonEnough && enoughTime && notAlreadyGrowing && notSame;
    })
    .map(p => ({
      ...p,
      score: (prefer.has(p.name) ? 2 : 0) - (avoid.has(p.name) ? 3 : 0),
      isGoodCompanion: prefer.has(p.name),
      isBadCompanion: avoid.has(p.name),
    }))
    .filter(p => !p.isBadCompanion)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}


function HarvestTab({ plants, frostDates, onUpdate }) {
  const [window_, setWindow_] = useState(14);
  const [showNextFor, setShowNextFor] = useState(null);
  const today = new Date();

  // Bucket plants
  const readyNow = plants.filter(p => {
    const h = calcHarvestDate(p.dateStarted, p.dtm);
    if (!h) return p.status === "Harvesting";
    return daysUntil(h) <= 0 && p.status !== "Dormant";
  });

  const comingSoon = plants.filter(p => {
    const h = calcHarvestDate(p.dateStarted, p.dtm);
    if (!h) return false;
    const d = daysUntil(h);
    return d > 0 && d <= window_;
  }).sort((a, b) => daysUntil(calcHarvestDate(a.dateStarted, a.dtm)) - daysUntil(calcHarvestDate(b.dateStarted, b.dtm)));

  const upcoming = plants.filter(p => {
    const h = calcHarvestDate(p.dateStarted, p.dtm);
    if (!h) return false;
    const d = daysUntil(h);
    return d > window_;
  }).sort((a, b) => daysUntil(calcHarvestDate(a.dateStarted, a.dtm)) - daysUntil(calcHarvestDate(b.dateStarted, b.dtm)));

  const harvested = plants.filter(p => p.status === "Harvesting" || p.harvestedAt);

  function markHarvested(plant) {
    onUpdate({ ...plant, status: "Harvesting", harvestedAt: new Date().toISOString() });
  }

  function HarvestCard({ plant, showMark = true }) {
    const harvestDate = calcHarvestDate(plant.dateStarted, plant.dtm);
    const daysLeft = harvestDate ? daysUntil(harvestDate) : null;
    const statusObj = STATUSES.find(s => s.label === plant.status) || STATUSES[0];
    const imageUrl = plant.imageUrl || getAutoIcon(plant.name)?.url || null;
    const suggestions = showNextFor === plant.id
      ? getNextPlantSuggestions({ zone: plant.zone, harvestedPlant: plant.name, frostDates, existingPlants: plants })
      : [];

    return (
      <div className="harvest-row" style={{ position: "relative", marginBottom: 8, paddingBottom: 4 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 'var(--radius-card)', zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, background: "#fff", border: "2px solid #000", borderRadius: 'var(--radius-card)', padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
              <div style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {imageUrl
                  ? <img src={imageUrl} alt={plant.name} style={{ width: 44, height: 44, objectFit: "contain", imageRendering: "pixelated" }} />
                  : <img src={statusObj.img} alt={statusObj.label} style={{ width: 36, height: 36, objectFit: "contain" }} />}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: 16 }}>{plant.name}</span>
                  {plant.variety && <span style={{ color: "#888", fontSize: 13 }}>{plant.variety}</span>}
                  <span style={{ fontSize: 11, background: "#f0f0f0", color: "#555", padding: "2px 7px", borderRadius: 'var(--radius-input)', fontWeight: 600 }}>{plant.zone.split(" ")[0]}</span>
                </div>
                <div style={{ marginTop: 3 }}>
                  {daysLeft !== null && daysLeft > 0 && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: daysLeft <= 7 ? "#c0392b" : "#888" }}>{daysLeft}d · {formatDate(harvestDate)}</span>
                  )}
                  {(daysLeft === null || daysLeft <= 0) && plant.status === "Harvesting" && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#2d8a3f", display: "inline-flex", alignItems: "center", gap: 4 }}><img src={ICONS.harvest} alt="" style={{ width: 14, height: 14, objectFit: "contain" }} />{plant.type === "perennial" ? "In bloom" : "In harvest"}</span>
                  )}
                  {daysLeft !== null && daysLeft <= 0 && plant.status !== "Harvesting" && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#c0392b", display: "inline-flex", alignItems: "center", gap: 4 }}><img src={ICONS.harvest} alt="" style={{ width: 14, height: 14, objectFit: "contain" }} />{plant.type === "perennial" ? "Blooming!" : "Ready now!"}</span>
                  )}
                  {plant.harvestedAt && <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>· {formatDate(plant.harvestedAt)}</span>}
                </div>
              </div>
            </div>
            {showMark && plant.status !== "Harvesting" && (
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 3, bottom: 0, background: "#000", borderRadius: 'var(--radius-btn)', zIndex: 0 }} />
                <button onClick={() => markHarvested(plant)} className="btn-cta"
                  style={{ position: "relative", zIndex: 1, background: "#a8e063", color: "#000", border: "2.5px solid #000", borderRadius: 'var(--radius-btn)', padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 800 }}>
                  ✓ Harvest
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setShowNextFor(showNextFor === plant.id ? null : plant.id)}
            style={{ marginTop: 10, background: showNextFor === plant.id ? "#000" : "#f5f5f3", color: showNextFor === plant.id ? "#a8e063" : "#555", border: "2px solid #000", borderRadius: 'var(--radius-sm)', padding: "5px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
            <img src={ICONS.seedlingGreen} style={{width:14,height:14,objectFit:"contain",marginRight:4,verticalAlign:"middle"}} alt="" />{showNextFor === plant.id ? "Hide suggestions" : "What to plant next?"}
          </button>

          {showNextFor === plant.id && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f0f0f0" }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>After <strong>{plant.name}</strong> in {plant.zone.split(" ")[0]}:</div>
              {suggestions.length === 0 ? (
                <div style={{ fontSize: 13, color: "#bbb", fontStyle: "italic" }}>Nothing obvious — check the Calendar tab.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {suggestions.map(s => {
                    const dbEntry = PLANT_DB.find(d => d.name === s.name);
                    const isIndoor = plant.zone === "Basement Grow Station" || plant.zone === "Greenhouse";
                    const action = isIndoor ? "Start indoors" : (s.direct?.length ? "Direct sow" : "Transplant");
                    const sIconUrl = getAutoIcon(s.name)?.url;
                    return (
                      <div key={s.name} style={{ background: s.isGoodCompanion ? "#f0fdf4" : "#fafaf8", border: `2px solid ${s.isGoodCompanion ? "#a8e063" : "#e0e0e0"}`, borderRadius: 'var(--radius-input)', padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                        {sIconUrl
                          ? <img src={sIconUrl} alt={s.name} style={{ width: 32, height: 32, objectFit: "contain", imageRendering: "pixelated", flexShrink: 0 }} />
                          : <img src={ICONS.seedlingGreen} style={{width:20,height:20,objectFit:"contain",flexShrink:0}} alt="" />}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</span>
                            {s.isGoodCompanion && <span style={{ fontSize: 10, background: "#a8e063", color: "#000", padding: "1px 6px", borderRadius: 'var(--radius-sm)', fontWeight: 700, border: "1px solid #000" }}>Good companion</span>}
                          </div>
                          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{dbEntry?.dtm ? `${dbEntry.dtm} DTM · ` : ""}{action}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const noHarvestData = plants.filter(p => calcHarvestDate(p.dateStarted, p.dtm)).length === 0;

  const harvestRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".harvest-row").forEach((el) => {
        gsap.from(el, {
          x: -20,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            toggleActions: "play none none none",
          },
        });
      });
    }, harvestRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={harvestRef}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: "0 0 2px", fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>Harvest</h2>
          <p style={{ color: "#888", margin: 0, fontSize: 13 }}>Track what's ready and what's next.</p>
        </div>
        <select value={window_} onChange={e => setWindow_(Number(e.target.value))}
          style={{ border: "2px solid #000", borderRadius: 'var(--radius-btn)', padding: "6px 12px", fontSize: 13, fontWeight: 700, background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>

      {noHarvestData ? (
        <div style={{ border: "2px dashed #ccc", borderRadius: 'var(--radius-card)', padding: 48, textAlign: "center" }}>
          <img src={ICONS.harvest} style={{width:48,height:48,objectFit:"contain",marginBottom:12}} alt="" />
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>No harvest data yet</div>
          <div style={{ color: "#888", fontSize: 14 }}>Add plants with a start date and days-to-maturity to see timelines here.</div>
        </div>
      ) : (
        <>
          {readyNow.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Ready Now</h3>
                <span style={{ background: "#c0392b", color: "#fff", fontSize: 12, fontWeight: 800, padding: "2px 10px", borderRadius: 'var(--radius-card-lg)', border: "1.5px solid #000" }}>{readyNow.length}</span>
              </div>
              {readyNow.map(p => <HarvestCard key={p.id} plant={p} />)}
            </div>
          )}
          {comingSoon.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>In {window_} Days</h3>
                <span style={{ background: "#f0a500", color: "#000", fontSize: 12, fontWeight: 800, padding: "2px 10px", borderRadius: 'var(--radius-card-lg)', border: "1.5px solid #000" }}>{comingSoon.length}</span>
              </div>
              {comingSoon.map(p => <HarvestCard key={p.id} plant={p} />)}
            </div>
          )}
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 900 }}>Further Out</h3>
              {upcoming.map(p => <HarvestCard key={p.id} plant={p} showMark={false} />)}
            </div>
          )}
          {harvested.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 900 }}>Harvested This Season</h3>
              {harvested.map(p => <HarvestCard key={p.id} plant={p} showMark={false} />)}
            </div>
          )}
          {readyNow.length === 0 && comingSoon.length === 0 && (
            <div style={{ background: "#fdf0e0", border: "2px solid #000", borderRadius: 'var(--radius-card)', padding: 24, textAlign: "center" }}>
              <img src={ICONS.seedlingGreen} style={{width:36,height:36,objectFit:"contain",marginBottom:8}} alt="" />
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Still growing</div>
              <div style={{ color: "#666", fontSize: 14 }}>Nothing ready in the next {window_} days.</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── DB Search Picker ────────────────────────────────────────────────────────

export { HarvestTab };
