import { ICONS, STATUSES } from "../constants.js";
import { daysSince, formatDate, getAutoIcon } from "../utils.js";

function StatCard({ value, label }) {
  return (
    <div style={{ flex: 1, background: "#fff", border: "2px solid #000", borderRadius: "var(--radius-card-sm)", padding: "12px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}

function ProfileTab({ plants, frostDates, user, onOpenSettings }) {
  const currentYear = new Date().getFullYear();
  const today = new Date();

  // Stats
  const activePlants = plants.filter(p => !["Harvested", "Dead"].includes(p.status));
  const harvestedThisYear = plants.filter(p =>
    p.status === "Harvested" && p.harvestedAt?.startsWith(String(currentYear))
  );
  const totalCareActions = plants.reduce((sum, p) => sum + (p.careLog?.length || 0), 0);

  // Season math
  const spring = frostDates.lastSpring ? new Date(frostDates.lastSpring + "T12:00:00") : null;
  const fall = frostDates.firstFall ? new Date(frostDates.firstFall + "T12:00:00") : null;
  const daysToFall = fall ? Math.ceil((fall - today) / 86400000) : null;
  const daysToSpring = spring ? Math.ceil((spring - today) / 86400000) : null;
  const daysInSeason = spring ? Math.max(0, Math.floor((today - spring) / 86400000)) : null;
  const seasonPct = spring && fall
    ? Math.min(100, Math.max(0, ((today - spring) / (fall - spring)) * 100))
    : null;

  // Seasonal alerts
  const alerts = [];
  if (daysToFall !== null) {
    if (daysToFall <= 0) {
      alerts.push({ icon: "❄️", text: "First frost has passed — wrap up the warm season.", bg: "#e8f0ff" });
    } else if (daysToFall <= 14) {
      alerts.push({ icon: "🧊", text: `First frost in ${daysToFall} days — harvest remaining warm-season crops now.`, bg: "#fdecea", strong: true });
    } else if (daysToFall <= 30) {
      alerts.push({ icon: "🧣", text: `Frost in ${daysToFall} days — start protecting tender plants.`, bg: "#fdf6ee" });
    } else if (daysToFall <= 60) {
      alerts.push({ icon: "🌾", text: `${daysToFall} days until first frost — good time to get fall crops in.`, bg: "#f0fbe0" });
    }
  }
  if (daysToSpring !== null && daysToSpring > 0 && daysToSpring <= 30) {
    alerts.push({ icon: "🌱", text: `Last frost in ${daysToSpring} days — start warm-season seedlings indoors now.`, bg: "#f0fbe0" });
  }
  if (daysInSeason !== null && daysInSeason >= 0 && daysInSeason <= 7) {
    alerts.push({ icon: "🎉", text: `Growing season started ${daysInSeason} day${daysInSeason !== 1 ? "s" : ""} ago — great time to get plants in the ground.`, bg: "#f0fbe0" });
  }

  // Harvest log (this year, newest first)
  const harvestLog = plants
    .filter(p => p.harvestedAt?.startsWith(String(currentYear)))
    .sort((a, b) => new Date(b.harvestedAt) - new Date(a.harvestedAt));

  const displayName = user?.name || "Your Garden";
  const initial = (user?.name || user?.email || "G")[0].toUpperCase();

  return (
    <div>
      {/* ── Hero header ────────────────────────────────── */}
      <div style={{ background: "#a8e063", border: "2px solid #000", borderRadius: "var(--radius-card)", padding: "24px 20px 20px", marginBottom: 16, position: "relative" }}>
        {/* Settings button */}
        <button onClick={onOpenSettings} style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, border: "2px solid #000", borderRadius: "var(--radius-icon)", background: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={ICONS.settings} alt="Settings" style={{ width: 18, height: 18, objectFit: "contain" }} />
        </button>

        {/* Avatar */}
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff", border: "3px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 28, marginBottom: 12 }}>
          {initial}
        </div>

        <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: -0.5, lineHeight: 1.1 }}>{displayName}</div>

        {frostDates.zone && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, background: "rgba(0,0,0,0.12)", borderRadius: 99, padding: "4px 10px" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#000" }}>Zone {frostDates.zone}</span>
          </div>
        )}

        {/* Season progress bar */}
        {seasonPct !== null && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.6)", textTransform: "uppercase", letterSpacing: 0.5 }}>Growing Season</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.6)" }}>{Math.round(seasonPct)}%</span>
            </div>
            <div style={{ height: 8, background: "rgba(0,0,0,0.15)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${seasonPct}%`, background: "#fff", borderRadius: 99, transition: "width 0.3s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>{formatDate(frostDates.lastSpring)}</span>
              <span style={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>{formatDate(frostDates.firstFall)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Season stats row ───────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <StatCard value={activePlants.length} label="Growing" />
        <StatCard value={harvestedThisYear.length} label={`${currentYear} Harvest`} />
        <StatCard value={totalCareActions} label="Care Logs" />
        <StatCard value={daysInSeason !== null ? `${daysInSeason}d` : "—"} label="In Season" />
      </div>

      {/* ── Seasonal alerts ────────────────────────────── */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.5, marginBottom: 10 }}>Seasonal Alerts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alerts.map((alert, i) => (
              <div key={i} style={{ background: alert.bg, border: `2px solid ${alert.strong ? "#c0392b" : "#000"}`, borderRadius: "var(--radius-card-sm)", padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{alert.icon}</span>
                <span style={{ fontSize: 14, fontWeight: alert.strong ? 700 : 500, lineHeight: 1.4, color: alert.strong ? "#c0392b" : "#000" }}>{alert.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── No frost dates nudge ───────────────────────── */}
      {!spring && !fall && (
        <div style={{ marginBottom: 20 }}>
          <button onClick={onOpenSettings} style={{ width: "100%", background: "#fdf6ee", border: "2px dashed #d4a96a", borderRadius: "var(--radius-card-sm)", padding: "16px 20px", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 3 }}>❄️ Set your frost dates</div>
            <div style={{ fontSize: 13, color: "#888" }}>Get seasonal alerts tailored to your growing zone →</div>
          </button>
        </div>
      )}

      {/* ── Harvest log ────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: -0.5 }}>{currentYear} Harvest Log</div>
          {harvestLog.length > 0 && (
            <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>{harvestLog.length} plant{harvestLog.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {harvestLog.length === 0 ? (
          <div style={{ border: "2px dashed #ddd", borderRadius: "var(--radius-card-sm)", padding: "28px 20px", textAlign: "center", color: "#bbb" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🧺</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#bbb" }}>Nothing harvested yet this year</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Mark a plant as Harvested to log it here</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {harvestLog.map(p => {
              const imageUrl = p.imageUrl || getAutoIcon(p.name)?.url || null;
              const statusObj = STATUSES.find(s => s.label === p.status) || STATUSES[0];
              return (
                <div key={p.id} style={{ position: "relative", paddingBottom: 4 }}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: "var(--radius-card-sm)", zIndex: 0 }} />
                  <div style={{ position: "relative", zIndex: 1, background: "#fff", border: "2px solid #000", borderRadius: "var(--radius-card-sm)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, background: "#f5f5f3", borderRadius: "var(--radius-icon)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {imageUrl
                        ? <img src={imageUrl} alt={p.name} style={{ width: 34, height: 34, objectFit: "contain", imageRendering: "pixelated" }} />
                        : <img src={statusObj.img} alt={statusObj.label} style={{ width: 26, height: 26, objectFit: "contain" }} />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{p.name}</div>
                      {p.variety && <div style={{ fontSize: 12, color: "#888" }}>{p.variety}</div>}
                      {p.zone && <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{p.zone.replace(" Grow Station", "").replace("In-Ground Beds", "In-Ground")}</div>}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#2d8a3f" }}>✅ Harvested</div>
                      <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{formatDate(p.harvestedAt)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Discord nudge ──────────────────────────────── */}
      <div style={{ background: "#f5f0ff", border: "2px solid #c4a8ff", borderRadius: "var(--radius-card-sm)", padding: "16px 18px", marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>💬</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 3 }}>Join the community</div>
          <div style={{ fontSize: 13, color: "#666", lineHeight: 1.4 }}>Share harvests, ask questions, swap seeds — on Discord while we build.</div>
        </div>
      </div>
    </div>
  );
}

export { ProfileTab };
