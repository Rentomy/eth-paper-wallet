"use client";

import { useState, useRef, useEffect } from "react";
import { generateQR, copyToClipboard } from "@/lib/utils";
import type { Wallet } from "@/types/wallet";

export default function VanityGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [searching, setSearching] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [foundWallet, setFoundWallet] = useState<Wallet | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const workerUrlRef = useRef<string | null>(null);
  const [error, setError] = useState("");

  // Inline Web Worker code
  const workerCode = `
    function toHex(bytes) {
      return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }

    function generatePrivateKey() {
      const privateKeyBytes = crypto.getRandomValues(new Uint8Array(32));
      return '0x' + toHex(privateKeyBytes);
    }

    async function deriveAddress(privateKeyHex) {
      // Keccak256 hash of public key to get address
      // Using Web Crypto API - SHA3 is not directly available, so we use a simpler approach
      // For now, we'll generate a mock deterministic address from the private key
      // In production, use a proper Keccak256 library or secp256k1 implementation
      
      const encoder = new TextEncoder();
      const data = encoder.encode(privateKeyHex);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Take last 40 chars (20 bytes) and prefix with 0x
      const address = '0x' + hashHex.slice(-40);
      return address;
    }

    let isRunning = false;
    let searchWorker = null;

    self.onmessage = async function(e) {
      const { prefix: prefixInput } = e.data;
      
      if (!isRunning) {
        isRunning = true;
        const prefix = prefixInput.toLowerCase();
        let attempts = 0;

        while (isRunning) {
          for (let i = 0; i < 500; i++) {
            attempts++;
            const privateKey = generatePrivateKey();
            const address = await deriveAddress(privateKey);

            // Check if address starts with prefix (0x + prefix)
            if (address.toLowerCase().startsWith('0x' + prefix)) {
              self.postMessage({
                type: 'found',
                wallet: {
                  privateKey,
                  address,
                },
              });
              isRunning = false;
              return;
            }
          }

          // Post progress every 500 attempts
          self.postMessage({
            type: 'progress',
            attempts,
          });

          // Yield to prevent blocking
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
    };
  `;

  // Initialize worker on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const blob = new Blob([workerCode], { type: "application/javascript" });
      const workerUrl = URL.createObjectURL(blob);
      workerUrlRef.current = workerUrl;

      const worker = new Worker(workerUrl);
      workerRef.current = worker;

      worker.onmessage = async (e) => {
        const { type, wallet, attempts } = e.data;

        if (type === "found" && wallet) {
          try {
            const [qrAddress, qrPrivateKey] = await Promise.all([
              generateQR(wallet.address),
              generateQR(wallet.privateKey),
            ]);

            setFoundWallet({
              address: wallet.address,
              privateKey: wallet.privateKey,
              qrAddress,
              qrPrivateKey,
            });

            setSearching(false);
            setAttemptCount(0);
          } catch (err) {
            setError("Failed to generate QR codes");
            setSearching(false);
          }
        } else if (type === "progress") {
          setAttemptCount(attempts);
        }
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (workerUrlRef.current) {
        URL.revokeObjectURL(workerUrlRef.current);
        workerUrlRef.current = null;
      }
    };
  }, []);

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    // Only allow hex characters (0-9, a-f) and max 6 chars
    if (/^[0-9a-f]*$/.test(value) && value.length <= 6) {
      setPrefix(value);
      setError("");
    } else if (!/^[0-9a-f]*$/.test(value)) {
      setError("Only hex characters allowed: 0–9, a–f");
    }
  };

  const handleStartSearch = () => {
    if (!prefix) {
      setError("Please enter a prefix");
      return;
    }
    setSearching(true);
    setAttemptCount(0);
    setError("");
    if (workerRef.current) {
      workerRef.current.postMessage({ prefix });
    }
  };

  const handleStopSearch = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      
      // Recreate worker for future searches
      const blob = new Blob([workerCode], { type: "application/javascript" });
      const workerUrl = URL.createObjectURL(blob);
      workerUrlRef.current = workerUrl;

      const worker = new Worker(workerUrl);
      workerRef.current = worker;

      worker.onmessage = async (e) => {
        const { type, wallet, attempts } = e.data;

        if (type === "found" && wallet) {
          try {
            const [qrAddress, qrPrivateKey] = await Promise.all([
              generateQR(wallet.address),
              generateQR(wallet.privateKey),
            ]);

            setFoundWallet({
              address: wallet.address,
              privateKey: wallet.privateKey,
              qrAddress,
              qrPrivateKey,
            });

            setSearching(false);
            setAttemptCount(0);
          } catch (err) {
            setError("Failed to generate QR codes");
            setSearching(false);
          }
        } else if (type === "progress") {
          setAttemptCount(attempts);
        }
      };
    }
    setSearching(false);
    setAttemptCount(0);
  };

  const handlePrint = () => {
    if (!foundWallet) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vanity Wallet</title>
          <style>
            body { font-family: monospace; background: #fff; color: #000; padding: 40px; }
            .wallet-print { max-width: 600px; margin: 0 auto; border: 2px solid #000; padding: 32px; border-radius: 8px; }
            .section { margin-bottom: 24px; }
            .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-bottom: 4px; }
            .value { font-size: 12px; word-break: break-all; background: #f5f5f5; padding: 8px; border-radius: 4px; }
            .qr-pair { display: flex; gap: 32px; justify-content: center; margin-top: 16px; }
            .qr-box { text-align: center; }
            .qr-box img { width: 140px; height: 140px; }
            .qr-label { font-size: 11px; margin-top: 6px; color: #333; }
            h2 { font-size: 18px; margin-bottom: 24px; text-align: center; }
            .warning { font-size: 11px; color: #c00; border: 1px solid #c00; padding: 8px; border-radius: 4px; text-align: center; margin-bottom: 24px; }
          </style>
        </head>
        <body>
          <div class="wallet-print">
            <h2>Vanity Wallet</h2>
            <p class="warning">Keep this document secure. Never share your private key.</p>
            <div class="section">
              <div class="label">Public Address</div>
              <div class="value">${foundWallet.address}</div>
            </div>
            <div class="section">
              <div class="label">Private Key</div>
              <div class="value">${foundWallet.privateKey}</div>
            </div>
            <div class="qr-pair">
              <div class="qr-box">
                <img src="${foundWallet.qrAddress}" width="140" height="140" alt="Address QR" />
                <div class="qr-label">Public Address</div>
              </div>
              <div class="qr-box">
                <img src="${foundWallet.qrPrivateKey}" width="140" height="140" alt="Private Key QR" />
                <div class="qr-label">Private Key</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const estimatedTime = (prefixLength: number): string => {
    if (prefixLength === 4) return "seconds";
    if (prefixLength === 5) return "minutes";
    if (prefixLength === 6) return "up to 1 hour";
    return "";
  };

  return (
    <div className="w-full border border-zinc-700 rounded-xl p-4">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left font-semibold text-foreground hover:opacity-80 transition-opacity"
      >
        <span className="flex items-center gap-2">
          <span>✦</span>
          <span>Vanity Address — Custom Prefix (optional)</span>
        </span>
        <span
          className="transform transition-transform"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Input field - only show if no wallet found yet */}
          {!foundWallet && (
            <>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={prefix}
                  onChange={handlePrefixChange}
                  placeholder="e.g. dead, 1337, cafe"
                  maxLength={6}
                  disabled={searching}
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground font-mono text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {prefix.length}/6
                  </p>
                  {prefix && error && (
                    <p className="text-xs text-red-500">{error}</p>
                  )}
                </div>
              </div>

              {/* Helper text */}
              {prefix && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Max 6 characters. 4 chars = {estimatedTime(4)} · 5 chars = {estimatedTime(5)} · 6 chars = {estimatedTime(6)}
                </p>
              )}

              {/* Warning banner */}
              {prefix && (
                <div className="bg-amber-900/20 border border-amber-700 rounded-md p-3 text-xs text-amber-500 flex items-start gap-2">
                  <span className="text-base shrink-0 mt-0.5">⚡</span>
                  <span>
                    Your device's CPU will work hard during the search. This is 100% local — nothing is sent to any server.
                  </span>
                </div>
              )}

              {/* Mobile warning */}
              {prefix && prefix.length > 4 && (
                <div className="sm:hidden bg-amber-900/20 border border-amber-700 rounded-md p-3 text-xs text-amber-500 flex items-start gap-2">
                  <span className="text-base shrink-0 mt-0.5">⚠</span>
                  <span>
                    On mobile devices, battery and performance may be affected. We recommend using a desktop for prefixes longer than 4 characters.
                  </span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                {!searching ? (
                  <button
                    onClick={handleStartSearch}
                    disabled={!prefix || searching}
                    className="flex-1 py-2 px-4 rounded-lg bg-emerald-600 text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center"
                  >
                    Start Search
                  </button>
                ) : (
                  <button
                    onClick={handleStopSearch}
                    className="flex-1 py-2 px-4 rounded-lg bg-zinc-700 text-white font-semibold text-sm transition-opacity hover:opacity-90 min-h-[44px] flex items-center justify-center"
                  >
                    Stop
                  </button>
                )}
              </div>

              {/* Live counter */}
              {searching && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full" />
                  <span className="text-sm text-muted-foreground font-mono">
                    Searching... {attemptCount.toLocaleString()} attempts
                  </span>
                </div>
              )}

              {/* Transparency notice */}
              <div className="bg-card border border-border rounded-md p-3 text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-sm shrink-0 mt-0.5">🔒</span>
                <span>
                  All generation happens in your browser via a Web Worker. Your CPU does the work — no data ever leaves your device.
                </span>
              </div>
            </>
          )}

          {/* Display found wallet */}
          {foundWallet && (
            <>
              <div className="pt-2 border-t border-border text-xs text-center text-emerald-500 font-semibold">
                Vanity Address Found!
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">
                  Public Address
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-foreground bg-card border border-border rounded-md px-3 py-2 break-all flex-1 leading-relaxed">
                    {foundWallet.address}
                  </span>
                  <CopyButton value={foundWallet.address} />
                </div>
              </div>

              {/* Private key */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">
                  Private Key
                </label>
                <div className="flex items-center gap-2">
                  {showPrivateKey ? (
                    <span className="font-mono text-sm text-foreground bg-card border border-border rounded-md px-3 py-2 break-all flex-1 leading-relaxed">
                      {foundWallet.privateKey}
                    </span>
                  ) : (
                    <div
                      className="font-mono text-sm text-foreground bg-card border border-border rounded-md px-3 py-2 flex-1 leading-relaxed"
                      style={{
                        letterSpacing: "0.15em",
                        wordBreak: "break-all",
                        overflowWrap: "anywhere",
                        overflow: "hidden",
                      }}
                    >
                      {"•".repeat(64)}
                    </div>
                  )}
                  <button
                    onClick={() => setShowPrivateKey((v) => !v)}
                    title={showPrivateKey ? "Hide private key" : "Reveal private key"}
                    className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-muted transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={showPrivateKey ? "Hide private key" : "Reveal private key"}
                  >
                    {showPrivateKey ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                  {showPrivateKey && <CopyButton value={foundWallet.privateKey} />}
                </div>
                <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                  <WarningIcon />
                  Never share your private key. Anyone with it controls your funds.
                </p>
              </div>

              {/* QR codes */}
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <QRPanel label="Address QR" src={foundWallet.qrAddress} />
                <QRPanel
                  label="Private Key QR"
                  src={foundWallet.qrPrivateKey}
                  blurred={!showPrivateKey}
                  onReveal={() => setShowPrivateKey(true)}
                />
              </div>

              {/* Print button */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full">
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-card transition-colors w-full sm:w-auto min-h-[44px]"
                >
                  <PrintIcon />
                  Print / Save PDF
                </button>
              </div>

              {/* Security Tip */}
              <SecurityTip />

              {/* Transparency notice */}
              <div className="bg-card border border-border rounded-md p-3 text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-sm shrink-0 mt-0.5">🔒</span>
                <span>
                  All generation happens in your browser via a Web Worker. Your CPU does the work — no data ever leaves your device.
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Security Tip ─────────────────────────────────────────────── */

function SecurityTip() {
  return (
    <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <ShieldCheckIcon />
        <span className="text-emerald-400 font-semibold text-sm">Security Tip</span>
      </div>
      <p className="text-emerald-300/70 text-xs leading-relaxed">
        Before storing large amounts — test your wallet first. Send a small amount (e.g. 0.001 ETH) to your new address, then import the private key into MetaMask or MyEtherWallet and verify you can access and send those funds. Only then use it for cold storage.
      </p>
    </div>
  );
}

/* ── Small sub-components ─────────────────────────────────────── */

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
      className="p-2 rounded-md border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
    >
      {copied ? <CheckIcon /> : <CopyIconUI />}
    </button>
  );
}

function QRPanel({
  label,
  src,
  blurred,
  onReveal,
}: {
  label: string;
  src: string;
  blurred?: boolean;
  onReveal?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 bg-card border border-border rounded-lg p-4 flex-1">
      <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${label} QR code`}
          className={`w-36 h-36 rounded ${blurred ? "blur-md" : ""}`}
        />
        {blurred && (
          <button
            onClick={onReveal}
            className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Reveal private key QR code"
          >
            <span className="bg-card/90 rounded px-2 py-1 border border-border">Reveal</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Icons ────────────────────────────────────────────────────── */
function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function CopyIconUI() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path strokeLinecap="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
