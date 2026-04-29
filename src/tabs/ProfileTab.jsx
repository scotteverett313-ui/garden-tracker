import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ICONS, STATUSES, CARE_ICONS } from "../constants.js";
import { daysSince, formatDate, getAutoIcon } from "../utils.js";
gsap.registerPlugin(ScrollTrigger);

// ── Sparkline ─────────────────────────────────────────────────────────────────
function ActivitySparkline({ plants }) {
  const W = 280, H = 52;
  const days = 14;
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
  const fillPts = `0,${H} ${pts} ${W},${H}`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8e063" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a8e063" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill="url(#sparkGrad)" />
      <polyline points={pts} fill="none" stroke="#5aaa20" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Status accent colors ──────────────────────────────────────────────────────
const STATUS_ACCENT = {
  "Seed": "#c4a265", "Germinating": "#7db87d", "Seedling": "#5a9e5a",
  "Transplanted": "#e8a855", "Growing": "#6ab06a", "Flowering": "#c47db8",
  "Fruiting": "#e06060", "Harvesting": "#8abe5a", "Dormant": "#aaaaaa",
  "Harvested": "#4caf7d", "Dead": "#888888",
};

// ── Holdings row ──────────────────────────────────────────────────────────────
function HoldingRow({ status, count, total, isLast }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const color = STATUS_ACCENT[status] || "#aaa";
  const statusObj = STATUSES.find(s => s.label === status);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: isLast ? "none" : "1px solid #f0f0f0" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f5f3", border: "1.5px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <img src={statusObj?.img} alt={status} style={{ width: 20, height: 20, objectFit: "contain" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#000", marginBottom: 4 }}>{status}</div>
        <div style={{ height: 5, background: "#ebebeb", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: "#000" }}>{count}</div>
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{Math.round(pct)}%</div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
function ProfileTab({ plants, frostDates, user, onOpenSettings }) {
  const currentYear = new Date().getFullYear();
  const today = new Date();

  const activePlants = plants.filter(p => !["Harvested", "Dead"].includes(p.status));
  const harvestedThisYear = plants.filter(p =>
    p.status === "Harvested" && p.harvestedAt?.startsWith(String(currentYear))
  );
  const totalCareActions = plants.reduce((sum, p) => sum + (p.careLog?.length || 0), 0);

  const spring = frostDates.lastSpring ? new Date(frostDates.lastSpring + "T12:00:00") : null;
  const fall = frostDates.firstFall ? new Date(frostDates.firstFall + "T12:00:00") : null;
  const daysToFall = fall ? Math.ceil((fall - today) / 86400000) : null;
  const daysToSpring = spring ? Math.ceil((spring - today) / 86400000) : null;
  const daysInSeason = spring ? Math.max(0, Math.floor((today - spring) / 86400000)) : null;
  const seasonPct = spring && fall
    ? Math.min(100, Math.max(0, ((today - spring) / (fall - spring)) * 100))
    : null;

  const holdingGroups = STATUSES
    .map(s => ({ status: s.label, count: activePlants.filter(p => p.status === s.label).length }))
    .filter(g => g.count > 0);

  const recentActivity = plants
    .flatMap(p => (p.careLog || []).map(e => ({ ...e, plantName: p.name })))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  const alerts = [];
  if (daysToFall !== null && daysToFall > 0 && daysToFall <= 14)
    alerts.push({ icon: null, isImg: ICONS.harvest, text: `First frost in ${daysToFall}d — harvest warm-season crops now`, urgent: true });
  else if (daysToFall !== null && daysToFall > 14 && daysToFall <= 30)
    alerts.push({ icon: null, isImg: ICONS.harvest, text: `Frost in ${daysToFall} days — start protecting tender plants` });
  if (daysToSpring !== null && daysToSpring > 0 && daysToSpring <= 30)
    alerts.push({ icon: null, isImg: ICONS.seedlingGreen, text: `Last frost in ${daysToSpring} days — start warm-season seedlings indoors` });

  const displayName = user?.name || "Gardener";
  const initial = (user?.name || user?.email || "G")[0].toUpperCase();

  const profileRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".profile-section").forEach((el) => {
        gsap.from(el, {
          y: 32,
          opacity: 0,
          duration: 0.45,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });
      });
    }, profileRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={profileRef}>

      {/* ── Floating portfolio card ───────────────────────── */}
      <div className="profile-section" style={{ position: "relative", paddingBottom: 5, marginBottom: 20 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 5, bottom: 0, background: "#000", borderRadius: "var(--radius-card)", zIndex: 0 }} />
        <div style={{
          position: "relative", zIndex: 1,
          borderRadius: "var(--radius-card)", border: "2px solid #000", overflow: "hidden",
          background: "#fff",
          padding: "22px 20px 20px",
        }}>

          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Garden Portfolio</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: "#000", letterSpacing: -2, lineHeight: 1 }}>
                {activePlants.length}
                <span style={{ fontSize: 18, fontWeight: 600, color: "#888", letterSpacing: 0, marginLeft: 8 }}>growing</span>
              </div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 6, fontWeight: 500 }}>
                {harvestedThisYear.length} harvested · {totalCareActions} care actions
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              {frostDates.zone && (
                <div style={{ background: "#f0f0f0", border: "1px solid #ddd", borderRadius: 99, padding: "4px 12px" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#444", letterSpacing: 0.5 }}>Zone {frostDates.zone}</span>
                </div>
              )}
              <button onClick={onOpenSettings} style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff", border: "2px solid #000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={ICONS.settings} alt="Settings" style={{ width: 16, height: 16, objectFit: "contain" }} />
              </button>
            </div>
          </div>

          {/* Quick stats row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[
              { label: "Active", value: activePlants.length },
              { label: `${currentYear} Yield`, value: harvestedThisYear.length },
              { label: "Day", value: daysInSeason !== null ? daysInSeason : "—" },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: "#f5f5f3", border: "1.5px solid #e8e8e8", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#000", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#888", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Season progress */}
          {seasonPct !== null ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>Growing Season</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#000" }}>{Math.round(seasonPct)}%</span>
              </div>
              <div style={{ height: 8, background: "#e8e8e8", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${seasonPct}%`, background: "#a8e063", borderRadius: 99 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span style={{ fontSize: 10, color: "#aaa", fontWeight: 600 }}>{formatDate(frostDates.lastSpring)}</span>
                <span style={{ fontSize: 10, color: "#aaa", fontWeight: 600 }}>{formatDate(frostDates.firstFall)}</span>
              </div>
            </div>
          ) : (
            <button onClick={onOpenSettings} style={{ background: "#f5f5f3", border: "2px dashed #ccc", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#666", fontFamily: "inherit" }}>
              Set frost dates →
            </button>
          )}
        </div>
      </div>

      {/* ── Alerts ───────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {alerts.map((a, i) => (
            <div key={i} style={{ position: "relative", paddingBottom: 4, marginBottom: 8 }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: "var(--radius-card-sm)", zIndex: 0 }} />
              <div style={{ position: "relative", zIndex: 1, background: a.urgent ? "#fdecea" : "#f0fbe0", border: `2px solid #000`, borderRadius: "var(--radius-card-sm)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                {a.isImg
                  ? <img src={a.isImg} style={{ width: 22, height: 22, objectFit: "contain", flexShrink: 0 }} alt="" />
                  : <span style={{ fontSize: 20, flexShrink: 0 }}>{a.icon}</span>}
                <span style={{ fontSize: 13, fontWeight: 600, color: "#000", lineHeight: 1.4 }}>{a.text}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Activity chart ───────────────────────────────── */}
      <div className="profile-section" style={{ position: "relative", paddingBottom: 4, marginBottom: 16 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: "var(--radius-card-sm)", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, background: "#fff", border: "2px solid #000", borderRadius: "var(--radius-card-sm)", padding: "14px 16px 10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 15 }}>Care Activity</span>
            <span style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>14 days</span>
          </div>
          {totalCareActions > 0
            ? <ActivitySparkline plants={plants} />
            : <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: 13 }}>No activity yet</div>
          }
        </div>
      </div>

      {/* ── Holdings ─────────────────────────────────────── */}
      {holdingGroups.length > 0 && (
        <div className="profile-section" style={{ position: "relative", paddingBottom: 4, marginBottom: 16 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: "var(--radius-card-sm)", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1, background: "#fff", border: "2px solid #000", borderRadius: "var(--radius-card-sm)", padding: "14px 16px 4px" }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Holdings</div>
            {holdingGroups.map((g, i) => (
              <HoldingRow key={g.status} status={g.status} count={g.count} total={activePlants.length} isLast={i === holdingGroups.length - 1} />
            ))}
          </div>
        </div>
      )}

      {/* ── Recent activity ──────────────────────────────── */}
      {recentActivity.length > 0 && (
        <div className="profile-section" style={{ position: "relative", paddingBottom: 4, marginBottom: 16 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: "var(--radius-card-sm)", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1, background: "#fff", border: "2px solid #000", borderRadius: "var(--radius-card-sm)", overflow: "hidden" }}>
            <div style={{ fontWeight: 800, fontSize: 15, padding: "14px 16px 4px" }}>Recent Activity</div>
            {recentActivity.map((e, i) => {
              const icon = CARE_ICONS[e.type] || "✓";
              const d = daysSince(e.date);
              const when = d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d}d ago`;
              return (
                <div key={e.id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderTop: "1px solid #f0f0f0" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f5f5f3", border: "1.5px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>{e.type}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.plantName}{e.notes ? ` · ${e.notes}` : ""}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#aaa", flexShrink: 0 }}>{when}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Discord nudge ────────────────────────────────── */}
      <div style={{ position: "relative", paddingBottom: 4, marginBottom: 8 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: "var(--radius-card-sm)", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, background: "#f5f0ff", border: "2px solid #000", borderRadius: "var(--radius-card-sm)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
          <img src={ICONS.settings} alt="" style={{ width: 26, height: 26, objectFit: "contain", flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 3 }}>Join the community</div>
            <div style={{ fontSize: 13, color: "#666", lineHeight: 1.4 }}>Share harvests, swap seeds — on Discord while we build.</div>
          </div>
        </div>
      </div>

    </div>
  );
}

export { ProfileTab };
