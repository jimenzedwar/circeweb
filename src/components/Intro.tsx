/** Sello que se dibuja al entrar (solo CSS; se reproduce una vez por carga de página). */
export function Intro() {
  return (
    <div className="veil" aria-hidden="true">
      <div style={{ position: "relative", width: 300, height: 300, display: "grid", placeItems: "center" }}>
        <svg viewBox="0 0 400 400" fill="none" stroke="#B79A70" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <circle cx="200" cy="200" r="190" strokeWidth="1" />
          <circle cx="200" cy="200" r="160" strokeWidth=".6" />
        </svg>
        <span className="vt" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: "#EDE4D7", textTransform: "uppercase" }}>Circe</span>
      </div>
    </div>
  );
}
