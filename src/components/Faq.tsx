"use client";

import { useRef, type MouseEvent } from "react";

const DURACION = 420;
const CURVA = "cubic-bezier(.2,.7,.2,1)";

/** Pregunta frecuente que se abre y cierra con una animación suave de altura. */
export function Faq({ pregunta, respuesta, abierta = false }: { pregunta: string; respuesta: string; abierta?: boolean }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const animacion = useRef<Animation | null>(null);

  const alternar = (e: MouseEvent) => {
    const d = ref.current;
    if (!d || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    const resumen = d.querySelector("summary")!;
    const texto = d.querySelector("p")!;
    const estilo = getComputedStyle(d);
    const cerrado = resumen.offsetHeight + parseFloat(estilo.paddingTop) + parseFloat(estilo.paddingBottom);
    const desde = d.offsetHeight;
    const abrir = !d.open || d.classList.contains("cerrando");

    animacion.current?.cancel();
    texto.getAnimations().forEach((a) => a.cancel());
    d.style.overflow = "hidden";
    if (abrir) {
      d.classList.remove("cerrando");
      d.open = true;
    } else {
      d.classList.add("cerrando");
    }
    const hasta = abrir ? d.offsetHeight : cerrado;

    animacion.current = d.animate({ height: [`${desde}px`, `${hasta}px`] }, { duration: DURACION, easing: CURVA });
    texto.animate(
      abrir
        ? { opacity: [0, 1], transform: ["translateY(-6px)", "none"] }
        : { opacity: [1, 0], transform: ["none", "translateY(-6px)"] },
      { duration: abrir ? DURACION : DURACION * 0.6, easing: CURVA, fill: abrir ? "none" : "forwards" },
    );
    animacion.current.onfinish = () => {
      if (!abrir) {
        d.open = false;
        d.classList.remove("cerrando");
        texto.getAnimations().forEach((a) => a.cancel());
      }
      d.style.overflow = "";
      animacion.current = null;
    };
  };

  return (
    <details ref={ref} className="faq" open={abierta}>
      <summary onClick={alternar}>
        {pregunta} <span aria-hidden="true">+</span>
      </summary>
      <p>{respuesta}</p>
    </details>
  );
}
