import type { Emocion } from "@/lib/tipos";

interface Cara {
  /** 0 = ojos cerrados (arcos), 1 = abiertos, 2 = guiño. */
  ojos: 0 | 1 | 2;
  alto?: number;
  y?: number;
  arcoIzq: string;
  arcoDer: string;
  boca: string;
  rellenoBoca: string;
  cejas: string;
  destellos?: boolean;
  puntos?: boolean;
}

const CARAS: Record<Emocion, Cara> = {
  feliz: { ojos: 0, arcoIzq: "M45 71q4-5 8 0", arcoDer: "M67 71q4-5 8 0", boca: "M53 80q7 9 14 0z", rellenoBoca: "#7A2E3B", cejas: "M44 62q4-3 9-1M67 61q5-2 9 1" },
  hablando: { ojos: 1, alto: 3.6, y: 70, arcoIzq: "", arcoDer: "", boca: "M55 81q5 6 10 0z", rellenoBoca: "#7A2E3B", cejas: "M44 62q4-2 9-1M67 61q5-1 9 1" },
  pensando: { ojos: 1, alto: 3.2, y: 68, arcoIzq: "", arcoDer: "", boca: "M56 83h8", rellenoBoca: "none", cejas: "M44 61q4-4 9-2M67 63q5 0 9 0", puntos: true },
  sorprendida: { ojos: 1, alto: 4.6, y: 70, arcoIzq: "", arcoDer: "", boca: "M57 84a3 3.8 0 1 0 6 0a3 3.8 0 1 0-6 0z", rellenoBoca: "#7A2E3B", cejas: "M44 59q4-4 9-2M67 57q5-2 9 2" },
  apenada: { ojos: 1, alto: 3.4, y: 71, arcoIzq: "", arcoDer: "", boca: "M54 86q6-5 12 0", rellenoBoca: "none", cejas: "M44 63l9-3M76 63l-9-3" },
  guino: { ojos: 2, alto: 3.6, y: 70, arcoIzq: "", arcoDer: "M67 71q4-4 8 0", boca: "M53 81q8 7 15-2", rellenoBoca: "none", cejas: "M44 62q4-3 9-1M67 62q5-1 9 1" },
  mistica: { ojos: 0, arcoIzq: "M45 70q4 4 8 0", arcoDer: "M67 70q4 4 8 0", boca: "M54 81q6 5 12 0", rellenoBoca: "none", cejas: "M44 62q4-2 9-1M67 61q5-1 9 1", destellos: true },
};

export const ETIQUETA_EMOCION: Record<Emocion, string> = {
  feliz: "contenta",
  hablando: "te explica",
  pensando: "pensando…",
  sorprendida: "¡atención!",
  apenada: "te paso con ella",
  guino: "guiño",
  mistica: "en calma",
};

const transicion = { transition: "opacity .25s ease, d .25s ease" };

/** Circe en caricatura; la cara cambia según la emoción. */
export function CirceAvatar({ emocion = "feliz", tamano = 92 }: { emocion?: Emocion; tamano?: number }) {
  const c = CARAS[emocion] ?? CARAS.feliz;
  const y = c.y ?? 70;
  const alto = c.alto ?? 3.6;
  return (
    <svg viewBox="0 0 120 120" width={tamano} height={tamano} role="img" aria-label="Circe">
      <g opacity={c.destellos ? 1 : 0} fill="#D9C9A8" className="cw-twinkle" style={transicion}>
        <path d="M18 40l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
        <path d="M98 34l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" />
        <path d="M100 82l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z" />
      </g>
      <g opacity={c.puntos ? 1 : 0} fill="#D9C9A8" style={transicion}>
        <circle cx="92" cy="60" r="2.2" className="dot1" />
        <circle cx="100" cy="52" r="3" className="dot2" />
        <circle cx="109" cy="42" r="3.8" className="dot3" />
      </g>
      <path d="M34 60c-8 14-6 34 2 46h48c8-12 10-32 2-46z" fill="#2A1A22" />
      <path d="M46 98h28l12 22H34z" fill="#581F30" />
      <path d="M52 98l8 9 8-9" fill="none" stroke="#B79A70" strokeWidth="1.2" />
      <circle cx="60" cy="72" r="24" fill="#F2DCC8" />
      <path d={c.cejas} fill="none" stroke="#2A1A22" strokeWidth="2" strokeLinecap="round" />
      <ellipse className="eye" cx="49" cy={y} rx="2.8" ry={alto} fill="#2A1A22" opacity={c.ojos === 0 ? 0 : 1} style={transicion} />
      <ellipse className="eye" cx="71" cy={y} rx="2.8" ry={alto} fill="#2A1A22" opacity={c.ojos === 1 ? 1 : 0} style={transicion} />
      {c.arcoIzq && <path d={c.arcoIzq} fill="none" stroke="#2A1A22" strokeWidth="2.4" strokeLinecap="round" />}
      {c.arcoDer && c.ojos !== 1 && (
        <path d={c.arcoDer} fill="none" stroke="#2A1A22" strokeWidth="2.4" strokeLinecap="round" />
      )}
      <circle cx="47" cy="79" r="3.4" fill="#E8A0A0" opacity=".55" />
      <circle cx="73" cy="79" r="3.4" fill="#E8A0A0" opacity=".55" />
      <path d={c.boca} fill={c.rellenoBoca} stroke="#7A2E3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 56c4-10 12-16 24-16s20 6 24 16c-6-6-14-8-24-8s-18 2-24 8z" fill="#2A1A22" />
      <g className="cw-hat">
        <ellipse cx="60" cy="50" rx="40" ry="7" fill="#3D1522" stroke="#B79A70" strokeWidth="1" />
        <path d="M38 49Q52 14 62 6q4-3 6 2-4 8-2 18 4 14 8 23z" fill="#581F30" stroke="#B79A70" strokeWidth="1" />
        <path d="M40 45q22 5 36 0" fill="none" stroke="#B79A70" strokeWidth="3" />
        <path d="M57 28a5 5 0 1 0 4 8 4 4 0 0 1-4-8z" fill="#D9C9A8" />
      </g>
    </svg>
  );
}
