import { useState } from "react";
import { ICONS, ICON_LIBRARY, MONTHS } from "../constants.js";

// ─── Illustrations ────────────────────────────────────────────────────────────

function WelcomeIllustration() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20 }}>
      <img src={ICONS.garden} alt="" style={{ width: 80, height: 80, objectFit: "contain", animation: "obPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both" }} />
      <img src={ICONS.logo} alt="Dirt Rich" style={{ height: 52, objectFit: "contain", animation: "obFade 0.5s ease 0.4s both" }} />
      <div style={{ fontSize: 16, color: "#666", fontWeight: 500, animation: "obFade 0.5s ease 0.7s both" }}>Grow what you own</div>
    </div>
  );
}

function GardenIllustration({ active }) {
  const plants = ICON_LIBRARY.slice(0, 9);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, padding: "0 24px", width: "100%", boxSizing: "border-box" }}>
      {plants.map((p, i) => (
        <div key={p.name} style={{
          background: "#fff", border: "2px solid #000", borderRadius: 14, padding: 12,
          display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "1",
          animation: active ? `obPop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.05}s both` : "none",
          boxShadow: "3px 3px 0 #000",
        }}>
          <img src={p.url} alt={p.name} style={{ width: 40, height: 40, objectFit: "contain", imageRendering: "pixelated" }} />
        </div>
      ))}
    </div>
  );
}

function ScanIllustration({ active }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 24 }}>
      <div style={{ position: "relative", width: 150 }}>
        {/* Seed packet mockup */}
        <div style={{ background: "#fff", border: "2.5px solid #000", borderRadius: 18, padding: "20px 16px 16px", boxShadow: "5px 5px 0 #000", textAlign: "center" }}>
          <img src={ICONS.garden} alt="" style={{ width: 44, height: 44, objectFit: "contain", marginBottom: 8 }} />
          <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>Cherry Tomato</div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>Heirloom · 65 DTM</div>
          <div style={{ display: "flex", gap: 4, marginTop: 10, justifyContent: "center" }}>
            {["💧 Regular", "☀️ Full Sun"].map(b => (
              <span key={b} style={{ fontSize: 9, background: "#f0f0f0", borderRadius: 8, padding: "2px 5px", color: "#555" }}>{b}</span>
            ))}
          </div>
        </div>
        {/* Animated scan line */}
        {active && (
          <div style={{
            position: "absolute", left: 6, right: 6, height: 2,
            background: "linear-gradient(90deg, transparent, #a8e063, transparent)",
            borderRadius: 2,
            animation: "scanLine 2s ease-in-out infinite",
          }} />
        )}
      </div>
      <div style={{ fontSize: 13, color: "#555", fontWeight: 600, background: "#fff", border: "1.5px solid #e0e0e0", borderRadius: 20, padding: "6px 14px" }}>
        ✨ Claude reads it automatically
      </div>
    </div>
  );
}

function CalendarIllustration() {
  const rows = [
    { name: "Tomato",  indoors: [2,3],   transplant: [5,6],   direct: [] },
    { name: "Lettuce", indoors: [2,3],   transplant: [4,5],   direct: [8,9] },
    { name: "Carrot",  indoors: [],       transplant: [],      direct: [3,4,5] },
    { name: "Basil",   indoors: [3,4],   transplant: [5,6],   direct: [] },
  ];
  return (
    <div style={{ width: "100%", padding: "0 20px", boxSizing: "border-box" }}>
      {rows.map((row, ri) => (
        <div key={row.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, animation: `obFade 0.4s ease ${ri * 0.1}s both` }}>
          <div style={{ fontSize: 12, fontWeight: 700, width: 46, flexShrink: 0, color: "#444" }}>{row.name}</div>
          <div style={{ display: "flex", flex: 1, gap: 2 }}>
            {MONTHS.map((m, i) => {
              const mo = i + 1;
              const bg = row.indoors.includes(mo) ? "#c8e6f8"
                : row.transplant.includes(mo) ? "#c8f0c8"
                : row.direct.includes(mo) ? "#f5f0a8"
                : "#e8e8e8";
              return <div key={m} style={{ flex: 1, height: 22, borderRadius: 3, background: bg }} />;
            })}
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 14, marginTop: 6, justifyContent: "center" }}>
        {[{ color: "#c8e6f8", label: "Indoors" }, { color: "#c8f0c8", label: "Transplant" }, { color: "#f5f0a8", label: "Direct" }].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, background: l.color, borderRadius: 2, border: "1px solid #ccc" }} />
            <span style={{ fontSize: 11, color: "#666" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Card definitions ─────────────────────────────────────────────────────────

const CARDS = [
  {
    accent: "#fdf9f4",
    headline: "Welcome to Dirt Rich",
    body: "Your personal garden planner, from seed to harvest.",
  },
  {
    accent: "#eef8e8",
    headline: "Track every plant",
    body: "Add your plants to zones, watch their progress, and never miss a harvest window.",
  },
  {
    accent: "#e8f0fb",
    headline: "Scan seed packets",
    body: "Point your camera at any seed packet — Claude reads it and fills everything in automatically.",
  },
  {
    accent: "#fdf6ee",
    headline: "Know what to plant and when",
    body: "Set your frost dates and get a planting calendar built around your garden.",
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function OnboardingScreen({ onDone }) {
  const [current, setCurrent] = useState(0);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);

  const total = CARDS.length;

  function goTo(idx) {
    if (idx < 0 || idx >= total) return;
    setCurrent(idx);
  }

  function handleTouchStart(e) { setDragStart(e.touches[0].clientX); }
  function handleTouchMove(e) {
    if (dragStart === null) return;
    setDragOffset(e.touches[0].clientX - dragStart);
  }
  function handleTouchEnd() {
    if (dragOffset < -60 && current < total - 1) goTo(current + 1);
    else if (dragOffset > 60 && current > 0) goTo(current - 1);
    setDragStart(null);
    setDragOffset(0);
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
      <button onClick={onDone} style={{ position: "absolute", top: 52, right: 20, zIndex: 10, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#bbb", fontWeight: 600, padding: "8px 4px" }}>
        Skip
      </button>

      {/* Sliding container */}
      <div style={{
        flex: 1,
        display: "flex",
        width: `${total * 100}%`,
        transition: dragStart !== null ? "none" : "transform 0.38s cubic-bezier(0.4,0,0.2,1)",
        transform: `translateX(calc(${slidePercent}% + ${dragOffset / total}px))`,
      }}>
        {CARDS.map((card, i) => (
          <div key={i} style={{ width: `${100 / total}%`, height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Illustration area */}
            <div style={{ background: card.accent, flex: "0 0 56%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0 0 36px 36px", overflow: "hidden" }}>
              {i === 0 && <WelcomeIllustration />}
              {i === 1 && <GardenIllustration active={current === 1} />}
              {i === 2 && <ScanIllustration active={current === 2} />}
              {i === 3 && <CalendarIllustration />}
            </div>

            {/* Text */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "28px 28px 16px" }}>
              <div style={{ fontWeight: 900, fontSize: 27, letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 12, color: "#111" }}>
                {card.headline}
              </div>
              <div style={{ fontSize: 16, color: "#777", lineHeight: 1.6, fontWeight: 400 }}>
                {card.body}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar — dots + button */}
      <div style={{ padding: "12px 24px calc(env(safe-area-inset-bottom) + 24px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Dot indicators */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {CARDS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: i === current ? 22 : 8, height: 8, borderRadius: 4,
              background: i === current ? "#000" : "#ddd",
              border: "none", cursor: "pointer", padding: 0,
              transition: "width 0.3s ease, background 0.3s ease",
            }} />
          ))}
        </div>

        {/* Next / Get Started */}
        <div style={{ position: "relative", paddingBottom: 4 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 999, zIndex: 0 }} />
          <button onClick={next} className="btn-cta" style={{
            position: "relative", zIndex: 1,
            background: "#a8e063", color: "#000", border: "2.5px solid #000",
            borderRadius: 999, padding: "12px 28px",
            cursor: "pointer", fontWeight: 800, fontSize: 15, fontFamily: "inherit",
          }}>
            {current === total - 1 ? "Let's grow →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
