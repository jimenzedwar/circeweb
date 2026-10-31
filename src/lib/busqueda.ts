/**
 * Búsqueda por palabras sin servicios externos: normaliza (minúsculas, sin
 * acentos ni signos), quita palabras vacías, reduce plurales, expande
 * sinónimos y tolera errores de tipeo (distancia de edición). La usan el
 * buscador del inicio, el catálogo y el chatbot.
 */

const PALABRAS_VACIAS = new Set([
  "a", "al", "algo", "alguna", "alguno", "ante", "con", "como", "cual", "de", "del", "desde",
  "el", "ella", "ellos", "en", "es", "esa", "ese", "eso", "esta", "este", "esto", "estoy", "fue",
  "ha", "hay", "la", "las", "le", "les", "lo", "los", "me", "mi", "mis", "muy", "necesito",
  "o", "para", "pero", "por", "porque", "puedo", "que", "quiero", "se", "ser", "si", "sin", "sobre",
  "su", "sus", "te", "ti", "tu", "tus", "un", "una", "uno", "unos", "unas", "y", "ya", "yo",
  "hola", "buenas", "buenos", "favor", "gustaria", "saber", "tienes", "tiene", "hacer", "hace",
  "alguien", "algun", "quisiera", "podria", "puede", "pueden", "puedes", "mas", "tambien", "otra", "otro",
]);

/**
 * Equivalencias que la gente escribe → términos que aparecen en el catálogo.
 * Las claves y valores se normalizan solos; agregar aquí nuevas palabras.
 */
const SINONIMOS: Record<string, string[]> = {
  ex: ["retorno", "regreso", "volver"],
  regrese: ["retorno", "volver"],
  regreso: ["retorno"],
  volver: ["retorno"],
  vuelva: ["retorno", "volver"],
  dinero: ["abundancia", "prosperidad", "ingresos"],
  plata: ["dinero", "abundancia"],
  economia: ["dinero", "abundancia"],
  deuda: ["prosperidad", "dinero"],
  trabajo: ["laboral", "empleo"],
  empleo: ["laboral", "trabajo"],
  chamba: ["laboral", "trabajo"],
  ascenso: ["laboral"],
  negocio: ["clientes", "ventas", "emprendimiento"],
  tienda: ["negocio", "clientes"],
  emprendimiento: ["negocio", "clientes"],
  infiel: ["vendaje", "fidelidad", "rechaza"],
  mujeriego: ["vendaje", "fidelidad", "rechaza"],
  engano: ["infiel", "vendaje"],
  amante: ["separacion", "rechaza", "terceras"],
  envidia: ["ojos", "blindaje", "proteccion"],
  ojo: ["ojos", "despojo"],
  brujeria: ["tumba", "barrido", "despojo", "espejo"],
  hechizaron: ["brujeria", "tumba", "barrido"],
  trabajaron: ["brujeria", "tumba", "barrido"],
  maldicion: ["brujeria", "tumba"],
  olvidar: ["corte", "lazos", "congelamiento", "liberacion"],
  superar: ["corte", "liberacion", "congelamiento"],
  autoestima: ["amor", "propio", "renacer"],
  bonita: ["belleza", "esencia"],
  linda: ["belleza"],
  guapa: ["belleza"],
  casa: ["hogar", "familia", "familiar"],
  hogar: ["casa", "familia"],
  perro: ["mascotas", "mascota"],
  gato: ["mascotas", "mascota"],
  salud: ["salud", "refuerzo"],
  enfermo: ["salud"],
  loteria: ["suerte", "azar"],
  apuesta: ["suerte", "azar"],
  casino: ["suerte", "azar"],
  boda: ["matrimonial", "compromiso"],
  casarse: ["matrimonial", "compromiso"],
  matrimonio: ["matrimonial", "compromiso"],
  formalizar: ["compromiso"],
  sexo: ["deseo", "sexual", "pasion"],
  pasion: ["deseo"],
  acoso: ["despedida", "destierro"],
  acosa: ["despedida", "destierro"],
  tarot: ["lectura"],
  cartas: ["tarot", "lectura"],
  precio: ["costo", "pago", "valor"],
  cuesta: ["precio", "costo", "valor"],
  cuanto: ["precio", "costo"],
  pagar: ["pago", "precio"],
  vela: ["velita", "velon", "refuerzo"],
  velita: ["vela", "refuerzo"],
  rapido: ["tarda", "tiempo"],
  demora: ["tarda", "tiempo"],
  funciona: ["resultado", "garantia"],
};

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Raíz muy simple: quita "mente" y plurales. Suficiente para el catálogo. */
export function raiz(palabra: string): string {
  let p = palabra;
  if (p.length > 7 && p.endsWith("mente")) p = p.slice(0, -5);
  if (p.length > 5 && p.endsWith("ces")) return p.slice(0, -3) + "z";
  if (p.length > 4 && p.endsWith("es") && !p.endsWith("ses")) return p.slice(0, -2);
  if (p.length > 3 && p.endsWith("s")) return p.slice(0, -1);
  return p;
}

function tokens(texto: string): string[] {
  return normalizar(texto)
    .split(" ")
    .filter((t) => t.length > 1 && !PALABRAS_VACIAS.has(t))
    .map(raiz);
}

const SINONIMOS_NORMALIZADOS: Map<string, string[]> = new Map(
  Object.entries(SINONIMOS).map(([clave, lista]) => [
    raiz(normalizar(clave)),
    lista.flatMap((v) => tokens(v)),
  ]),
);

/** Distancia de edición con límite (corta temprano si se pasa del máximo). */
function distancia(a: string, b: string, maximo: number): number {
  if (Math.abs(a.length - b.length) > maximo) return maximo + 1;
  let previa = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const actual = [i];
    let minimoFila = i;
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      actual[j] = Math.min(previa[j] + 1, actual[j - 1] + 1, previa[j - 1] + costo);
      minimoFila = Math.min(minimoFila, actual[j]);
    }
    if (minimoFila > maximo) return maximo + 1;
    previa = actual;
  }
  return previa[b.length];
}

/** Qué tanto se parece una palabra buscada a una palabra del texto (0 a 1). */
function parecido(buscada: string, delTexto: string): number {
  if (buscada === delTexto) return 1;
  if (buscada.length >= 3 && delTexto.startsWith(buscada)) return 0.85;
  if (delTexto.length >= 4 && buscada.startsWith(delTexto)) return 0.75;
  const maximo = buscada.length >= 7 ? 2 : buscada.length >= 4 ? 1 : 0;
  if (maximo > 0 && distancia(buscada, delTexto, maximo) <= maximo) return 0.6;
  return 0;
}

export interface CampoBusqueda {
  texto: string;
  /** Importancia del campo: título 3, palabras clave 2.5, descripción 1… */
  peso: number;
}

export interface ItemIndexado<T> {
  item: T;
  campos: { tokens: string[]; peso: number; normal: string }[];
}

export interface Resultado<T> {
  item: T;
  puntaje: number;
}

export function crearIndice<T>(items: T[], extraer: (item: T) => CampoBusqueda[]): ItemIndexado<T>[] {
  return items.map((item) => ({
    item,
    campos: extraer(item).map((c) => ({ tokens: tokens(c.texto), peso: c.peso, normal: normalizar(c.texto) })),
  }));
}

interface TerminoConsulta {
  texto: string;
  factor: number;
  /** Índice de la palabra original de la consulta (para medir cobertura). */
  origen: number;
}

function terminosDe(consulta: string): { terminos: TerminoConsulta[]; total: number } {
  const base = tokens(consulta);
  const terminos: TerminoConsulta[] = [];
  base.forEach((t, i) => {
    terminos.push({ texto: t, factor: 1, origen: i });
    for (const s of SINONIMOS_NORMALIZADOS.get(t) ?? []) {
      terminos.push({ texto: s, factor: 0.7, origen: i });
    }
  });
  return { terminos, total: base.length };
}

/**
 * Busca `consulta` en el índice y devuelve los resultados ordenados del más
 * al menos parecido. `minimo` descarta coincidencias débiles.
 */
export function buscar<T>(indice: ItemIndexado<T>[], consulta: string, minimo = 0.6): Resultado<T>[] {
  const { terminos, total } = terminosDe(consulta);
  if (total === 0) return [];
  const frase = normalizar(consulta);

  const resultados: Resultado<T>[] = [];
  for (const entrada of indice) {
    const mejorPorOrigen = new Array<number>(total).fill(0);
    for (const termino of terminos) {
      let mejor = 0;
      for (const campo of entrada.campos) {
        for (const t of campo.tokens) {
          const p = parecido(termino.texto, t);
          if (p > 0) mejor = Math.max(mejor, p * campo.peso * termino.factor);
        }
      }
      mejorPorOrigen[termino.origen] = Math.max(mejorPorOrigen[termino.origen], mejor);
    }
    const encontrados = mejorPorOrigen.filter((v) => v > 0).length;
    if (encontrados === 0) continue;
    const suma = mejorPorOrigen.reduce((a, b) => a + b, 0);
    const cobertura = encontrados / total;
    let puntaje = (suma / total) * (0.4 + 0.6 * cobertura);
    // La frase completa dentro de un campo pesa mucho (ej. "mal de ojo").
    if (frase.length >= 4 && entrada.campos.some((c) => c.normal.includes(frase))) puntaje += 1.5;
    if (puntaje >= minimo) resultados.push({ item: entrada.item, puntaje });
  }
  return resultados.sort((a, b) => b.puntaje - a.puntaje);
}
