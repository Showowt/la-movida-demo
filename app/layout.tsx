import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Movida - WhatsApp AI Demo | MachineMind",
  description: "Ventas, reactivación y reportes automáticos 24/7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
