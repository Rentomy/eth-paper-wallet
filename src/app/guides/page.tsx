"use client";

import Footer from "@/components/Footer";
import GuideCard from "@/components/GuideCard";
import { useState } from "react";

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

function GuidesContent({ icon, text }: { icon?: string; text: string }) {
  return <span>{text}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-white text-lg">{title}</h4>
      {children}
    </div>
  );
}

function BoxBg({ type, children }: { type: "remember" | "why-works" | "extra-security" | "key-principles" | "important" | "warning" | "best-practice"; children: React.ReactNode }) {
  const styles: Record<typeof type, string> = {
    remember: "bg-amber-950/30 border border-amber-900/40 text-amber-300",
    "why-works": "bg-emerald-950/30 border border-emerald-900/40 text-emerald-300",
    "extra-security": "bg-zinc-900 border border-zinc-800 text-zinc-300",
    "key-principles": "bg-emerald-950/30 border border-emerald-900/40 text-emerald-300",
    important: "bg-amber-950/30 border border-amber-900/40 text-amber-300",
    warning: "bg-amber-950/30 border border-amber-900/40 text-amber-300",
    "best-practice": "bg-emerald-950/30 border border-emerald-900/40 text-emerald-300",
  };
  
  return (
    <div className={`p-5 sm:p-6 rounded-xl text-xs leading-relaxed space-y-2 ${styles[type]}`}>
      {children}
    </div>
  );
}

function CollapsibleWarning({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors"
      >
        <span>{isOpen ? "▼" : "▶"}</span>
        <span>{title}</span>
      </button>
      {isOpen && (
        <BoxBg type="warning">
          {children}
        </BoxBg>
      )}
    </div>
  );
}

export default function GuidesPage() {
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
        <header className="w-full max-w-2xl mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-accent font-mono uppercase tracking-widest mb-4">
            <BookIcon className="w-4 h-4" />
            Security Guides
          </div>
          <h1 className="text-3xl font-bold text-foreground text-balance leading-tight mb-3">
            Security Guides
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty break-words">
            Simple, offline-first methods to secure, time-lock, and pass on your crypto — no apps, no services, no dependencies.
          </p>
        </header>

        {/* Guides */}
        <div className="w-full max-w-2xl space-y-6 mb-10">
          {/* Guide 1 - Cold Storage */}
          <GuideCard
            icon="01"
            badge="01"
            title="Cold Storage — Store Your Crypto Securely Forever"
            intro="The simplest and most secure form of storage. No app, no device, no company between you and your funds."
          >
            <Section title="What you need">
              <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside">
                <li>A printer (or a pen)</li>
                <li>An envelope</li>
                <li>A safe or secure location</li>
              </ul>
            </Section>

            <Section title="Steps">
              <ol className="space-y-2 text-xs text-zinc-300">
                {[
                  "Open emitkey.com on any device",
                  "Disconnect from the internet (airplane mode)",
                  'Click "Generate Wallet"',
                  "Write down your private key by hand — or print the wallet",
                  "Verify: use the Verify Wallet tool, enter your private key, confirm the address matches",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-semibold shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}

                {/* Step 6 */}
                <li className="flex gap-3">
                  <span className="font-semibold shrink-0">6.</span>
                  <div className="flex-1 space-y-3">
                    <span>Optional: Test your wallet — understand the trade-off first</span>
                    <CollapsibleWarning title="Security trade-off" defaultOpen={true}>
                      <p>Importing your private key into any wallet app — even MetaMask or Trust Wallet — means your key has been on an internet-connected device. This reduces the air-gap security of your paper wallet.</p>
                      <p>For maximum security: skip this step and rely on the Verify Wallet tool (Step 5) instead.</p>
                    </CollapsibleWarning>
                    <div className="space-y-2 pl-3 border-l border-zinc-700">
                      <p className="font-semibold text-zinc-200">If you still want to do a live test:</p>
                      <ol className="space-y-1 list-decimal list-inside">
                        <li>Send a small amount (e.g. 0.001 ETH) to your new address</li>
                        <li>Import your private key into MetaMask or Trust Wallet</li>
                        <li>Confirm you can see the balance and send funds back out</li>
                        <li>
                          Immediately after testing:
                          <ul className="space-y-1 mt-1 ml-4 list-disc list-inside">
                            <li>Remove the wallet from MetaMask: Settings → Advanced → Remove Account</li>
                            <li>Clear your clipboard if you copied the key</li>
                            <li>{"Consider this wallet \"touched\" — it has been on a hot device"}</li>
                          </ul>
                        </li>
                        <li>Generate a fresh paper wallet on emitkey.com (offline) for your actual cold storage</li>
                      </ol>
                    </div>
                    <BoxBg type="best-practice">
                      <p className="font-semibold text-emerald-300">The safest approach</p>
                      <p>Use the Verify Wallet tool on emitkey.com (Step 5) to confirm your key is valid — without connecting to the internet or importing into any app.</p>
                      <p>Then send a small amount and monitor the balance on etherscan.io. Only move larger amounts once you are confident everything works.</p>
                    </BoxBg>
                  </div>
                </li>

                {/* Step 7 */}
                <li className="flex gap-3">
                  <span className="font-semibold shrink-0">7.</span>
                  <span>Store your paper wallet in a sealed envelope in a safe, lockbox, or with a notary</span>
                </li>
              </ol>
            </Section>

            <BoxBg type="remember">
              <strong>Remember:</strong>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>Your private key works on Ethereum forever — independent of any website or app</li>
                <li>Anyone with your private key has full access to your funds</li>
                <li>No private key = no recovery, ever</li>
                <li>If you import your private key into any app for testing — generate a fresh wallet afterward for actual cold storage. A "touched" key should never be used as your final cold storage wallet.</li>
              </ul>
            </BoxBg>
          </GuideCard>

          {/* Guide 2 - Time-Lock */}
          <GuideCard
            icon="02"
            badge="02"
            title="Time-Lock — Lock Funds Until a Future Date"
            intro="No smart contract needed. A sealed envelope and a trusted person is equally secure — and far simpler."
          >
            <Section title="What you need">
              <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside">
                <li>A paper wallet (generated on emitkey.com)</li>
                <li>A sealed envelope</li>
                <li>A notary, lawyer, or trusted person</li>
              </ul>
            </Section>

            <Section title="Steps">
              <ol className="space-y-2 text-xs text-zinc-300">
                {[
                  "Open emitkey.com and disconnect from the internet",
                  "Generate a new wallet — this is your time-locked wallet",
                  "Print or write down the full wallet (address + private key)",
                  "Write on the envelope: \"Do not open before: [DATE]\"",
                  "Seal the envelope and hand it to a notary or trusted person",
                  "Transfer your crypto to the public address on the paper wallet",
                  "The funds are now inaccessible until the envelope is opened",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-semibold shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <BoxBg type="why-works">
              <strong>Why this works:</strong>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>The private key is the only thing needed to access the funds</li>
                <li>No website, app, or service is involved after step 6</li>
                <li>Even if emitkey.com no longer exists — the wallet works forever on Ethereum</li>
                <li>Monitor your balance anytime at etherscan.io without exposing the private key</li>
              </ul>
            </BoxBg>

            <BoxBg type="extra-security">
              <strong>Optional extra security:</strong>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>Give the notary only the sealed envelope — not the public address</li>
                <li>Store the public address separately to monitor the balance at etherscan.io without ever exposing the private key</li>
              </ul>
            </BoxBg>
          </GuideCard>

          {/* Guide 3 - Inheritance */}
          <GuideCard
            icon="03"
            badge="03"
            title="Inheritance Wallet — Pass On Your Crypto Securely"
            intro="Most crypto is lost forever after the owner's death — not from hacking, but because no one knew how to access it. This guide solves that with nothing more than paper."
          >
            <Section title="What you need">
              <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside">
                <li>A paper wallet generated on emitkey.com (offline)</li>
                <li>Two sealed envelopes</li>
                <li>A notary or lawyer</li>
                <li>A short handwritten instruction letter for your heir</li>
              </ul>
            </Section>

            <Section title="Steps">
              <ol className="space-y-2 text-xs text-zinc-300">
                {[
                  "Open emitkey.com and disconnect from the internet",
                  "Generate a new wallet — this is your inheritance wallet",
                  "Print or write down the full wallet — make two copies:",
                  "  Copy A → sealed envelope → notary or lawyer",
                  "           Label: \"Open only after my death — Ethereum Inheritance Wallet\"",
                  "  Copy B → store in your own safe as backup",
                  "Write a simple instruction letter for your heir (template below)",
                  "Transfer your crypto to the public address of the inheritance wallet",
                  "Inform your notary that this envelope exists and what it contains",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-semibold shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="Instruction letter template">
              <div className="bg-zinc-950 border border-zinc-800 rounded p-3 font-mono text-xs text-zinc-300">
                <pre className="whitespace-pre-wrap break-words">{`Dear [Name],

This envelope contains access to an Ethereum wallet.
To access the funds:

1. Go to MetaMask (metamask.io) or Trust Wallet
2. Select "Import wallet" → "Private Key"
3. Enter the private key from this envelope
4. Your funds will be immediately accessible

Wallet address: 0x...
Verify balance: etherscan.io/address/0x...

No website, app, or company is needed —
the private key is the only thing required.`}</pre>
              </div>
            </Section>

            <BoxBg type="key-principles">
              <strong>Key principles:</strong>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>Your heir does not need a wallet today — they can create one when needed</li>
                <li>The funds exist on Ethereum forever — no expiry, no fees, no maintenance</li>
                <li>Even if every crypto app shuts down — the private key still works</li>
              </ul>
            </BoxBg>

            <BoxBg type="important">
              <strong>Important:</strong>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>Never store the private key digitally — no photo, no scan, no cloud</li>
                <li>Tell at least one trusted person the envelope exists and where to find it</li>
                <li>Check the balance periodically at etherscan.io to confirm funds are intact</li>
              </ul>
            </BoxBg>
          </GuideCard>
        </div>

        {/* Security statement */}
        <div className="w-full max-w-2xl mb-10 flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <ShieldCheckIcon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-300 leading-relaxed">
            All wallet generation happens locally in your browser. Your private key never leaves your device.
          </p>
        </div>


      </main>

      <Footer />
    </div>
  );
}
