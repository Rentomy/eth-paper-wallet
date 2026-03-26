import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
  metadataBase: new URL("https://emitkey.com"),
  title: "ETH Paper Wallet Generator — emitkey.com",
  description: "Generate a secure Ethereum paper wallet 100% in your browser. Open source, auditable, no server.",
  keywords: [
    "ethereum paper wallet",
    "ETH paper wallet generator",
    "ethereum wallet offline",
    "cold storage ethereum",
    "crypto paper wallet",
    "ethereum private key generator"
  ],
  authors: [{ name: "emitkey", url: "https://emitkey.com" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "ETH Paper Wallet Generator — emitkey.com",
    description: "Generate a secure Ethereum paper wallet 100% in your browser. Open source, auditable, no server.",
    url: "https://emitkey.com",
    siteName: "emitkey",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ETH Paper Wallet Generator — emitkey.com",
    description: "Generate a secure Ethereum paper wallet 100% in your browser. Open source, auditable, no server.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://emitkey.com",
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
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(() => console.log('SW registered'))
                  .catch(() => console.log('SW registration failed'));
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
