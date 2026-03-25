"use client";

import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { ethers } from "ethers";
import { generateQR, copyToClipboard } from "@/lib/utils";
import BatchGenerator, { type BatchGeneratorHandle } from "./BatchGenerator";
import type { Wallet } from "@/types/wallet";

// Worker code defined outside component to prevent recreation on each render
// Worker sends batches of 100 keys every 50ms without checking prefix
// Main thread checks each key and derives address only on match
const WORKER_CODE = `
  self.onmessage = function(e) {
    const prefix = e.data.prefix.toLowerCase();
    let attempts = 0;
    let running = true;

    self.onmessage = function() { running = false; };

    function batch() {
      if (!running) return;
      const keys = [];
      for (let i = 0; i < 100; i++) {
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        keys.push('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join(''));
        attempts++;
      }
      self.postMessage({ type: 'batch', keys, attempts });
      setTimeout(batch, 50);
    }
    batch();
  };
`;

export interface VanityGeneratorHandle {
  reset: () => void;
}

const VanityGenerator = forwardRef<VanityGeneratorHandle>(function VanityGenerator(_props, ref) {
  // Generate New Wallet state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWallet, setGeneratedWallet] = useState<Wallet | null>(null);

  // Vanity Address state
  const [vanityOpen, setVanityOpen] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [searching, setSearching] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [vanityWallet, setVanityWallet] = useState<Wallet | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const workerUrlRef = useRef<string | null>(null);
  const prefixRef = useRef(prefix);
  const searchingRef = useRef(searching);
  const [error, setError] = useState("");

  // Verify Wallet state
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyPrivateKey, setVerifyPrivateKey] = useState("");
  const [showVerifyKey, setShowVerifyKey] = useState(false);
  const [verifiedAddress, setVerifiedAddress] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Batch Generator ref
  const batchRef = useRef<BatchGeneratorHandle>(null);

  // Keep refs in sync with state
  useEffect(() => {
    prefixRef.current = prefix;
  }, [prefix]);

  useEffect(() => {
    searchingRef.current = searching;
  }, [searching]);

  // Create worker message handler
  const createWorkerMessageHandler = useCallback(() => {
    return async (e: MessageEvent) => {
      if (e.data.type === 'batch') {
        setAttemptCount(e.data.attempts);
        const currentPrefix = prefixRef.current;
        if (!currentPrefix) return;
        for (const privateKey of e.data.keys) {
          const w = new ethers.Wallet(privateKey);
          if (w.address.toLowerCase().startsWith('0x' + currentPrefix.toLowerCase())) {
            if (workerRef.current) {
              workerRef.current.terminate();
            }
            try {
              const qrAddress = await generateQR(w.address);
              const qrPrivateKey = await generateQR(w.privateKey);
              setVanityWallet({ address: w.address, privateKey: w.privateKey, qrAddress, qrPrivateKey });
              setSearching(false);
              setAttemptCount(0);
            } catch {
              setError("Failed to generate QR codes");
              setSearching(false);
            }
            return;
          }
        }
      }
    };
  }, []);

  // Create a new worker instance
  const createWorker = useCallback(() => {
    // Revoke old blob URL if it exists to prevent memory leak
    if (workerUrlRef.current) {
      URL.revokeObjectURL(workerUrlRef.current);
    }
    const blob = new Blob([WORKER_CODE], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    workerUrlRef.current = workerUrl;
    const worker = new Worker(workerUrl);
    workerRef.current = worker;
    worker.onmessage = createWorkerMessageHandler();
    return worker;
  }, [createWorkerMessageHandler]);

  useImperativeHandle(ref, () => ({
    reset() {
      // Stop any running worker
      if (searchingRef.current && workerRef.current) {
        workerRef.current.terminate();
        createWorker();
      }
      setGeneratedWallet(null);
      setVanityWallet(null);
      setSearching(false);
      setAttemptCount(0);
      setPrefix("");
      prefixRef.current = "";
      setError("");
      setShowPrivateKey(false);
      setVanityOpen(false);
      setVerifyPrivateKey("");
      setVerifiedAddress(null);
      setVerifyError(null);
      setShowVerifyKey(false);
      setVerifyOpen(false);
      // Also reset Batch Generator
      batchRef.current?.reset();
    },
  }), [createWorker]);

  // Initialize worker on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      createWorker();
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
  }, [createWorker]);

  // Generate random wallet
  const handleGenerateWallet = async () => {
    setIsGenerating(true);
    try {
      const wallet = ethers.Wallet.createRandom();
      const qrAddress = await generateQR(wallet.address);
      const qrPrivateKey = await generateQR(wallet.privateKey);
      setGeneratedWallet({
        address: wallet.address,
        privateKey: wallet.privateKey,
        qrAddress,
        qrPrivateKey,
      });
    } catch {
      setError("Failed to generate wallet");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (value.length <= 6) {
      setPrefix(value);
      setError("");
    }
  };

  // Compute invalid characters for validation indicator
  const invalidChars = prefix.split('').filter(c => !/^[0-9a-f]$/.test(c));
  const uniqueInvalidChars = invalidChars.filter((c, i, arr) => arr.indexOf(c) === i);
  const hasInvalidChars = uniqueInvalidChars.length > 0;
  const isValidHex = prefix.length > 0 && !hasInvalidChars;

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
      createWorker();
    }
    setSearching(false);
    setAttemptCount(0);
  };

  const handlePrint = (wallet: Wallet) => {
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
            <p class="warning">Keep this document secure. Never share or digitally store your private key.</p>
            <div class="section">
              <div class="label">Public Address</div>
              <div class="value">${wallet.address}</div>
            </div>
            <div class="section">
              <div class="label">Private Key</div>
              <div class="value">${wallet.privateKey}</div>
            </div>
            <div class="qr-pair">
              <div class="qr-box">
                <img src="${wallet.qrAddress}" width="140" height="140" alt="Address QR" />
                <div class="qr-label">Public Address</div>
              </div>
              <div class="qr-box">
                <img src="${wallet.qrPrivateKey}" width="140" height="140" alt="Private Key QR" />
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

  const handleVerifyWallet = () => {
    try {
      const w = new ethers.Wallet(verifyPrivateKey.trim());
      setVerifiedAddress(w.address);
      setVerifyError(null);
    } catch {
      setVerifiedAddress(null);
      setVerifyError("Invalid private key — check for typos or missing characters.");
    }
  };

  const handleClearVerify = () => {
    setVerifyPrivateKey("");
    setVerifiedAddress(null);
    setVerifyError(null);
    setShowVerifyKey(false);
  };

  const handleNewSession = () => {
    setGeneratedWallet(null);
    setVanityWallet(null);
    setSearching(false);
    setAttemptCount(0);
    setPrefix("");
    prefixRef.current = "";
    setError("");
    setShowPrivateKey(false);
    setVanityOpen(false);
    setVerifyPrivateKey("");
    setVerifiedAddress(null);
    setVerifyError(null);
    setShowVerifyKey(false);
    setVerifyOpen(false);
    if (workerRef.current) {
      workerRef.current.terminate();
      createWorker();
    }
  };

  return (
    <div className="w-full space-y-4" data-vanity>
      {/* Generate New Wallet Button */}
      <button
        onClick={handleGenerateWallet}
        disabled={isGenerating}
        className="w-full py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
      >
        {isGenerating ? "Generating..." : "Generate New Wallet"}
      </button>

      {/* Batch Generator Accordion */}
      <BatchGenerator ref={batchRef} />

      {/* Vanity Address Accordion */}
      <div className="border border-zinc-700 rounded-xl overflow-hidden">
        <button
          onClick={() => setVanityOpen(!vanityOpen)}
          className="w-full flex items-center justify-between py-3 px-6 bg-zinc-900 hover:bg-zinc-800 transition-colors text-left font-semibold text-base text-white min-h-[52px]"
        >
          <span className="flex items-center gap-2">
            <span>✦</span>
            <span>Vanity Address (optional)</span>
          </span>
          <span
            className="transform transition-transform"
            style={{ transform: vanityOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            ▼
          </span>
        </button>

        {vanityOpen && (
          <div className="p-6 space-y-4 bg-background border-t border-zinc-700">
            {!vanityWallet && (
              <>
                <input
                  type="text"
                  value={prefix}
                  onChange={handlePrefixChange}
                  placeholder="e.g. dead, 1337, cafe"
                  maxLength={6}
                  disabled={searching}
                  aria-label="Vanity address prefix"
                  className={`w-full px-3 py-2 bg-card border rounded-md text-foreground font-mono text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 ${hasInvalidChars ? 'border-red-800/60' : 'border-border'}`}
                />

                {/* Validation indicator */}
                {prefix && (
                  <div className="flex items-center gap-2">
                    {isValidHex ? (
                      <p className="text-xs text-emerald-400">Valid hex prefix — ready to search</p>
                    ) : (
                      <p className="text-xs text-red-400">
                        &quot;{uniqueInvalidChars.map(c => `${c}`).join('", "')}&quot; will never match — Ethereum addresses only contain 0–9 and a–f
                      </p>
                    )}
                  </div>
                )}

                {/* Static helper text */}
                <p className="text-xs text-zinc-600 font-mono tracking-wider">
                  Ethereum addresses only contain: 0 1 2 3 4 5 6 7 8 9 a b c d e f
                </p>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{prefix.length}/6</p>
                  {prefix && error && <p className="text-xs text-red-500">{error}</p>}
                </div>

                {prefix && (
                  <>
                    <div className="bg-amber-900/20 border border-amber-700 rounded-md p-3 text-xs text-amber-500 flex items-start gap-2">
                      <span className="text-base shrink-0 mt-0.5">⚡</span>
                      <span>
                        Your device's CPU will work hard during the search. Battery and performance may be affected.
                      </span>
                    </div>

                    {prefix.length > 4 && (
                      <div className="sm:hidden bg-amber-900/20 border border-amber-700 rounded-md p-3 text-xs text-amber-500 flex items-start gap-2">
                        <span className="text-base shrink-0 mt-0.5">⚠</span>
                        <span>
                          We recommend using a desktop for prefixes longer than 4 characters.
                        </span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-4 pt-2">
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

                {searching && (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <div className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full" />
                    <span className="text-sm text-muted-foreground font-mono">
                      Searching... {attemptCount.toLocaleString()} attempts
                    </span>
                  </div>
                )}


              </>
            )}

            {vanityWallet && (
              <>
                <div className="pt-2 border-t border-border text-xs text-center text-emerald-500 font-semibold">
                  Vanity Address Found!
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-widest">
                    Public Address
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-foreground bg-card border border-border rounded-md px-3 py-2 break-all flex-1 leading-relaxed">
                      {vanityWallet.address}
                    </span>
                    <CopyButton value={vanityWallet.address} label="Copy address" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground uppercase tracking-widest">
                    Private Key
                  </label>
                  <div className="flex items-center gap-2">
                    {showPrivateKey ? (
                      <span className="font-mono text-sm text-foreground bg-card border border-border rounded-md px-3 py-2 break-all flex-1 leading-relaxed">
                        {vanityWallet.privateKey}
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
                      aria-label={showPrivateKey ? "Hide private key" : "Show private key"}
                    >
                      {showPrivateKey ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                    {showPrivateKey && <CopyButton value={vanityWallet.privateKey} label="Copy private key" />}
                  </div>
                  <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                    <WarningIcon />
                    Never share your private key. Anyone with it controls your funds.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <QRPanel label="Address QR" src={vanityWallet.qrAddress} />
                  <QRPanel
                    label="Private Key QR"
                    src={vanityWallet.qrPrivateKey}
                    blurred={!showPrivateKey}
                    onReveal={() => setShowPrivateKey(true)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full">
                  <button
                    onClick={() => handlePrint(vanityWallet)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-card transition-colors w-full sm:w-auto min-h-[44px]"
                  >
                    <PrintIcon />
                    Print / Save PDF
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. Verify Wallet Accordion */}
      <div className="border border-zinc-700 rounded-xl overflow-hidden">
        <button
          onClick={() => setVerifyOpen(!verifyOpen)}
          className="w-full flex items-center justify-between py-3 px-6 bg-zinc-900 hover:bg-zinc-800 transition-colors text-left font-semibold text-base text-white min-h-[52px]"
        >
          <span className="flex items-center gap-2">
            <span>🔍</span>
            <span>Verify Wallet</span>
          </span>
          <span
            className="transform transition-transform"
            style={{ transform: verifyOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            ▼
          </span>
        </button>

        {verifyOpen && (
          <div className="p-6 space-y-4 bg-background border-t border-zinc-700">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enter the private key you just generated below to verify that it matches your public address.
            </p>

            <div className="bg-amber-900/20 border border-amber-700 rounded-md p-3 text-xs text-amber-500 flex items-start gap-2">
              <span className="text-base shrink-0 mt-0.5">⚠</span>
              <span>
                Never enter a private key that holds significant funds into any website — including this one. This tool is intended for freshly generated wallets only.
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type={showVerifyKey ? "text" : "password"}
                  value={verifyPrivateKey}
                  onChange={(e) => {
                    setVerifyPrivateKey(e.target.value);
                    setVerifiedAddress(null);
                    setVerifyError(null);
                  }}
                  placeholder="Paste your private key here (0x...)"
                  aria-label="Private key to verify"
                  className="w-full px-3 py-2 bg-card border border-border rounded-md text-foreground font-mono text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent pr-10"
                />
                <button
                  onClick={() => setShowVerifyKey(!showVerifyKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showVerifyKey ? "Hide key" : "Show key"}
                >
                  {showVerifyKey ? "👁" : "👁‍🗨"}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleVerifyWallet}
                disabled={!verifyPrivateKey.trim()}
                className="flex-1 py-2 px-4 rounded-lg bg-emerald-600 text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center"
              >
                Verify
              </button>
              <button
                onClick={handleClearVerify}
                className="flex-1 py-2 px-4 rounded-lg bg-zinc-700 text-white font-semibold text-sm transition-opacity hover:opacity-90 min-h-[44px] flex items-center justify-center"
              >
                Clear
              </button>
            </div>

            {verifiedAddress && (
              <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <span>✅</span>
                  <span>Match confirmed</span>
                </div>
                <p className="text-xs text-emerald-300/70">Your private key correctly corresponds to this address:</p>
                <div className="bg-card border border-border rounded-md p-3 flex items-center justify-between gap-2">
                  <code className="text-sm font-mono text-emerald-300 break-all">{verifiedAddress}</code>
                  <CopyButton value={verifiedAddress} label="Copy address" />
                </div>
              </div>
            )}

            {verifyError && (
              <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                  <span>❌</span>
                  <span>Invalid private key</span>
                </div>
                <p className="text-xs text-red-300/70">{verifyError}</p>
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="shrink-0 mt-0.5">✅</span>
                <span>Always verify your wallet before storing funds</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Display Section - only after generation */}
      {(generatedWallet || vanityWallet) && (
        <div className="border border-zinc-700 rounded-xl p-6 space-y-4 mt-6">
          {generatedWallet && !vanityWallet && (
            <>
              <div className="text-xs text-center text-emerald-500 font-semibold pb-4 border-b border-border">
                New Wallet Generated
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">
                  Public Address
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-foreground bg-card border border-border rounded-md px-3 py-2 break-all flex-1 leading-relaxed">
                    {generatedWallet.address}
                  </span>
                  <CopyButton value={generatedWallet.address} label="Copy address" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">
                  Private Key
                </label>
                <div className="flex items-center gap-2">
                  {showPrivateKey ? (
                    <span className="font-mono text-sm text-foreground bg-card border border-border rounded-md px-3 py-2 break-all flex-1 leading-relaxed">
                      {generatedWallet.privateKey}
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
                    aria-label={showPrivateKey ? "Hide private key" : "Show private key"}
                  >
                    {showPrivateKey ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                  {showPrivateKey && <CopyButton value={generatedWallet.privateKey} label="Copy private key" />}
                </div>
                <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                  <WarningIcon />
                  Never share your private key. Anyone with it controls your funds.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <QRPanel label="Address QR" src={generatedWallet.qrAddress} />
                <QRPanel
                  label="Private Key QR"
                  src={generatedWallet.qrPrivateKey}
                  blurred={!showPrivateKey}
                  onReveal={() => setShowPrivateKey(true)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full">
                <button
                  onClick={() => handlePrint(generatedWallet)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-card transition-colors w-full sm:w-auto min-h-[44px]"
                >
                  <PrintIcon />
                  Print / Save PDF
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
});

VanityGenerator.displayName = "VanityGenerator";
export default VanityGenerator;

/* Small sub-components */

function CopyButton({ value, label = "Copy to clipboard" }: { value: string; label?: string }) {
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
      title={label}
      aria-label={label}
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

/* Icons */
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
