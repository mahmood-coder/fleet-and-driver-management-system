import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مسار - إدارة وتتبع حركة النقل والمركبات الذكية",
  description: "نظام إدارة حركة المركبات وتتبع السائقين الذكي - للاندرويد وايفون بالكامل باللغة العربية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
