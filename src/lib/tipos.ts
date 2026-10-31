export interface Seccion {
  id: string;
  nombre: string;
  corto: string;
  motivo: string;
  palabra: string;
  descripcion: string;
  sinonimos: string[];
  orden: number;
}

export interface Categoria {
  id: string;
  nombre: string;
  orden: number;
}

export interface Item {
  id: string;
  slug: string;
  tipo: "servicio" | "producto";
  seccion: string;
  nombre: string;
  nivel: string;
  motivo: string;
  precio_usd: number | null;
  precio_cop: number | null;
  precio_texto: string | null;
  descripcion: string;
  incluye_titulo: string | null;
  incluye: string[];
  palabras_clave: string[];
  imagen_url: string | null;
  destacado: boolean;
  orden: number;
}

export type Emocion = "feliz" | "hablando" | "pensando" | "sorprendida" | "apenada" | "guino" | "mistica";

export type AccionPregunta =
  | { tipo: "whatsapp"; etiqueta: string; mensaje: string }
  | { tipo: "catalogo"; etiqueta: string; seccion?: string };

export interface Pregunta {
  id: string;
  pregunta: string;
  respuesta: string;
  palabras_clave: string[];
  aplica_a: string[];
  emocion: Emocion;
  acciones: AccionPregunta[];
}

export interface Testimonio {
  id: string;
  item_id: string | null;
  imagen_url: string;
  pais: string;
  fecha_texto: string;
}

export type Contenido = Record<string, string>;

export interface Sitio {
  secciones: Seccion[];
  categorias: Categoria[];
  items: Item[];
  preguntas: Pregunta[];
  testimonios: Testimonio[];
  contenido: Contenido;
  demo: boolean;
}

export type Moneda = "usd" | "cop";
