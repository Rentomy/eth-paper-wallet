import Footer from "@/components/Footer";
import GuideCard from "@/components/GuideCard";

function GuidesContent({ icon, text }: { icon?: string; text: string }) {
  return <span>{text}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-white text-sm uppercase tracking-wide">{title}</h4>
      {children}
    </div>
  );
}

function BoxBg({ type, children }: { type: "remember" | "why-works" | "extra-security" | "key-principles" | "important"; children: React.ReactNode }) {
  const styles: Record<typeof type, string> = {
    remember: "bg-amber-950/30 border-l-4 border-amber-600",
    "why-works": "bg-emerald-950/30 border-l-4 border-emerald-600",
    "extra-security": "bg-zinc-800/50 border-l-4 border-zinc-600",
    "key-principles": "bg-emerald-950/30 border-l-4 border-emerald-600",
    important: "bg-amber-950/30 border-l-4 border-amber-600",
  };
  
  return (
    <div className={`p-4 rounded text-xs leading-relaxed space-y-2 ${styles[type]}`}>
      {children}
    </div>
  );
}

export default function GuidesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center px-4 py-12">
        {/* Header */}
        <header className="w-full max-w-2xl mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-accent font-mono uppercase tracking-widest mb-4">
            <span>📚</span>
            Security Guides
          </div>
          <h1 className="text-3xl font-bold text-foreground text-balance leading-tight mb-3">
            Security Guides
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty break-words">
            Simple, offline-first methods to secure, time-lock, and pass on your crypto — no apps, no services, no dependencies.
          </p>
        </header>

        {/* Notice */}
        <div className="w-full max-w-2xl mb-10 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-400 leading-relaxed flex items-start gap-2">
            <span className="text-sm shrink-0">🔒</span>
            <span>
              Everything in these guides works independently of emitkey.com. Even if this site no longer exists — your paper wallets and private keys work on Ethereum forever.
            </span>
          </p>
        </div>

        {/* Guides */}
        <div className="w-full max-w-2xl space-y-6">
          {/* Guide 1 - Cold Storage */}
          <GuideCard
            icon="🧊"
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
                  "Click \"Generate Wallet\"",
                  "Write down your private key by hand — or print the wallet",
                  "Verify: use the Verify Wallet tool, enter your private key, confirm the address matches",
                  "Send a small test amount (0.001 ETH), import the key into MetaMask or Trust Wallet, confirm you can access and send funds",
                  "Store your paper wallet in a sealed envelope in a safe, lockbox, or with a notary",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-semibold shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <BoxBg type="remember">
              <strong>Remember:</strong>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>Your private key works on Ethereum forever — independent of any website or app</li>
                <li>Anyone with your private key has full access to your funds</li>
                <li>No private key = no recovery, ever</li>
              </ul>
            </BoxBg>
          </GuideCard>

          {/* Guide 2 - Time-Lock */}
          <GuideCard
            icon="⏳"
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
            icon="🏛"
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
              <div className="bg-zinc-950 border border-zinc-800 rounded p-3 font-mono text-xs text-zinc-300 overflow-auto max-h-64">
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
      </main>

      <Footer />
    </div>
  );
}
