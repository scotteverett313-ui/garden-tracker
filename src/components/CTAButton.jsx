export function CTAButton({ onClick, children, style = {}, disabled = false }) {
  const { marginTop, marginBottom, marginLeft, marginRight, margin, width, display, ...buttonStyle } = style;
  const isFullWidth = width !== "auto";
  const wrapperStyle = { position: "relative", width: isFullWidth ? "100%" : "auto", display: isFullWidth ? "block" : "inline-block", paddingBottom: 4, marginTop, marginBottom, marginLeft, marginRight, margin };
  return (
    <div style={wrapperStyle}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 4, bottom: 0, background: "#000", borderRadius: 'var(--radius-pill)', zIndex: 0 }} />
      <button onClick={onClick} disabled={disabled} className="btn-cta"
        style={{ position: "relative", zIndex: 1, width: "100%", background: disabled ? "#ccc" : "#a8e063", color: "#000", border: "2.5px solid #000", borderRadius: 'var(--radius-pill)', cursor: disabled ? "not-allowed" : "pointer", fontWeight: 800, fontFamily: "inherit", transition: "transform 0.08s ease", ...buttonStyle }}>
        {children}
      </button>
    </div>
  );
}
