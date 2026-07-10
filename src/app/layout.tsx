import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SAKTI - Sistem Pendaftaran Anggota Koperasi Desa Merah Putih",
  description: "Sistem Administrasi Koperasi Terintegrasi dengan RFID",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-background">{children}</body>
    </html>
  );
}
