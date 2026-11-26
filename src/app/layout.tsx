import type { Metadata } from "next";
import { Bebas_Neue, Cormorant_Garamond, Open_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});


const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Celeste Platini Pastelería — Cursos online de pastelería",
    template: "%s | Celeste Platini Pastelería",
  },
  description:
    "Cursos online de pastelería con Celeste Platini, desde San Francisco, Córdoba. Pagás con Mercado Pago y accedés al instante.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Celeste Platini Pastelería",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${openSans.variable} ${bebas.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
