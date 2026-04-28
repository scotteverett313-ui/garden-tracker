import { useState } from "react";
import { ICONS, ICON_LIBRARY, MONTHS } from "../constants.js";

// ─── Illustrations ────────────────────────────────────────────────────────────

function WelcomeIllustration() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 28 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
        <span style={{ fontSize: 52, animation: "obPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.05s both", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.08))" }}>🌿</span>
        <span style={{ fontSize: 68, animation: "obPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s both", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.1))" }}>🍅</span>
        <span style={{ fontSize: 52, animation: "obPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.08))" }}>🥕</span>
      </div>
      <div style={{ textAlign: "center", animation: "obFade 0.4s ease 0.4s both" }}>
        <img src={ICONS.logo} alt="Dirt Rich" style={{ height: 48, objectFit: "contain", marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
        <div style={{ fontSize: 15, color: "#888", fontWeight: 500 }}>Grow what you own.</div>
      </div>
    </div>
  );
}

function GardenIllustration({ active }) {
  const plants = ICON_LIBRARY.slice(0, 9);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, padding: "0 28px", width: "100%", boxSizing: "border-box" }}>
      {plants.map((p, i) => (
        <div key={p.name} style={{
          background: "#fff", border: "1.5px solid #e8e8e8", borderRadius: 'var(--radius-card)', padding: 14,
          display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "1",
          animation: active ? `obPop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.05}s both` : "none",
          boxShadow: "var(--shadow-soft-sm)",
        }}>
          <img src={p.url} alt={p.name} style={{ width: 38, height: 38, objectFit: "contain", imageRendering: "pixelated" }} />
        </div>
      ))}
    </div>
  );
}

function ScanIllustration({ active }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20 }}>
      <div style={{ position: "relative", width: 160 }}>
        <div style={{ background: "#fff", border: "1.5px solid #e8e8e8", borderRadius: 'var(--radius-card-lg)', padding: "22px 18px 18px", boxShadow: "var(--shadow-soft)", textAlign: "center" }}>
          <span style={{ fontSize: 40, display: "block", marginBottom: 10 }}>🌱</span>
          <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>Cherry Tomato</div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>Heirloom · 65 DTM</div>
          <div style={{ display: "flex", gap: 4, marginTop: 10, justifyContent: "center" }}>
            {["💧 Regular", "☀️ Full Sun"].map(b => (
              <span key={b} style={{ fontSize: 9, background: "#f5f5f3", borderRadius: 'var(--radius-sm)', padding: "3px 6px", color: "#666" }}>{b}</span>
            ))}
          </div>
        </div>
        {active && (
          <div style={{
            position: "absolute", left: 8, right: 8, height: 2,
            background: "linear-gradient(90deg, transparent, #a8e063, transparent)",
            borderRadius: 2,
            animation: "scanLine 2s ease-in-out infinite",
          }} />
        )}
      </div>
      <div style={{ fontSize: 13, color: "#555", fontWeight: 600, background: "#fff", border: "1.5px solid #e8e8e8", borderRadius: 'var(--radius-card-lg)', padding: "7px 16px", boxShadow: "var(--shadow-soft-sm)" }}>
        ✨ Claude reads it automatically
      </div>
    </div>
  );
}

function CalendarIllustration() {
  const rows = [
    { name: "Tomato",  indoors: [2,3], transplant: [5,6], direct: [] },
    { name: "Lettuce", indoors: [2,3], transplant: [4,5], direct: [8,9] },
    { name: "Carrot",  indoors: [],    transplant: [],    direct: [3,4,5] },
    { name: "Basil",   indoors: [3,4], transplant: [5,6], direct: [] },
  ];
  return (
    <div style={{ width: "100%", padding: "0 24px", boxSizing: "border-box" }}>
      {rows.map((row, ri) => (
        <div key={row.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, animation: `obFade 0.4s ease ${ri * 0.1}s both` }}>
          <div style={{ fontSize: 12, fontWeight: 700, width: 46, flexShrink: 0, color: "#555" }}>{row.name}</div>
          <div style={{ display: "flex", flex: 1, gap: 2 }}>
            {MONTHS.map((m, i) => {
              const mo = i + 1;
              const bg = row.indoors.includes(mo) ? "#c8e6f8"
                : row.transplant.includes(mo) ? "#b8f0c0"
                : row.direct.includes(mo) ? "#fde68a"
                : "#efefef";
              return <div key={m} style={{ flex: 1, height: 20, borderRadius: 3, background: bg }} />;
            })}
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 14, marginTop: 8, justifyContent: "center" }}>
        {[{ color: "#c8e6f8", label: "Indoors" }, { color: "#b8f0c0", label: "Transplant" }, { color: "#fde68a", label: "Direct" }].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, background: l.color, borderRadius: 2, border: "1px solid #ddd" }} />
            <span style={{ fontSize: 11, color: "#888" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Card definitions ─────────────────────────────────────────────────────────

const CARDS = [
  { headline: "Welcome to Dirt Rich",        body: "Your personal garden planner, from seed to harvest." },
  { headline: "Track every plant",           body: "Add plants to zones, watch their progress, and never miss a harvest window." },
  { headline: "Scan seed packets",           body: "Point your camera at any seed packet — Claude reads it and fills everything in." },
  { headline: "Know what to plant and when", body: "Set your frost dates and get a planting calendar built around your garden." },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function OnboardingScreen({ onDone, onReplayOnboarding }) {
  const [current, setCurrent] = useState(0);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);

  const total = CARDS.length;

  function goTo(idx) { if (idx >= 0 && idx < total) setCurrent(idx); }
  function handleTouchStart(e) { setDragStart(e.touches[0].clientX); }
  function handleTouchMove(e) { if (dragStart !== null) setDragOffset(e.touches[0].clientX - dragStart); }
  function handleTouchEnd() {
    if (dragOffset < -60 && current < total - 1) goTo(current + 1);
    else if (dragOffset > 60 && current > 0) goTo(current - 1);
    setDragStart(null); setDragOffset(0);
  }

  function next() {
    if (current < total - 1) goTo(current + 1);
    else onDone();
  }

  const slidePercent = -current * (100 / total);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9998, background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Cabin', system-ui, sans-serif" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        @keyframes obPop {
          0%   { opacity: 0; transform: scale(0.75); }
          60%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes obFade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanLine {
          0%   { top: 18%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 82%; opacity: 0; }
        }
      `}</style>

      {/* Skip */}
      <button onClick={onDone} style={{ position: "absolute", top: 52, right: 20, zIndex: 10, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#ccc", fontWeight: 600, padding: "8px 4px", fontFamily: "inherit" }}>
        Skip
      </button>

      {/* Sliding container */}
      <div style={{
        flex: 1, display: "flex",
        width: `${total * 100}%`,
        transition: dragStart !== null ? "none" : "transform 0.38s cubic-bezier(0.4,0,0.2,1)",
        transform: `translateX(calc(${slidePercent}% + ${dragOffset / total}px))`,
      }}>
        {CARDS.map((card, i) => (
          <div key={i} style={{ width: `${100 / total}%`, height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Illustration area — clean white with soft shadow */}
            <div style={{
              flex: "0 0 54%", display: "flex", alignItems: "center", justifyContent: "center",
              background: "#fafaf8", borderRadius: "0 0 40px 40px",
              boxShadow: "var(--shadow-soft-sm)", overflow: "hidden",
            }}>
              {i === 0 && <WelcomeIllustration />}
              {i === 1 && <GardenIllustration active={current === 1} />}
              {i === 2 && <ScanIllustration active={current === 2} />}
              {i === 3 && <CalendarIllustration />}
            </div>

            {/* Text */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "32px 30px 16px" }}>
              <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 12, color: "#111" }}>
                {card.headline}
              </div>
              <div style={{ fontSize: 16, color: "#888", lineHeight: 1.65, fontWeight: 400 }}>
                {card.body}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ padding: "12px 24px calc(env(safe-area-inset-bottom) + 24px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {CARDS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              height: 6, width: i === current ? 24 : 6, borderRadius: 'var(--radius-pill)',
              background: i === current ? "#a8e063" : "#ddd",
              border: "none", cursor: "pointer", padding: 0,
              transition: "width 0.3s ease, background 0.3s ease",
            }} />
          ))}
        </div>

        {/* Next / Let's grow */}
        <div style={{ position: "relative", paddingBottom: 4 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 'var(--radius-pill)', zIndex: 0 }} />
          <button onClick={next} className="btn-cta" style={{
            position: "relative", zIndex: 1,
            background: "#a8e063", color: "#000", border: "2.5px solid #000",
            borderRadius: 'var(--radius-pill)', padding: "12px 28px",
            cursor: "pointer", fontWeight: 800, fontSize: 15, fontFamily: "inherit",
          }}>
            {current === total - 1 ? "Let's grow →" : "Next →"}
          </button>
        </div>
      </div>

      {/* Hidden replay button */}
      {onReplayOnboarding && (
        <button onClick={onReplayOnboarding} style={{
          position: "absolute", bottom: 28, left: 24,
          background: "none", border: "none", cursor: "pointer",
          fontSize: 11, color: "#ddd", fontWeight: 500, padding: "8px 4px", fontFamily: "inherit",
        }}>
          View intro
        </button>
      )}
    </div>
  );
}
