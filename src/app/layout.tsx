import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taliya â Dhikr Companion",
  description:
    "A simple dhikr companion that helps you remember Allah â one tap at a time.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#065F46",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-cream-50 text-emerald-900 antialiased">
        {children}
      </body>
    </html>
  );
}
