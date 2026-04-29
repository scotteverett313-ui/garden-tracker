import { useState } from "react";
import { ICONS, ICON_LIBRARY } from "../constants.js";

export function AuthScreen({ onCreateAccount, onSignIn, onReplayOnboarding }) {
  const [mode, setMode] = useState("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const inp = (extra = {}) => ({
    width: "100%", padding: "13px 14px",
    border: "1.5px solid #e0e0e0", borderRadius: 'var(--radius-icon)',
    fontSize: 15, fontFamily: "inherit", boxSizing: "border-box",
    outline: "none", ...extra,
  });

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

      {mode === "landing" && (
        <>
          {/* Illustration */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
              {[ICON_LIBRARY[0], ICON_LIBRARY[1], ICON_LIBRARY[2]].map((p, i) => (
                <img
                  key={i}
                  src={p.url}
                  alt={p.name}
                  style={{
                    width: i === 1 ? 72 : 52,
                    height: i === 1 ? 72 : 52,
                    objectFit: "contain",
                    imageRendering: "pixelated",
                    animation: `authPop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.1 + i * 0.05}s both`,
                    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.08))",
                  }}
                />
              ))}
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
            <button onClick={() => setMode("signin")} style={{
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
        </>
      )}

      {mode === "signin" && (
        <div style={{ width: "100%", flex: 1, display: "flex", flexDirection: "column", padding: "52px 28px calc(env(safe-area-inset-bottom) + 40px)", boxSizing: "border-box" }}>
          {/* Back button */}
          <button onClick={() => setMode("landing")} style={{
            background: "#f0f0f0", border: "none", borderRadius: "50%",
            width: 38, height: 38, cursor: "pointer", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, marginBottom: 36, flexShrink: 0,
          }}>←</button>

          {/* Heading */}
          <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: -0.8, marginBottom: 6 }}>Welcome back</div>
          <div style={{ fontSize: 15, color: "#888", marginBottom: 36 }}>Sign in to your garden</div>

          {/* Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#444" }}>Email</label>
              <input
                type="email"
                inputMode="email"
                placeholder="alex@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inp({ borderColor: email.includes("@") && email.length > 3 ? "#a8e063" : "#e0e0e0" })}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#444" }}>Password</label>
              <input
                type="password"
                placeholder="········"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inp()}
              />
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 28 }}>
            <div style={{ position: "relative", paddingBottom: 4 }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 'var(--radius-pill)', zIndex: 0 }} />
              <button onClick={onSignIn} style={{
                position: "relative", zIndex: 1, width: "100%",
                background: "#a8e063", color: "#000", border: "2.5px solid #000",
                borderRadius: 'var(--radius-pill)', padding: "15px 28px",
                cursor: "pointer", fontWeight: 800, fontSize: 16, fontFamily: "inherit",
              }}>
                Sign in →
              </button>
            </div>
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#bbb", fontWeight: 500, fontFamily: "inherit", padding: "6px 0" }}>
                Forgot password?
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
