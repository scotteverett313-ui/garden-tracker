import { useState } from "react";
import { CTAButton } from "./CTAButton.jsx";

export function SignInScreen({ onBack, onSignIn }) {
  const [view, setView] = useState("signin"); // signin | forgot | sent
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const inp = (extra = {}) => ({
    width: "100%", padding: "13px 14px",
    border: "1.5px solid #e0e0e0", borderRadius: 12,
    fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", outline: "none",
    ...extra,
  });

  if (view === "sent") return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9995, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", fontFamily: "'Cabin', system-ui, sans-serif" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>📬</div>
      <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: -0.8, marginBottom: 10, textAlign: "center" }}>Check your inbox</div>
      <div style={{ fontSize: 15, color: "#777", textAlign: "center", lineHeight: 1.6, marginBottom: 40 }}>
        We sent a reset link to <strong>{email}</strong>. Follow it to set a new password.
      </div>
      <button onClick={() => setView("signin")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#888", fontWeight: 700, padding: 8, fontFamily: "inherit" }}>
        Back to sign in
      </button>
    </div>
  );

  if (view === "forgot") return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9995, background: "#fff", display: "flex", flexDirection: "column", fontFamily: "'Cabin', system-ui, sans-serif" }}>
      <div style={{ padding: "52px 24px 0" }}>
        <button onClick={() => setView("signin")} style={{ background: "#f0f0f0", border: "none", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>←</button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px calc(env(safe-area-inset-bottom) + 32px)" }}>
        <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: -0.8, marginBottom: 8 }}>Forgot password?</div>
        <div style={{ fontSize: 15, color: "#888", marginBottom: 32, lineHeight: 1.5 }}>Enter your email and we'll send you a reset link.</div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#444" }}>Email</label>
          <input type="email" inputMode="email" placeholder="alex@example.com" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && email.includes("@") && setView("sent")}
            style={inp({ borderColor: email.includes("@") ? "#a8e063" : "#e0e0e0" })} />
        </div>
        <CTAButton onClick={() => setView("sent")} disabled={!email.includes("@")} style={{ padding: "14px", fontSize: 16 }}>
          Send reset link →
        </CTAButton>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9995, background: "#fff", display: "flex", flexDirection: "column", fontFamily: "'Cabin', system-ui, sans-serif" }}>
      <div style={{ padding: "52px 24px 0" }}>
        <button onClick={onBack} style={{ background: "#f0f0f0", border: "none", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>←</button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px" }}>
        <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: -0.8, marginBottom: 8 }}>Welcome back</div>
        <div style={{ fontSize: 15, color: "#888", marginBottom: 32 }}>Sign in to your garden.</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 28 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#444" }}>Email</label>
            <input type="email" inputMode="email" placeholder="alex@example.com" value={email}
              onChange={e => setEmail(e.target.value)}
              style={inp({ borderColor: email.includes("@") && email.length > 3 ? "#a8e063" : "#e0e0e0" })} />
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#444" }}>Password</label>
              <button onClick={() => setView("forgot")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#888", fontWeight: 600, padding: 0, fontFamily: "inherit" }}>
                Forgot password?
              </button>
            </div>
            <input type="password" placeholder="········" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && email.includes("@") && password.length >= 6 && onSignIn({ email })}
              style={inp()} />
          </div>
        </div>

        <CTAButton onClick={() => onSignIn({ email })} disabled={!email.includes("@") || password.length < 6} style={{ padding: "14px", fontSize: 16 }}>
          Sign in →
        </CTAButton>
      </div>

      <div style={{ padding: "0 28px calc(env(safe-area-inset-bottom) + 32px)", textAlign: "center" }}>
        <span style={{ fontSize: 14, color: "#aaa" }}>Don't have an account? </span>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#000", fontWeight: 700, padding: 0, fontFamily: "inherit" }}>
          Create one
        </button>
      </div>
    </div>
  );
}
