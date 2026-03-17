import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://emitkey.app"),
  title: "ETH Paper Wallet Generator — emitkey.app",
  description: "Generate a secure Ethereum paper wallet 100% in your browser. No server, no tracking, no data transmission. Your private key never leaves your device.",
  keywords: [
    "ethereum paper wallet",
    "ETH paper wallet generator",
    "ethereum wallet offline",
    "cold storage ethereum",
    "crypto paper wallet",
    "ethereum private key generator",
    "offline eth wallet",
    "secure ethereum wallet"
  ],
  authors: [{ name: "emitkey", url: "https://emitkey.app" }],
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "ETH Paper Wallet Generator — emitkey.app",
    description: "Generate a secure Ethereum paper wallet entirely in your browser. Open source, auditable, no server.",
    url: "https://emitkey.app",
    siteName: "emitkey",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ETH Paper Wallet Generator — emitkey.app",
    description: "100% client-side ETH paper wallet generator. No server, no tracking. Open source.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://emitkey.app",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="font-sans antialiased">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
