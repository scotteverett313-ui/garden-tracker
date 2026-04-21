export function TermsScreen({ type, onBack }) {
  const isPrivacy = type === "privacy";

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: "#111" }}>{title}</div>
      <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9994, background: "#fff", display: "flex", flexDirection: "column", fontFamily: "'Cabin', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "52px 20px 14px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, position: "sticky", top: 0 }}>
        <button onClick={onBack} style={{ background: "#f0f0f0", border: "none", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>←</button>
        <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: -0.5 }}>{isPrivacy ? "Privacy Policy" : "Terms of Service"}</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px calc(env(safe-area-inset-bottom) + 32px)" }}>
        <div style={{ fontSize: 12, color: "#aaa", marginBottom: 24 }}>
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </div>

        {isPrivacy ? (
          <>
            <Section title="Information We Collect">
              We collect information you provide directly, including your name, email address, and garden data (plants, zones, frost dates). We do not sell your personal information to third parties.
            </Section>
            <Section title="How We Use Your Information">
              Your data is used solely to provide and improve the Dirt Rich app. Garden data is stored securely and synced across your devices when you're signed in.
            </Section>
            <Section title="Data Storage">
              Your garden data is stored on secure servers. You can export or delete your data at any time from the app's Settings screen.
            </Section>
            <Section title="Third-Party Services">
              We use Supabase for data storage and Anthropic's Claude API for seed packet scanning. These services have their own privacy policies. The Claude API receives photos you choose to scan — no photos are stored.
            </Section>
            <Section title="Your Rights">
              You may request access to, correction of, or deletion of your personal data at any time by contacting us or using the Delete Account option in Settings.
            </Section>
            <Section title="Children's Privacy">
              Dirt Rich is not directed at children under 13. We do not knowingly collect personal information from children under 13.
            </Section>
            <Section title="Contact">
              For privacy questions, contact us at privacy@dirtrich.app
            </Section>
          </>
        ) : (
          <>
            <Section title="Acceptance of Terms">
              By using Dirt Rich, you agree to these Terms of Service. If you don't agree, please don't use the app.
            </Section>
            <Section title="Your Account">
              You're responsible for keeping your account credentials secure. You must provide accurate information when creating an account. One account per person.
            </Section>
            <Section title="Your Data">
              You own your garden data. We don't claim any rights over the content you create. You can export or delete it at any time.
            </Section>
            <Section title="Acceptable Use">
              You may not use Dirt Rich to violate any laws, transmit malicious code, or interfere with other users. We reserve the right to suspend accounts that violate these terms.
            </Section>
            <Section title="AI Features">
              The seed packet scanning feature uses Claude AI. Results may not always be accurate — always verify planting information from authoritative sources.
            </Section>
            <Section title="Disclaimer">
              Dirt Rich is provided "as is." We don't guarantee the accuracy of planting information and aren't liable for crop losses or damages arising from use of the app.
            </Section>
            <Section title="Changes to Terms">
              We may update these terms. Continued use after changes means you accept the new terms. We'll notify you of significant changes.
            </Section>
            <Section title="Contact">
              Questions? Reach us at hello@dirtrich.app
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
