export function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 560, zIndex: 999, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === "error" ? "#c0392b" : t.type === "warning" ? "#e67e22" : "#5c3d1e",
          color: "#fff", borderRadius: 'var(--radius-icon)', padding: "12px 16px", fontSize: 14, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "var(--shadow-soft)",
          animation: "slideUp 0.25s ease",
          pointerEvents: t.action ? "auto" : "none",
        }}>
          <span style={{ fontSize: 18 }}>{t.type === "error" ? "⚠️" : t.type === "warning" ? "⚡" : t.icon || "✓"}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
          {t.action && (
            <button
              onClick={() => { t.action.onClick(); t.action.dismiss(); }}
              style={{ background: "rgba(255,255,255,0.25)", border: "1.5px solid rgba(255,255,255,0.6)", borderRadius: 'var(--radius-sm)', padding: "4px 12px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {t.action.label}
            </button>
          )}
        </div>
      ))}
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes popIn { 0% { transform:scale(0.92); opacity:0; } 60% { transform:scale(1.04); } 100% { transform:scale(1); opacity:1; } }
        @keyframes sheetUp { from { transform:translateY(100%); opacity:0.5; } to { transform:translateY(0); opacity:1; } }
        @keyframes slideInRight { from { transform:translateX(100%); } to { transform:translateX(0); } }

        button { transition: transform 0.08s ease; }
        button:active { transform: translateY(3px); }
        .plant-card { transition: transform 0.08s ease; }
        .plant-card:active { transform: translateY(4px); }
        .btn-cta { transition: transform 0.08s ease !important; }
        .btn-cta:active { transform: translateY(4px) !important; }
        .status-pill { transition: transform 0.08s ease; }
        .status-pill:active { transform: translateY(2px); }
        .nav-tab { transition: transform 0.08s ease; }
        .nav-tab:active { transform: translateY(2px); }
        .icon-btn { transition: transform 0.08s ease; }
        .icon-btn:active { transform: translateY(2px); }
        .modal-sheet { animation: sheetUp 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .add-zone-btn { transition: border-color 0.15s ease, color 0.15s ease, transform 0.08s ease; }
        .add-zone-btn:hover { border-color: #000; color: #000; }
        .add-zone-btn:active { transform: translateY(2px); }
        .care-type-btn { transition: transform 0.08s ease; }
        .care-type-btn:active { transform: translateY(2px); }
      `}</style>
    </div>
  );
}
