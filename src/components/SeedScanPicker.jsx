import { useState } from "react";
import { CTAButton } from "./CTAButton.jsx";
import { callClaude } from "../claude.js";

function SeedScanPicker({ onScanned }) {
  const [frontImg, setFrontImg] = useState(null);
  const [backImg, setBackImg] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  async function fileToBase64(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result.split(",")[1]);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }

  async function handleScan() {
    if (!frontImg && !backImg) { setError("Add at least one photo."); return; }
    setScanning(true); setError("");
    try {
      const content = [];
      if (frontImg) { content.push({ type: "image", source: { type: "base64", media_type: frontImg.type, data: await fileToBase64(frontImg) } }); content.push({ type: "text", text: "Front of seed packet." }); }
      if (backImg) { content.push({ type: "image", source: { type: "base64", media_type: backImg.type, data: await fileToBase64(backImg) } }); content.push({ type: "text", text: "Back of seed packet." }); }
      content.push({ type: "text", text: `Extract seed packet info. Return ONLY JSON: {"name":"","variety":"","brand":"","dtm":null,"depth":"","spacing":"","sun":"","water":"","startIndoors":null,"germDays":"","about":"","notes":""}` });
      const text = await callClaude([{ role: "user", content }]);
      const clean = text.replace(/```json|```/g, "").trim();
      const match = clean.match(/\{[\s\S]*\}/);
      onScanned(JSON.parse(match ? match[0] : clean));
    } catch (err) { setError(`Scan failed: ${err.message}`); }
    finally { setScanning(false); }
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>Scan Seed Packet</h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#888" }}>Add a photo of the front and/or back — Claude reads the rest.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[{ label: "Front", img: frontImg, set: setFrontImg }, { label: "Back", img: backImg, set: setBackImg }].map(side => (
          <div key={side.label} style={{ position: "relative", paddingBottom: 4 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 'var(--radius-card-sm)', zIndex: 0 }} />
            <label style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2.5px solid #000`, borderRadius: 'var(--radius-card-sm)', padding: "18px 12px", cursor: "pointer", background: side.img ? "#f0fbe0" : "#fff", minHeight: 90, textAlign: "center", gap: 6, boxSizing: "border-box" }}>
              <div style={{ fontSize: 26 }}>{side.img ? "✅" : "📷"}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: side.img ? "#2d6a10" : "#aaa" }}>
                {side.img ? side.img.name.slice(0, 16) : side.label}
              </div>
              <input type="file" accept="image/*" capture="environment" onChange={e => side.set(e.target.files[0] || null)} style={{ display: "none" }} />
            </label>
          </div>
        ))}
      </div>

      {error && <div style={{ background: "#fdecea", color: "#c0392b", borderRadius: 'var(--radius-input)', padding: "10px 14px", fontSize: 13, marginBottom: 12, fontWeight: 600 }}>⚠️ {error}</div>}

      <CTAButton onClick={handleScan} disabled={scanning} style={{ padding: "13px", fontSize: 15 }}>
        {scanning ? "📖 Reading packet..." : "✨ Scan & Extract"}
      </CTAButton>
    </div>
  );
}


// ─── Settings Panel (slides in from right) ───────────────────────────────────

export { SeedScanPicker };
