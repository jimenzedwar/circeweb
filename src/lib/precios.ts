import type { Item, Moneda } from "./tipos";

export const formatoCop = (n: number) => "$" + n.toLocaleString("es-CO", { maximumFractionDigits: 0 }) + " COP";

/** Precio en la moneda elegida; si el servicio solo tiene USD, se muestra en USD. */
export function precio(i: Pick<Item, "precio_usd" | "precio_cop" | "precio_texto">, moneda: Moneda): string {
  if (i.precio_texto) return i.precio_texto;
  if (moneda === "cop" && i.precio_cop) return formatoCop(i.precio_cop);
  if (i.precio_usd) return `${i.precio_usd} USD`;
  if (i.precio_cop) return formatoCop(i.precio_cop);
  return "Precio a consultar";
}

/** El precio en la otra moneda, para mostrarlo como referencia. */
export function precioAlterno(i: Pick<Item, "precio_usd" | "precio_cop" | "precio_texto">, moneda: Moneda): string {
  if (i.precio_texto || !i.precio_usd || !i.precio_cop) return "";
  return moneda === "cop" ? `${i.precio_usd} USD` : formatoCop(i.precio_cop);
}

export const enlaceWhatsapp = (numero: string, texto: string) =>
  `https://wa.me/${numero.replace(/\D/g, "")}?text=${encodeURIComponent(texto)}`;
