import { useEffect, useState } from "react";
import { ICONS } from "../constants.js";

export function WelcomeScreen({ onDone }) {
  const [phase, setPhase] = useState("in"); // in | hold | out

  useEffect(() => {
    // Animate in, hold, then signal done
    const hold = setTimeout(() => setPhase("out"), 1900);
    const done = setTimeout(() => onDone(), 2500);
    return () => { clearTimeout(hold); clearTimeout(done); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      transition: "opacity 0.6s ease",
      opacity: phase === "out" ? 0 : 1,
    }}>
      <style>{`
        @keyframes logoIn {
          0%   { opacity: 0; transform: scale(0.85) translateY(12px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes taglineIn {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes seedling {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.8; }
        }
      `}</style>

      {/* Seedling icon — pops in first */}
      <div style={{ animation: "seedling 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both", marginBottom: 20 }}>
        <img src={ICONS.garden} alt="" style={{ width: 72, height: 72, objectFit: "contain" }} />
      </div>

      {/* Logo wordmark */}
      <div style={{ animation: "logoIn 0.5s ease 0.4s both" }}>
        <img src={ICONS.logo} alt="Dirt Rich" style={{ height: 64, objectFit: "contain" }} />
      </div>

      {/* Tagline */}
      <div style={{
        animation: "taglineIn 0.5s ease 0.8s both",
        fontSize: 18, fontWeight: 400, color: "#222",
        marginTop: 12,
      }}>
        Grow what you own
      </div>

      {/* Loading dots */}
      <div style={{ display: "flex", gap: 8, marginTop: 52 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%", background: "#888",
            animation: `pulse 1.2s ease ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}
