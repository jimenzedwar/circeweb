import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS no acepta SVG como icono: se dibuja el mismo icon.svg en PNG. */
export default async function AppleIcon() {
  const svg = await readFile(join(process.cwd(), "src/app/icon.svg"), "utf8");
  // iOS ya redondea las esquinas: se quita el redondeo propio.
  const cuadrado = svg.replace('rx="14"', 'rx="0"');
  const src = `data:image/svg+xml;base64,${Buffer.from(cuadrado).toString("base64")}`;
  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={src} width={180} height={180} />,
    size,
  );
}
