import type { Metadata, Viewport } from "next";
import "./globals.css";

const URL_SITIO = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITIO),
  title: { default: "Circe Witch · Tarot, rituales y energías", template: "%s · Circe Witch" },
  description: "Rituales de amor, abundancia, limpieza y protección con Circe. Elige tu trabajo, cuéntale tu caso y recibe atención directa por WhatsApp.",
  openGraph: { type: "website", locale: "es_CO", siteName: "Circe Witch" },
};

export const viewport: Viewport = { themeColor: "#0C0B0A", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
