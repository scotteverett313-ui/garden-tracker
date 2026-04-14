import { useEffect, useState } from "react";
import { ICONS } from "../constants.js";

export function WelcomeScreen({ onDone }) {
  const [phase, setPhase] = useState("in"); // in | hold | out

  useEffect(() => {
    // Animate in, hold, then signal done
    const hold = setTimeout(() => setPhase("out"), 19000);
    const done = setTimeout(() => onDone(), 20000);
    return () => { clearTimeout(hold); clearTimeout(done); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#000",
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
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
      `}</style>

      {/* Seedling icon — pops in first */}
      <div style={{ animation: "seedling 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both", marginBottom: 24 }}>
        <img src={ICONS.garden} alt="" style={{ width: 64, height: 64, objectFit: "contain", filter: "invert(1) brightness(2)" }} />
      </div>

      {/* Logo wordmark */}
      <div style={{ animation: "logoIn 0.5s ease 0.4s both" }}>
        <img src={ICONS.logo} alt="Dirt Rich" style={{ height: 52, objectFit: "contain", filter: "invert(1) brightness(10)" }} />
      </div>

      {/* Tagline */}
      <div style={{
        animation: "taglineIn 0.5s ease 0.8s both",
        fontSize: 13, fontWeight: 700, letterSpacing: 2,
        textTransform: "uppercase", color: "#a8e063",
        marginTop: 14,
      }}>
        Grow what you own
      </div>

      {/* Loading dots */}
      <div style={{ display: "flex", gap: 6, marginTop: 48 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: "#fff",
            animation: `pulse 1.2s ease ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}
