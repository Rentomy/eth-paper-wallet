import dynamic from "next/dynamic";
import Footer from "@/components/footer";

// Dynamically import client component with no SSR to avoid hydration issues
const WalletGenerator = dynamic(
  () => import("@/components/wallet-generator"),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center px-4 py-12">
        {/* Header */}
        <header className="w-full max-w-2xl mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-accent font-mono uppercase tracking-widest mb-4">
            <EthDiamond />
            Ethereum Paper Wallet
          </div>
          <h1 className="text-3xl font-bold text-foreground text-balance leading-tight mb-3">
            Ethereum Paper Wallet Generator
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
            100% client-side. Nothing is transmitted or stored. Your keys are
            generated and stay entirely within your browser.
          </p>
        </header>

        {/* Card */}
        <div className="w-full max-w-2xl bg-card border border-border rounded-xl p-6 shadow-lg shadow-black/40">
          <WalletGenerator />
        </div>
      </main>

      <Footer />
    </div>
  );
}

function EthDiamond() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <polygon points="12,2 4,12 12,22 20,12" opacity="0.6" />
      <polygon points="12,2 20,12 12,16" opacity="0.9" />
      <polygon points="12,2 4,12 12,16" opacity="0.7" />
      <polygon points="4,12 12,22 12,16" opacity="0.5" />
      <polygon points="20,12 12,22 12,16" opacity="0.4" />
    </svg>
  );
}
