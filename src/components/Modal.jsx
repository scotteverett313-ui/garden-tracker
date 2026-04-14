import { ICONS } from "../constants.js";

export function Modal({ children, onClose, width = 560 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" style={{ background: "#fff", borderRadius: "16px 16px 0 0", width: "100%", maxWidth: width, maxHeight: "92vh", overflowY: "auto", position: "relative", display: "flex", flexDirection: "column" }}>
        <div style={{ position: "sticky", top: 0, background: "#fff", zIndex: 10, padding: "20px 16px 12px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: "#f0f0f0", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 12 }}>
            <img src={ICONS.exit} alt="Close" style={{ width: 16, height: 16, objectFit: "contain" }} />
          </button>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 36, height: 4, background: "#ddd", borderRadius: 4 }} />
          </div>
          <div style={{ width: 32, flexShrink: 0, marginLeft: 12 }} />
        </div>
        <div style={{ padding: "20px 16px 40px", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
