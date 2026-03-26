"use client";

import Footer from "@/components/Footer";
import { useState } from "react";

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function CodeBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 font-mono text-sm text-emerald-400 text-center overflow-x-auto">
      {children}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
      <p className="text-xs text-zinc-400 mb-2">{label}</p>
      <p className="font-mono text-xs text-emerald-400 font-semibold">{value}</p>
    </div>
  );
}

function ComparisonCard({ 
  title, 
  items, 
  highlight 
}: { 
  title: string; 
  items: string[]; 
  highlight: "left" | "right" 
}) {
  return (
    <div
      className={`bg-zinc-900 border rounded-xl p-4 ${
        highlight === "left" ? "border-emerald-600" : "border-red-600"
      }`}
    >
      <p className="text-xs font-semibold text-white mb-3 uppercase tracking-wide">
        {title}
      </p>
      <ul className="space-y-2 text-xs">
        {items.map((item, i) => (
          <li key={i} className={highlight === "left" ? "text-emerald-400" : "text-red-400"}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && (
          <p className="text-xs text-zinc-500 mt-2">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function BoxBg({ type, children }: { type: "success" | "warning" | "info"; children: React.ReactNode }) {
  const styles: Record<typeof type, string> = {
    success: "bg-emerald-950/30 border border-emerald-900/40 text-emerald-300",
    warning: "bg-amber-950/30 border border-amber-900/40 text-amber-300",
    info: "bg-zinc-900 border border-zinc-800 text-zinc-300",
  };

  return (
    <div className={`p-5 sm:p-6 rounded-xl text-xs leading-relaxed space-y-2 ${styles[type]}`}>
      {children}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center px-4 py-12">
        {/* Back link */}
        <div className="w-full max-w-2xl mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors min-h-[44px]"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </a>
        </div>

        {/* Header */}
        <header className="w-full max-w-2xl mb-12 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-mono uppercase tracking-widest mb-4">
            <BookIcon className="w-4 h-4" />
            How It Works
          </div>
          <h1 className="text-3xl font-bold text-foreground text-balance leading-tight mb-3">
            How It Works
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty break-words">
            The mathematics behind Ethereum wallets — explained simply and honestly.
          </p>
        </header>

        {/* Content */}
        <div className="w-full max-w-2xl space-y-12 mb-10">
          {/* Section 1 - The Big Picture */}
          <Section
            title="A wallet is just a number"
            subtitle="The Big Picture"
          >
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              <p>
                An Ethereum wallet is not an account at a company. It is not stored on any server.
                It does not require registration.
              </p>
              <p>A wallet is simply a pair of two mathematically linked numbers:</p>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="space-y-1">
                <p className="font-semibold text-white">Private Key</p>
                <p className="text-zinc-400">→ a random 256-bit number. This is your password.</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white">Public Address</p>
                <p className="text-zinc-400">→ derived from the private key. This is your account number.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-400">That's it. No database, no company, no login.</p>

            <CodeBox>
              <div className="space-y-2 text-left">
                <div>Random 256-bit number</div>
                <div>↓</div>
                <div>secp256k1 curve</div>
                <div className="text-zinc-500 text-xs">(fixed international standard)</div>
                <div>↓</div>
                <div>Public Key</div>
                <div>↓</div>
                <div>keccak256 hash</div>
                <div>↓</div>
                <div>Ethereum Address (0x...)</div>
              </div>
            </CodeBox>
          </Section>

          {/* Section 2 - The Fixed Multiplier */}
          <Section
            title="The algorithm is public — and that's a feature, not a bug"
            subtitle="The Fixed Multiplier"
          >
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              <p>
                The conversion from private key to address uses a fixed mathematical constant called
                the Generator Point (G) of the secp256k1 curve — the same standard used by Bitcoin and
                Ethereum worldwide.
              </p>
              <p>Your address is calculated as:</p>
            </div>

            <CodeBox>
              <div>Address = Private Key × G</div>
            </CodeBox>

            <p className="text-sm text-zinc-300 leading-relaxed">
              This multiplication is intentionally easy in one direction and mathematically impossible
              to reverse:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ComparisonCard
                title="Private Key → Address"
                items={[
                  "✅ Milliseconds",
                  "✅ Any device",
                  "✅ Done by emitkey.com in your browser",
                ]}
                highlight="left"
              />
              <ComparisonCard
                title="Address → Private Key"
                items={[
                  "❌ Longer than the age of the universe",
                  "❌ All computers on Earth combined cannot do this",
                  "❌ Mathematically impossible (2²⁵⁶ possibilities)",
                ]}
                highlight="right"
              />
            </div>

            <BoxBg type="info">
              <p className="font-semibold mb-2">Trapdoor Function</p>
              <p>
                This is called a Trapdoor Function — easy one way, impossible the other. The algorithm
                is fully public and auditable by anyone. Its security comes from mathematics, not secrecy.
              </p>
            </BoxBg>
          </Section>

          {/* Section 3 - Why Brute Force is Impossible */}
          <Section
            title="Why brute force is impossible"
            subtitle="How Many Possible Keys Exist"
          >
            <p className="text-sm text-zinc-300 leading-relaxed">
              The total number of possible Ethereum private keys is 2²⁵⁶:
            </p>

            <CodeBox>
              <div className="text-emerald-400 break-all">
                115,792,089,237,316,195,423,570,985,008,687,907,853,269,984,665,640,564,039,457,584,007,913,129,639,936
              </div>
            </CodeBox>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard label="Atoms in the observable universe" value="~10⁸⁰" />
              <MetricCard label="Possible Ethereum private keys" value="~10⁷⁷" />
              <MetricCard label="Seconds since the Big Bang" value="~4 × 10¹⁷" />
            </div>

            <BoxBg type="success">
              <p>
                Even if every atom in the universe were a computer running since the Big Bang — it would
                not find your private key.
              </p>
            </BoxBg>
          </Section>

          {/* Section 4 - Quantum Computers */}
          <Section
            title="What about quantum computers?"
            subtitle="Future Threats"
          >
            <p className="text-sm text-zinc-300 leading-relaxed">
              Quantum computers are the only theoretical future threat to elliptic curve cryptography. Here
              is the honest picture:
            </p>

            <div className="space-y-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-300 font-mono">
              <div className="space-y-1">
                <p className="text-zinc-400">To crack a key today requires:</p>
                <p className="text-emerald-400">2²⁵⁶ operations</p>
              </div>
              <div className="border-t border-zinc-700 my-3"></div>
              <div className="space-y-1">
                <p className="text-zinc-400">A quantum computer would need:</p>
                <p className="text-emerald-400">~2¹²⁸ operations (Grover's algorithm)</p>
              </div>
              <div className="border-t border-zinc-700 my-3"></div>
              <div className="space-y-1">
                <p className="text-zinc-400">Current quantum computers:</p>
                <p className="text-amber-400">~1,000 qubits (unstable)</p>
              </div>
              <div className="border-t border-zinc-700 my-3"></div>
              <div className="space-y-1">
                <p className="text-zinc-400">Required to threaten Ethereum:</p>
                <p className="text-amber-400">~4,000,000 stable qubits</p>
              </div>
            </div>

            <BoxBg type="success">
              <p className="font-semibold mb-2">✅ Honest Conclusion</p>
              <p className="mb-2">
                No existing or near-future quantum computer is anywhere close to threatening Ethereum
                private keys.
              </p>
              <p>
                The Ethereum community actively monitors this and plans a long-term migration to
                quantum-resistant algorithms.
              </p>
            </BoxBg>
          </Section>

          {/* Section 5 - Real Risks */}
          <Section
            title="The algorithm is not the weak point — humans are"
            subtitle="The Real Risks"
          >
            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
              The mathematics are unbreakable. The risks are entirely human:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wide">
                  ❌ NOT a real risk
                </p>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li>Cracking the algorithm</li>
                  <li>Brute force attacks</li>
                  <li>Quantum computers (today)</li>
                </ul>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-xs font-semibold text-emerald-400 mb-3 uppercase tracking-wide">
                  ✅ REAL risks
                </p>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li>Photo of your private key</li>
                  <li>Screenshot saved to cloud</li>
                  <li>Malware or keylogger</li>
                  <li>Someone finds your paper</li>
                  <li>Social engineering</li>
                  <li>Weak random number generator</li>
                </ul>
              </div>
            </div>

            <BoxBg type="success">
              <p className="font-semibold mb-3">This is why emitkey.com recommends:</p>
              <ul className="space-y-2 text-xs">
                <li>• Generating wallets offline (airplane mode)</li>
                <li>• Writing the private key by hand — never photographing it</li>
                <li>• Using the Verify Wallet tool instead of importing into apps</li>
                <li>• Storing paper wallets in a physically secure location</li>
              </ul>
              <p className="mt-3 pt-3 border-t border-emerald-800">
                The math protects you from hackers. Your habits protect you from everything else.
              </p>
            </BoxBg>
          </Section>

          {/* Section 6 - Independence */}
          <Section
            title="Your wallet works forever — with or without us"
            subtitle="emitkey.com is Independent"
          >
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              <p>
                emitkey.com uses ethers.js — an open-source library that implements the secp256k1 and
                keccak256 standards. These standards are part of the Ethereum protocol itself and will
                work as long as Ethereum exists.
              </p>
              <p>
                Your paper wallet is completely independent of emitkey.com. If this website shuts down
                tomorrow, your private key still works in any Ethereum-compatible wallet — forever.
              </p>
            </div>

            <BoxBg type="success">
              <p className="font-semibold mb-2">🔒 The private key is the wallet.</p>
              <ul className="space-y-1 text-xs">
                <li>Not the website. Not the app. Not the company.</li>
                <li>Just the number on your paper.</li>
              </ul>
            </BoxBg>
          </Section>

          {/* Section 7 - One wallet. Every EVM network. */}
          <Section
            title="One wallet. Every EVM network."
            subtitle=""
          >
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              <p>
                A wallet generated on emitkey.com works on every EVM-compatible network — automatically,
                with no extra steps.
              </p>
              <p>Same private key. Same address. Every time.</p>
            </div>

            {/* Network Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { name: "Ethereum", ticker: "ETH", color: "text-blue-400" },
                { name: "Polygon", ticker: "MATIC", color: "text-purple-400" },
                { name: "BNB Chain", ticker: "BNB", color: "text-amber-400" },
                { name: "Arbitrum", ticker: "ARB", color: "text-blue-300" },
                { name: "Optimism", ticker: "OP", color: "text-red-400" },
                { name: "Avalanche", ticker: "AVAX", color: "text-red-500" },
                { name: "Base", ticker: "BASE", color: "text-blue-500" },
                { name: "zkSync", ticker: "ZK", color: "text-emerald-400" },
                { name: "Fantom", ticker: "FTM", color: "text-blue-400" },
              ].map((network) => (
                <div
                  key={network.name}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 relative"
                >
                  <p className="text-sm font-semibold text-white">{network.name}</p>
                  <p className={`text-xs font-mono ${network.color}`}>{network.ticker}</p>
                  <div className="absolute top-2 right-2 text-xs">{'✅'}</div>
                </div>
              ))}
            </div>

            {/* Emerald highlight box */}
            <BoxBg type="success">
              <p className="font-semibold">Your private key is the same on all these networks.</p>
              <p className="font-semibold">Your address is the same on all these networks.</p>
              <p>Generate once on emitkey.com — use everywhere.</p>
            </BoxBg>

            {/* Amber warning box */}
            <BoxBg type="warning">
              <p className="font-semibold">Important: each network has its own tokens and transactions.</p>
              <p>
                Sending ETH to your address on Arbitrum is not the same as sending ETH on Ethereum mainnet.
                Always verify which network you are using in your wallet app before sending funds.
              </p>
            </BoxBg>

            {/* Explainer box */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-400 space-y-2">
              <p className="font-semibold text-white mb-3">Why does this work?</p>
              <p>All EVM networks use the same cryptographic standard:</p>
              <p className="text-emerald-400">secp256k1 + keccak256</p>
              <p className="mt-3">Ethereum invented it.</p>
              <p>Every EVM chain adopted it.</p>
              <p>Your private key works on all of them.</p>
            </div>
          </Section>

        {/* CTA Button */}
        <div className="w-full max-w-2xl mb-10 flex flex-col sm:flex-row justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-base rounded-xl transition-colors duration-150 min-h-[52px] w-full"
          >
            → Generate your wallet on emitkey.com
          </a>
        </div>

        {/* Security statement */}
        <div className="w-full max-w-2xl mb-10 flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <ShieldCheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-300 leading-relaxed">
            All wallet generation happens locally in your browser. Your private key never leaves your
            device.
          </p>
        </div>


      </main>

      <Footer />
    </div>
  );
}
