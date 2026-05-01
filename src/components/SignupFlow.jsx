import { useState } from "react";
import { DEFAULT_ZONES, ICONS, ICON_LIBRARY } from "../constants.js";
import { CTAButton } from "./CTAButton.jsx";
import { authSignUp } from "../supabase.js";

const TOTAL = 4;

function ProgressDots({ step }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
      {Array.from({ length: TOTAL }, (_, i) => (
        <div key={i} style={{
          height: 4, borderRadius: 'var(--radius-pill)',
          flex: i === step ? 2 : 1,
          background: i <= step ? "#a8e063" : "#e8e8e8",
          transition: "flex 0.3s ease, background 0.3s ease",
        }} />
      ))}
    </div>
  );
}

function BackButton({ onBack, visible }) {
  return (
    <button onClick={onBack} style={{
      background: "#f0f0f0", border: "none", borderRadius: "50%",
      width: 38, height: 38, cursor: "pointer", fontSize: 18,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none",
      marginBottom: 28,
    }}>←</button>
  );
}

// ─── Step 1: Create Account ───────────────────────────────────────────────────

function StepAccount({ form, setForm, onNext, error, submitting }) {
  const valid = form.name.trim() && form.email.includes("@") && form.password.length >= 6;
  const inp = (extra = {}) => ({
    width: "100%", padding: "13px 14px",
    border: "1.5px solid #e0e0e0", borderRadius: 'var(--radius-icon)',
    fontSize: 15, fontFamily: "inherit", boxSizing: "border-box",
    outline: "none", ...extra,
  });

  return (
    <>
      <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: -0.8, marginBottom: 6 }}>Create account</div>
      <div style={{ fontSize: 15, color: "#888", marginBottom: 28 }}>Join thousands of home gardeners</div>
      <ProgressDots step={0} />

      <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#444" }}>Full name</label>
          <input type="text" placeholder="Alex Johnson" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={inp()} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#444" }}>Email</label>
          <input type="email" inputMode="email" placeholder="alex@example.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            style={inp({ borderColor: form.email.includes("@") && form.email.length > 3 ? "#a8e063" : "#e0e0e0" })} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#444" }}>Password</label>
          <input type="password" placeholder="········" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            style={inp()} />
        </div>
        {error && <div style={{ background: "#fdecea", color: "#c0392b", borderRadius: "var(--radius-input)", padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>{error}</div>}
      </div>

      <div style={{ marginTop: 28 }}>
        <CTAButton onClick={onNext} disabled={!valid || submitting} style={{ padding: "14px", fontSize: 16 }}>
          {submitting ? "Creating account..." : "Continue →"}
        </CTAButton>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "#bbb" }}>
          By continuing you agree to our{" "}
          <span style={{ fontWeight: 700, textDecoration: "underline", cursor: "pointer", color: "#888" }}>Terms</span>
        </div>
      </div>
    </>
  );
}

// ─── Step 2: Growing Zones ────────────────────────────────────────────────────

const ZONE_DESC = {
  zone_basement:   "Indoor grow lights",
  zone_greenhouse: "Protected outdoor space",
  zone_raised:     "Elevated garden beds",
  zone_inground:   "Traditional garden rows",
};

function StepZones({ selected, setSelected, onNext }) {
  function toggle(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(z => z !== id) : [...prev, id]);
  }

  return (
    <>
      <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: -0.8, marginBottom: 6 }}>Where do you grow?</div>
      <div style={{ fontSize: 15, color: "#888", marginBottom: 28 }}>Select all that apply</div>
      <ProgressDots step={1} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {DEFAULT_ZONES.map(zone => {
          const on = selected.includes(zone.id);
          return (
            <button key={zone.id} onClick={() => toggle(zone.id)} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px",
              background: on ? "#f0fbe0" : "#fff",
              border: `2px solid ${on ? "#a8e063" : "#e8e8e8"}`,
              borderRadius: 'var(--radius-card)', cursor: "pointer", textAlign: "left", fontFamily: "inherit",
              transition: "all 0.15s ease",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                background: on ? "#a8e063" : "#fff",
                border: `2px solid ${on ? "#a8e063" : "#ccc"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 900, color: "#000",
              }}>
                {on ? "✓" : ""}
              </div>
              <div style={{ width: 38, height: 38, background: "#f5f5f3", borderRadius: 'var(--radius-input)', display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <img src={zone.img} alt={zone.name} style={{ width: 26, height: 26, objectFit: "contain" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#000" }}>{zone.name}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{ZONE_DESC[zone.id]}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 20 }}>
        <CTAButton onClick={onNext} style={{ padding: "14px", fontSize: 16 }}>
          Continue →
        </CTAButton>
      </div>
    </>
  );
}

// ─── Step 3: Frost Dates ──────────────────────────────────────────────────────

function StepFrost({ spring, setSpring, fall, setFall, onNext, onSkip }) {
  const showPreview = spring && fall;
  const inp = { width: "100%", padding: "13px 14px", border: "1.5px solid #e0e0e0", borderRadius: 'var(--radius-icon)', fontSize: 15, fontFamily: "inherit", boxSizing: "border-box" };
  const fmt = d => d ? new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

  return (
    <>
      <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: -0.8, marginBottom: 6 }}>Your frost window</div>
      <div style={{ fontSize: 15, color: "#888", marginBottom: 28, lineHeight: 1.5 }}>We'll use this to show your growing season progress</div>
      <ProgressDots step={2} />

      {showPreview && (
        <div style={{ background: "#f5f5f3", border: "1.5px solid #e8e8e8", borderRadius: 'var(--radius-card-sm)', padding: "14px 16px", marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#aaa", letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>Season Preview</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa", marginBottom: 4 }}>
            <span>LAST SPRING FROST</span><span>FIRST FALL FROST</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 20, letterSpacing: -0.5, marginBottom: 10 }}>
            <span>{fmt(spring)}</span><span>{fmt(fall)}</span>
          </div>
          <div style={{ height: 6, background: "#e0e0e0", borderRadius: 'var(--radius-pill)', overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#a8e063", borderRadius: 'var(--radius-pill)', width: "58%" }} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#444" }}>Last spring frost date</label>
          <input type="date" value={spring} onChange={e => setSpring(e.target.value)} style={inp} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#444" }}>First fall frost date</label>
          <input type="date" value={fall} onChange={e => setFall(e.target.value)} style={inp} />
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <CTAButton onClick={onNext} style={{ padding: "14px", fontSize: 16 }}>Continue →</CTAButton>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button onClick={onSkip} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#bbb", fontWeight: 600, fontFamily: "inherit", padding: 8 }}>
            Skip for now
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Step 4: All Set ──────────────────────────────────────────────────────────

function StepAllSet({ onAddPlant, onExplore }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <ProgressDots step={3} />
      <div style={{ width: 96, height: 96, background: "#000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
        <img src={ICONS.seedlingGreen} alt="" style={{ width: 52, height: 52, objectFit: "contain" }} />
      </div>
      <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: -0.8, marginBottom: 10 }}>You're all set!</div>
      <div style={{ fontSize: 15, color: "#777", lineHeight: 1.65, marginBottom: 36, maxWidth: 260 }}>
        Your garden is ready. Start by adding your first plant.
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 44 }}>
        {ICON_LIBRARY.slice(0, 4).map((p, i) => (
          <img key={i} src={p.url} alt={p.name} style={{ width: 44, height: 44, objectFit: "contain", imageRendering: "pixelated" }} />
        ))}
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        <CTAButton onClick={onAddPlant} style={{ padding: "14px", fontSize: 16 }}>Add my first plant →</CTAButton>
        <button onClick={onExplore} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#bbb", fontWeight: 600, fontFamily: "inherit", padding: 8 }}>
          Explore first
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SignupFlow({ onDone, onSetUser, onSaveFrostDates, onSelectZones }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [selectedZones, setSelectedZones] = useState([]);
  const [spring, setSpring] = useState("");
  const [fall, setFall] = useState("");
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function goBack() { if (step > 0) setStep(s => s - 1); }

  async function handleCreateAccount() {
    setSubmitting(true); setAuthError("");
    const { data, error } = await authSignUp(form.email, form.password, form.name);
    setSubmitting(false);
    if (error) { setAuthError(error.message); return; }
    onSetUser({ id: data.user?.id, name: form.name, email: form.email });
    setStep(1);
  }

  function finish(openAdd = false) {
    if (spring || fall) onSaveFrostDates({ lastSpring: spring, firstFall: fall });
    if (selectedZones.length > 0) onSelectZones(selectedZones);
    onDone({ openAdd });
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9996, background: "#fff",
      display: "flex", flexDirection: "column", fontFamily: "'Cabin', system-ui, sans-serif",
    }}>
      {/* Header with back button */}
      <div style={{ padding: "52px 24px 0", flexShrink: 0 }}>
        <BackButton onBack={goBack} visible={step > 0 && step < 3} />
      </div>

      {/* Step content */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: step === 3
          ? "0 28px calc(env(safe-area-inset-bottom) + 32px)"
          : "0 28px calc(env(safe-area-inset-bottom) + 32px)",
        display: "flex", flexDirection: "column",
      }}>
        {step === 0 && <StepAccount form={form} setForm={setForm} onNext={handleCreateAccount} error={authError} submitting={submitting} />}
        {step === 1 && <StepZones selected={selectedZones} setSelected={setSelectedZones} onNext={() => setStep(2)} />}
        {step === 2 && <StepFrost spring={spring} setSpring={setSpring} fall={fall} setFall={setFall} onNext={() => setStep(3)} onSkip={() => setStep(3)} />}
        {step === 3 && <StepAllSet onAddPlant={() => finish(true)} onExplore={() => finish(false)} />}
      </div>
    </div>
  );
}
