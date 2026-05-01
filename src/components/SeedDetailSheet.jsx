import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ICONS, CALENDAR_DATA, MONTHS } from "../constants.js";
import { formatDate, getAutoIcon } from "../utils.js";
import { CTAButton } from "./CTAButton.jsx";

function SeedDetailSheet({ seed, onClose, onUpdate, onDelete, onAddToGarden, onEdit }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const scrollRef = useRef(null);
  const cardRef = useRef(null);
  const imageRef = useRef(null);

  const calData = CALENDAR_DATA.find(c => c.name.toLowerCase() === seed.name?.toLowerCase());
  const imageUrl = getAutoIcon(seed.name)?.url || null;

  const currentYear = new Date().getFullYear();
  const seedAge = seed.year ? currentYear - parseInt(seed.year) : null;
  const freshness = seedAge === null ? null
    : seedAge <= 1 ? { label: "Fresh", color: "#2d8a3f", bg: "#d4edda" }
    : seedAge <= 3 ? { label: "Use soon", color: "#7d5a00", bg: "#fff3cd" }
    : { label: "Check viability", color: "#c0392b", bg: "#fdecea" };

  const hasPlantingGuide = seed.depth || seed.spacing || seed.startIndoors || seed.germDays;

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Entrance animation
  useEffect(() => {
    const card = cardRef.current;
    const img = imageRef.current;
    if (!card) return;

    gsap.set(card, { y: "100vh" });
    if (img) gsap.set(img, { y: 50, opacity: 0 });

    gsap.to(card, { y: 0, duration: 0.52, ease: "power3.out", clearProps: "transform" });
    if (img) gsap.to(img, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.1 });

    return () => {
      gsap.killTweensOf(card);
      if (img) gsap.killTweensOf(img);
    };
  }, []);

  // Scroll parallax — icon fades and drifts up as card covers it
  useEffect(() => {
    const el = scrollRef.current;
    const img = imageRef.current;
    if (!el || !img) return;

    const opacityTo = gsap.quickTo(img, "opacity", { duration: 0.25, ease: "power2.out" });
    const yTo = gsap.quickTo(img, "y", { duration: 0.3, ease: "power2.out" });

    function onScroll() {
      const s = el.scrollTop;
      opacityTo(Math.max(0, 1 - s * 0.014));
      yTo(-s * 0.25);
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Green backdrop */}
      <div style={{ position: "fixed", inset: 0, background: "#a8e063", zIndex: 1000 }}>

        {/* Icon zone */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "30vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "env(safe-area-inset-top, 20px)", pointerEvents: "none" }}>
          <div ref={imageRef} style={{ position: "relative", zIndex: 1 }}>
            {imageUrl
              ? <img src={imageUrl} alt={seed.name} style={{ width: 110, height: 110, objectFit: "contain", imageRendering: "pixelated", display: "block" }} />
              : <img src={ICONS.seeds} alt="Seed" style={{ width: 80, height: 80, objectFit: "contain", display: "block" }} />
            }
          </div>
        </div>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          onClick={e => e.target === e.currentTarget && onClose()}
          style={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden" }}
        >
          {/* Phantom gap */}
          <div style={{ height: "30vh", flexShrink: 0 }} />

          {/* White card */}
          <div
            ref={cardRef}
            style={{ minHeight: "100vh", background: "#fff", borderRadius: "20px 20px 0 0", position: "relative" }}
          >
            {/* Drag handle + nav */}
            <div style={{ borderRadius: "20px 20px 0 0", paddingBottom: 4 }}>
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
                <div style={{ width: 36, height: 4, background: "#e0e0e0", borderRadius: 99 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px 4px" }}>
                {/* Close */}
                <div style={{ position: "relative", paddingBottom: 3 }}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 3, bottom: 0, background: "#000", borderRadius: "50%", zIndex: 0 }} />
                  <button onClick={onClose} style={{ position: "relative", zIndex: 1, width: 40, height: 40, borderRadius: "50%", background: "#a8e063", border: "2.5px solid #000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={ICONS.exit} alt="Back" style={{ width: 18, height: 18, objectFit: "contain" }} />
                  </button>
                </div>
                {/* Bookmark */}
                <div style={{ position: "relative", paddingBottom: 3 }}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 3, bottom: 0, background: "#000", borderRadius: "50%", zIndex: 0 }} />
                  <button onClick={() => onUpdate({ ...seed, bookmarked: !seed.bookmarked })} style={{ position: "relative", zIndex: 1, width: 40, height: 40, borderRadius: "50%", background: "#fff", border: "2.5px solid #000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={seed.bookmarked ? ICONS.favActive : ICONS.favorite} alt="Bookmark" style={{ width: 20, height: 20, objectFit: "contain" }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Name + variety */}
            <div style={{ textAlign: "center", padding: "8px 16px 20px" }}>
              <h2 style={{ margin: "0 0 3px", fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>{seed.name || "Unnamed"}</h2>
              {seed.variety && <div style={{ color: "#888", fontSize: 14 }}>({seed.variety})</div>}
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                {seed.brand && <span style={{ fontSize: 12, background: "#f0f0f0", borderRadius: "var(--radius-input)", padding: "2px 9px", color: "#555" }}>{seed.brand}</span>}
                {seed.started && <span style={{ fontSize: 12, background: "#a8e063", borderRadius: "var(--radius-input)", padding: "2px 9px", color: "#000", fontWeight: 700, border: "1px solid #000" }}>✓ Started</span>}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: "0 16px 48px", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Packet Info */}
              <div style={{ border: "1.5px solid #e8e8e8", borderRadius: "var(--radius-card-sm)", padding: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>Packet Info</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Packet Year</div>
                    <div style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                      {seed.year || "—"}
                      {freshness && (
                        <span style={{ fontSize: 11, background: freshness.bg, color: freshness.color, padding: "1px 7px", borderRadius: "var(--radius-input)", fontWeight: 700 }}>
                          {freshness.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Days to Maturity</div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{seed.dtm ? `${seed.dtm} days` : "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2, display: "flex", alignItems: "center" }}>
                      <img src={ICONS.sun} style={{ width: 11, height: 11, objectFit: "contain", marginRight: 4 }} alt="" />Sun
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{seed.sun || "—"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2, display: "flex", alignItems: "center" }}>
                      <img src={ICONS.water} style={{ width: 11, height: 11, objectFit: "contain", marginRight: 4 }} alt="" />Water
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{seed.water || "—"}</div>
                  </div>
                </div>
              </div>

              {/* Planting Guide */}
              {hasPlantingGuide && (
                <div style={{ border: "1.5px solid #e8e8e8", borderRadius: "var(--radius-card-sm)", padding: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>Planting Guide</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px" }}>
                    {seed.depth && <div><div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Planting Depth</div><div style={{ fontWeight: 800, fontSize: 15 }}>{seed.depth}</div></div>}
                    {seed.spacing && <div><div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Spacing</div><div style={{ fontWeight: 800, fontSize: 15 }}>{seed.spacing}</div></div>}
                    {seed.startIndoors && <div><div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Start Indoors</div><div style={{ fontWeight: 800, fontSize: 15 }}>{seed.startIndoors} wks before frost</div></div>}
                    {seed.germDays && <div><div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Germination</div><div style={{ fontWeight: 800, fontSize: 15 }}>{seed.germDays} days</div></div>}
                  </div>
                </div>
              )}

              {/* When to Sow */}
              {calData && (
                <div style={{ border: "1.5px solid #e8e8e8", borderRadius: "var(--radius-card-sm)", padding: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>When to Sow</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 3, marginBottom: 10 }}>
                    {MONTHS.map((m, i) => {
                      const mo = i + 1;
                      const isIndoors = calData.indoors?.includes(mo);
                      const isTransplant = calData.transplant?.includes(mo);
                      const isDirect = calData.direct?.includes(mo);
                      const bg = isIndoors ? "#c8e6f8" : isTransplant ? "#c8f0c8" : isDirect ? "#f5f0a8" : "#e8e8e8";
                      const label = isIndoors ? "In" : isTransplant ? "Tr" : isDirect ? "Di" : "";
                      return (
                        <div key={m} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 8, color: "#999", fontWeight: 700, marginBottom: 3, textTransform: "uppercase" }}>{m}</div>
                          <div style={{ height: 22, background: bg, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: label ? "#444" : "#ccc" }}>
                            {label || "·"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {[{ color: "#c8e6f8", label: "Start indoors" }, { color: "#c8f0c8", label: "Transplant" }, { color: "#f5f0a8", label: "Direct sow" }].map(l => (
                      <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 10, height: 10, background: l.color, borderRadius: 2 }} />
                        <span style={{ fontSize: 11, color: "#666" }}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* About */}
              {seed.about && (
                <div style={{ fontSize: 14, color: "#555", lineHeight: 1.65 }}>{seed.about}</div>
              )}

              {/* Notes */}
              {seed.notes && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#444", marginBottom: 4 }}>Notes</div>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>{seed.notes}</div>
                </div>
              )}

              {seed.addedAt && (
                <div style={{ fontSize: 12, color: "#bbb", textAlign: "center" }}>Added {formatDate(seed.addedAt)}</div>
              )}

              {/* Actions */}
              <CTAButton onClick={() => { onAddToGarden(seed); onClose(); }} style={{ padding: 13, fontSize: 15 }}>
                <img src={ICONS.seedlingGreen} style={{ width: 14, height: 14, objectFit: "contain", marginRight: 6, verticalAlign: "middle" }} alt="" />Add to Garden
              </CTAButton>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => onUpdate({ ...seed, started: !seed.started })}
                  style={{ flex: 1, padding: "10px", background: seed.started ? "#000" : "#fff", color: seed.started ? "#fff" : "#555", border: "2px solid #000", borderRadius: "var(--radius-icon)", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                  {seed.started ? "✓ Started" : "Mark Started"}
                </button>
                <button onClick={() => onEdit(seed)}
                  style={{ flex: 1, padding: "10px", background: "#fff", border: "2px solid #000", borderRadius: "var(--radius-icon)", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                  <img src={ICONS.edit} alt="" style={{ width: 16, height: 16, objectFit: "contain", marginRight: 5, verticalAlign: "middle" }} />Edit
                </button>
              </div>

              {/* Delete */}
              <div style={{ paddingTop: 4, borderTop: "1px solid #f0f0f0" }}>
                {showDeleteConfirm ? (
                  <div style={{ background: "#fdecea", border: "2px solid #c0392b", borderRadius: "var(--radius-icon)", padding: 14, textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#c0392b", marginBottom: 6 }}>Remove {seed.name}?</div>
                    <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>This can't be undone.</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { onDelete(seed.id); onClose(); }}
                        style={{ flex: 1, padding: "10px", background: "#c0392b", color: "#fff", border: "none", borderRadius: "var(--radius-input)", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Delete</button>
                      <button onClick={() => setShowDeleteConfirm(false)}
                        style={{ flex: 1, padding: "10px", background: "#fff", border: "1.5px solid #ccc", borderRadius: "var(--radius-input)", cursor: "pointer", fontSize: 14 }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowDeleteConfirm(true)}
                    style={{ width: "100%", padding: "11px", background: "none", border: "1.5px solid #e0e0e0", borderRadius: "var(--radius-icon)", cursor: "pointer", fontSize: 14, color: "#c0392b", fontWeight: 600 }}>
                    <img src={ICONS.trash} alt="" style={{ width: 16, height: 16, objectFit: "contain", marginRight: 5, verticalAlign: "middle" }} />Remove from Library
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export { SeedDetailSheet };
