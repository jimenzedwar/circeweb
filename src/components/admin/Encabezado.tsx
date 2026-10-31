export function Encabezado({ titulo, sub, children }: { titulo: string; sub: string; children?: React.ReactNode }) {
  return (
    <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px, 4vw, 42px)", lineHeight: 1, fontWeight: 500 }}>{titulo}</h1>
        <span style={{ fontSize: 13, color: "#5E574F" }}>{sub}</span>
      </div>
      {children}
    </header>
  );
}

export function Barras({ titulo, sub, filas, color }: { titulo: string; sub: string; filas: { etiqueta: string; n: number }[]; color: string }) {
  const max = Math.max(1, ...filas.map((f) => f.n));
  return (
    <section className="acard" aria-label={titulo} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, borderRadius: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><h2 className="ah2">{titulo}</h2><span style={{ fontSize: 12, color: "#5E574F" }}>{sub}</span></div>
      {filas.length === 0 ? (
        <span style={{ fontSize: 13, color: "#8C8379" }}>Aún no hay datos en este periodo.</span>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filas.map((f) => (
            <div key={f.etiqueta} className="brow">
              <span className="blab" title={f.etiqueta}>{f.etiqueta || "Sin dato"}</span>
              <span className="btrack"><span style={{ width: `${Math.round((f.n / max) * 100)}%`, height: "100%", background: color, borderRadius: "0 2px 2px 0" }} /></span>
              <span className="bval">{f.n}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
