import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "간병잇다",
  description: "스마트 간병 교대 및 인수인계 시스템",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "간병잇다",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0d9488",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-[100dvh] bg-mint-50">{children}</body>
    </html>
  );
}
