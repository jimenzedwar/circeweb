"use client";
import { useEffect } from "react";
import { useSitio } from "./proveedor";

/** Cuenta una visita por sesión del navegador. */
export function Visita() {
  const { registrar } = useSitio();
  useEffect(() => {
    try {
      if (sessionStorage.getItem("visita")) return;
      sessionStorage.setItem("visita", "1");
    } catch {}
    registrar("visita");
  }, [registrar]);
  return null;
}
