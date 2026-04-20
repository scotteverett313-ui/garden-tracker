import { useState } from "react";
import { ICONS } from "../constants.js";
import { CTAButton } from "./CTAButton.jsx";

export function AuthScreen({ onSkip, onAuth }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [view, setView] = useState("main"); // main | email

  function handleSendLink() {
    if (!email.trim() || !email.includes("@")) return;
    // TODO: supabase.auth.signInWithOtp({ email })
    setSent(true);
  }

  function handleApple() {
    // TODO: supabase.auth.signInWithOAuth({ provider: "apple" })
    onAuth({ name: "Apple User", email: "", provider: "apple" });
  }

  if (sent) return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9997, background: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "0 32px", fontFamily: "'Cabin', system-ui, sans-serif",
    }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>📬</div>
      <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: -0.8, marginBottom: 10, textAlign: "center" }}>Check your inbox</div>
      <div style={{ fontSize: 15, color: "#777", textAlign: "center", lineHeight: 1.6, marginBottom: 40 }}>
        We sent a magic link to <strong>{email}</strong>. Tap it to sign in — no password needed.
      </div>
      <button onClick={onSkip} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#bbb", fontWeight: 600, padding: 8 }}>
        I'll do this later
      </button>
    </div>
  );

  if (view === "email") return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9997, background: "#fff",
      display: "flex", flexDirection: "column", fontFamily: "'Cabin', system-ui, sans-serif",
    }}>
      <style>{`@keyframes authFade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px", animation: "authFade 0.3s ease both" }}>
        <button onClick={() => setView("main")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, textAlign: "left", padding: "0 0 28px", color: "#000" }}>←</button>
        <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: -0.8, marginBottom: 8 }}>What's your email?</div>
        <div style={{ fontSize: 15, color: "#888", marginBottom: 32, lineHeight: 1.5 }}>We'll send you a magic link — no password needed.</div>
        <input
          type="email" inputMode="email" autoComplete="email" autoFocus
          placeholder="you@example.com"
          value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSendLink()}
          style={{ width: "100%", padding: "14px 16px", border: "2.5px solid #000", borderRadius: 14, fontSize: 16, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 16, outline: "none" }}
        />
        <CTAButton onClick={handleSendLink} disabled={!email.trim() || !email.includes("@")} style={{ padding: "14px", fontSize: 16 }}>
          Send magic link →
        </CTAButton>
      </div>
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9997, background: "#fff",
      display: "flex", flexDirection: "column", fontFamily: "'Cabin', system-ui, sans-serif",
    }}>
      <style>{`@keyframes authPop { 0% { opacity:0; transform: scale(0.85) translateY(16px); } 100% { opacity:1; transform: scale(1) translateY(0); } }`}</style>

      {/* Illustration area */}
      <div style={{ background: "#fdf9f4", flex: "0 0 46%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "0 0 36px 36px", gap: 12 }}>
        <img src={ICONS.garden} alt="" style={{ width: 72, height: 72, objectFit: "contain", animation: "authPop 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.1s both" }} />
        <img src={ICONS.logo} alt="Dirt Rich" style={{ height: 48, objectFit: "contain", animation: "authPop 0.45s ease 0.35s both" }} />
      </div>

      {/* Copy + buttons */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "28px 28px 0" }}>
        <div style={{ fontWeight: 900, fontSize: 27, letterSpacing: -0.8, lineHeight: 1.2, marginBottom: 10 }}>Save your garden</div>
        <div style={{ fontSize: 15, color: "#777", lineHeight: 1.6, marginBottom: 32 }}>
          Create a free account to back up your plants, sync across devices, and keep your garden safe.
        </div>

        {/* Apple Sign In */}
        <div style={{ position: "relative", paddingBottom: 4, marginBottom: 12 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#333", borderRadius: 999, zIndex: 0 }} />
          <button onClick={handleApple} style={{
            position: "relative", zIndex: 1, width: "100%",
            background: "#000", color: "#fff", border: "2.5px solid #000",
            borderRadius: 999, padding: "14px 28px", cursor: "pointer",
            fontWeight: 800, fontSize: 15, fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}></span> Continue with Apple
          </button>
        </div>

        {/* Email */}
        <button onClick={() => setView("email")} style={{
          width: "100%", background: "#fff", color: "#000",
          border: "2.5px solid #000", borderRadius: 999, padding: "13px 28px",
          cursor: "pointer", fontWeight: 700, fontSize: 15, fontFamily: "inherit",
        }}>
          Continue with email
        </button>
      </div>

      {/* Skip */}
      <div style={{ padding: "20px 28px calc(env(safe-area-inset-bottom) + 28px)", textAlign: "center" }}>
        <button onClick={onSkip} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#bbb", fontWeight: 600, padding: 8 }}>
          Skip for now
        </button>
      </div>
    </div>
  );
}
