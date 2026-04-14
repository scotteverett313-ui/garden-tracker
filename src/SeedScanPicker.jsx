import { useState } from "react";
import { CTAButton } from "./CTAButton.jsx";

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
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("No API key configured.");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content }] }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const match = clean.match(/\{[\s\S]*\}/);
      onScanned(JSON.parse(match ? match[0] : clean));
    } catch (err) { setError(`Scan failed: ${err.message}`); }
    finally { setScanning(false); }
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 800 }}>📷 Scan Seed Packet</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[{ label: "Front", img: frontImg, set: setFrontImg }, { label: "Back", img: backImg, set: setBackImg }].map(side => (
          <label key={side.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px dashed ${side.img ? "#5c3d1e" : "#ccc"}`, borderRadius: 12, padding: 16, cursor: "pointer", background: side.img ? "#fdf6ee" : "#fafaf8", minHeight: 90, textAlign: "center", gap: 4 }}>
            <div style={{ fontSize: 24 }}>{side.img ? "✓" : "📷"}</div>
            <div style={{ fontSize: 12, color: side.img ? "#5c3d1e" : "#888", fontWeight: side.img ? 600 : 400 }}>{side.img ? side.img.name.slice(0, 16) : side.label}</div>
            <input type="file" accept="image/*" capture="environment" onChange={e => side.set(e.target.files[0] || null)} style={{ display: "none" }} />
          </label>
        ))}
      </div>
      {error && <div style={{ background: "#fdecea", color: "#c0392b", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 10 }}>⚠️ {error}</div>}
      <button onClick={handleScan} disabled={scanning}
        style={{ width: "100%", padding: 13, background: scanning ? "#aaa" : "#5c3d1e", color: "#fff", border: "none", borderRadius: 12, cursor: scanning ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 700 }}>
        {scanning ? "📖 Reading packet..." : "✨ Scan & Extract"}
      </button>
    </div>
  );
}


// ─── Settings Panel (slides in from right) ───────────────────────────────────

export { SeedScanPicker };
