import { ICONS, STATUSES, CARE_ICONS } from "../constants.js";
import { daysSince, formatDate, getAutoIcon } from "../utils.js";

// ── Mini sparkline from care log entries ──────────────────────────────────────
function ActivitySparkline({ plants }) {
  const W = 280, H = 56;
  const days = 14;
  const today = new Date();

  // Count care actions per day over last 14 days
  const counts = Array(days).fill(0);
  plants.forEach(p => {
    (p.careLog || []).forEach(e => {
      const d = daysSince(e.date);
      if (d >= 0 && d < days) counts[days - 1 - d]++;
    });
  });

  const max = Math.max(...counts, 1);
  const pts = counts.map((c, i) => {
    const x = (i / (days - 1)) * W;
    const y = H - (c / max) * (H - 8) - 4;
    return `${x},${y}`;
  }).join(" ");

  const fillPts = `0,${H} ` + pts + ` ${W},${H}`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill="url(#sparkGrad)" />
      <polyline points={pts} fill="none" stroke="#00d4ff" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Holdings row (one status = one "coin") ────────────────────────────────────
const STATUS_ACCENT = {
  "Seed": "#c4a265", "Germinating": "#7db87d", "Seedling": "#5a9e5a",
  "Transplanted": "#e8a855", "Growing": "#6ab06a", "Flowering": "#c47db8",
  "Fruiting": "#e06060", "Harvesting": "#8abe5a", "Dormant": "#aaaaaa",
  "Harvested": "#4caf7d", "Dead": "#888888",
};

function HoldingRow({ status, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const color = STATUS_ACCENT[status] || "#aaa";
  const statusObj = STATUSES.find(s => s.label === status);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <img src={statusObj?.img} alt={status} style={{ width: 20, height: 20, objectFit: "contain" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{status}</div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{count}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{Math.round(pct)}%</div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function ProfileTab({ plants, frostDates, user, onOpenSettings }) {
  const currentYear = new Date().getFullYear();
  const today = new Date();

  // Portfolio stats
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

  // Holdings — group active plants by status
  const holdingGroups = STATUSES
    .map(s => ({ status: s.label, count: activePlants.filter(p => p.status === s.label).length }))
    .filter(g => g.count > 0);

  // Recent activity — last 8 care log entries across all plants
  const recentActivity = plants
    .flatMap(p => (p.careLog || []).map(e => ({ ...e, plantName: p.name, plantIcon: p.imageUrl || getAutoIcon(p.name)?.url })))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  // Seasonal alerts
  const alerts = [];
  if (daysToFall !== null && daysToFall > 0 && daysToFall <= 14)
    alerts.push({ icon: "🧊", text: `First frost in ${daysToFall}d — harvest warm-season crops now` });
  else if (daysToFall !== null && daysToFall > 14 && daysToFall <= 30)
    alerts.push({ icon: "🧣", text: `Frost in ${daysToFall} days — protect tender plants` });
  if (daysToSpring !== null && daysToSpring > 0 && daysToSpring <= 30)
    alerts.push({ icon: "🌱", text: `Last frost in ${daysToSpring} days — start warm-season seedlings` });

  const displayName = user?.name || "Gardener";
  const initial = (user?.name || user?.email || "G")[0].toUpperCase();

  return (
    <div style={{ margin: "-16px -14px", background: "#0d1117", minHeight: "100vh", paddingBottom: 100 }}>

      {/* ── Top bar ──────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 12px" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Dirt Rich</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>Portfolio</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {frostDates.zone && (
            <div style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)", borderRadius: 99, padding: "4px 10px" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#00d4ff" }}>Zone {frostDates.zone}</span>
            </div>
          )}
          <button onClick={onOpenSettings} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={ICONS.settings} alt="Settings" style={{ width: 17, height: 17, objectFit: "contain", filter: "invert(1)", opacity: 0.7 }} />
          </button>
        </div>
      </div>

      {/* ── Balance card ─────────────────────────────────── */}
      <div style={{ margin: "0 16px 20px", borderRadius: 20, background: "linear-gradient(135deg, #fce4f3 0%, #d0eaff 50%, #c0faf0 100%)", padding: "24px 22px", position: "relative", overflow: "hidden" }}>
        {/* Soft glow blobs */}
        <div style={{ position: "absolute", top: -30, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(180,100,255,0.25)", filter: "blur(40px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -20, left: 10, width: 100, height: 100, borderRadius: "50%", background: "rgba(0,212,255,0.2)", filter: "blur(30px)", pointerEvents: "none" }} />

        <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Garden Portfolio</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: "#000", letterSpacing: -1.5, lineHeight: 1, marginBottom: 4 }}>
          {activePlants.length} <span style={{ fontSize: 18, fontWeight: 600, color: "rgba(0,0,0,0.4)", letterSpacing: 0 }}>growing</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(0,0,0,0.4)", marginBottom: 16 }}>
          {harvestedThisYear.length} harvested · {totalCareActions} care actions logged
        </div>

        {/* Season progress */}
        {seasonPct !== null ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: 0.5 }}>Growing Season</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(0,0,0,0.55)" }}>{Math.round(seasonPct)}%</span>
            </div>
            <div style={{ height: 6, background: "rgba(0,0,0,0.12)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${seasonPct}%`, background: "rgba(0,0,0,0.35)", borderRadius: 99 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 10, color: "rgba(0,0,0,0.35)" }}>{formatDate(frostDates.lastSpring)}</span>
              <span style={{ fontSize: 10, color: "rgba(0,0,0,0.35)" }}>{formatDate(frostDates.firstFall)}</span>
            </div>
          </div>
        ) : (
          <button onClick={onOpenSettings} style={{ background: "rgba(0,0,0,0.08)", border: "1px dashed rgba(0,0,0,0.2)", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.45)", fontFamily: "inherit" }}>
            Set frost dates →
          </button>
        )}
      </div>

      {/* ── Stat pills ───────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px", marginBottom: 24, overflowX: "auto", scrollbarWidth: "none" }}>
        {[
          { label: "Active", value: activePlants.length, color: "#00d4ff" },
          { label: `${currentYear} Yield`, value: harvestedThisYear.length, color: "#a8e063" },
          { label: "Care Logs", value: totalCareActions, color: "#c47db8" },
          { label: "Season Day", value: daysInSeason !== null ? `${daysInSeason}` : "—", color: "#e8a855" },
        ].map(s => (
          <div key={s.label} style={{ flexShrink: 0, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px 16px", textAlign: "center", minWidth: 72 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1, letterSpacing: -0.5 }}>{s.value}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Activity chart ───────────────────────────────── */}
      <div style={{ margin: "0 16px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "16px 16px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Care Activity</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>14 days</div>
        </div>
        {totalCareActions > 0
          ? <ActivitySparkline plants={plants} />
          : <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>No activity yet</div>
        }
      </div>

      {/* ── Seasonal alerts ──────────────────────────────── */}
      {alerts.length > 0 && (
        <div style={{ margin: "0 16px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 10 }}>Alerts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{ background: "rgba(255,200,0,0.08)", border: "1px solid rgba(255,200,0,0.25)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{a.icon}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500, lineHeight: 1.4 }}>{a.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Holdings ─────────────────────────────────────── */}
      {holdingGroups.length > 0 && (
        <div style={{ margin: "0 16px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "16px 16px 4px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Holdings</div>
          {holdingGroups.map(g => (
            <HoldingRow key={g.status} status={g.status} count={g.count} total={activePlants.length} />
          ))}
        </div>
      )}

      {/* ── Recent transactions ──────────────────────────── */}
      {recentActivity.length > 0 && (
        <div style={{ margin: "0 16px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 10 }}>Recent Activity</div>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden" }}>
            {recentActivity.map((e, i) => {
              const icon = CARE_ICONS[e.type] || "✓";
              const d = daysSince(e.date);
              const when = d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d}d ago`;
              return (
                <div key={e.id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < recentActivity.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{e.type}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.plantName}{e.notes ? ` · ${e.notes}` : ""}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{when}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Discord ──────────────────────────────────────── */}
      <div style={{ margin: "0 16px", background: "linear-gradient(135deg, rgba(88,101,242,0.2), rgba(88,101,242,0.08))", border: "1px solid rgba(88,101,242,0.35)", borderRadius: 18, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>💬</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 3 }}>Join the community</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>Share harvests, swap seeds, ask questions — on Discord while we build.</div>
        </div>
      </div>

    </div>
  );
}

export { ProfileTab };
