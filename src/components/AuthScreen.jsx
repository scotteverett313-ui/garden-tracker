import { ICONS } from "../constants.js";

export function AuthScreen({ onCreateAccount, onSignIn, onReplayOnboarding }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9997, background: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "'Cabin', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes authPop {
          0%   { opacity: 0; transform: scale(0.8) translateY(12px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes authFade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Illustration */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
          <span style={{ fontSize: 52, animation: "authPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.08))" }}>🌿</span>
          <span style={{ fontSize: 70, animation: "authPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.1))" }}>🍅</span>
          <span style={{ fontSize: 52, animation: "authPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s both", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.08))" }}>🥕</span>
        </div>
        <div style={{ textAlign: "center", animation: "authFade 0.4s ease 0.45s both" }}>
          <img src={ICONS.logo} alt="Dirt Rich" style={{ height: 56, objectFit: "contain", display: "block", margin: "0 auto 10px" }} />
          <div style={{ fontSize: 16, color: "#777", fontWeight: 500 }}>Grow what you own.</div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ width: "100%", padding: "0 28px calc(env(safe-area-inset-bottom) + 40px)", display: "flex", flexDirection: "column", gap: 12, animation: "authFade 0.4s ease 0.55s both" }}>
        {/* Create free account */}
        <div style={{ position: "relative", paddingBottom: 4 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 'var(--radius-pill)', zIndex: 0 }} />
          <button onClick={onCreateAccount} style={{
            position: "relative", zIndex: 1, width: "100%",
            background: "#a8e063", color: "#000", border: "2.5px solid #000",
            borderRadius: 'var(--radius-pill)', padding: "15px 28px",
            cursor: "pointer", fontWeight: 800, fontSize: 16, fontFamily: "inherit",
          }}>
            Create free account
          </button>
        </div>

        {/* Sign in */}
        <button onClick={onSignIn} style={{
          width: "100%", background: "#fff", color: "#000",
          border: "2.5px solid #000", borderRadius: 'var(--radius-pill)', padding: "14px 28px",
          cursor: "pointer", fontWeight: 700, fontSize: 16, fontFamily: "inherit",
        }}>
          Sign in
        </button>
      </div>

      {/* Hidden replay button */}
      {onReplayOnboarding && (
        <button onClick={onReplayOnboarding} style={{
          position: "absolute", bottom: 12, left: 24,
          background: "none", border: "none", cursor: "pointer",
          fontSize: 11, color: "#ddd", fontWeight: 500, padding: "8px 4px", fontFamily: "inherit",
        }}>
          View intro
        </button>
      )}
    </div>
  );
}
