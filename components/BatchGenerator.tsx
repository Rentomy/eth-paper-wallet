"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { generateQR, copyToClipboard } from "@/lib/utils";
import type { Wallet } from "@/types/wallet";

interface BatchWallet {
  index: number;
  address: string;
  privateKey: string;
}

export default function BatchGenerator() {
  const [batchOpen, setBatchOpen] = useState(false);
  const [quantity, setQuantity] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [wallets, setWallets] = useState<BatchWallet[]>([]);
  const [revealedKeys, setRevealedKeys] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");

  const PRESET_QUANTITIES = [5, 10, 25, 50, 100];

  const generateBatch = useCallback(async (count: number) => {
    setGenerating(true);
    setProgress(0);
    setError("");
    setWallets([]);
    setRevealedKeys(new Set());

    try {
      const generatedWallets: BatchWallet[] = [];
      
      for (let i = 0; i < count; i += 10) {
        const batchSize = Math.min(10, count - i);
        const batch: BatchWallet[] = [];
        
        for (let j = 0; j < batchSize; j++) {
          const w = ethers.Wallet.createRandom();
          batch.push({
            index: generatedWallets.length + batch.length + 1,
            address: w.address,
            privateKey: w.privateKey,
          });
        }
        
        generatedWallets.push(...batch);
        setProgress(generatedWallets.length);
        
        // Non-blocking: yield to UI
        await new Promise((r) => setTimeout(r, 0));
      }
      
      setWallets(generatedWallets);
    } catch (err) {
      setError("Failed to generate batch wallets");
      console.error(err);
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  }, []);

  const handleGenerateBatch = () => {
    // Defer batch generation to allow UI to update before expensive crypto operations
    setTimeout(() => {
      generateBatch(quantity);
    }, 0);
  };

  const handleReset = useCallback(() => {
    setWallets([]);
    setRevealedKeys(new Set());
    setError("");
    setProgress(0);
  }, []);

  const toggleRevealAll = () => {
    if (revealedKeys.size === wallets.length) {
      setRevealedKeys(new Set());
    } else {
      setRevealedKeys(new Set(wallets.map((_, i) => i)));
    }
  };

  const toggleReveal = (index: number) => {
    const newRevealed = new Set(revealedKeys);
    if (newRevealed.has(index)) {
      newRevealed.delete(index);
    } else {
      newRevealed.add(index);
    }
    setRevealedKeys(newRevealed);
  };

  const exportCSV = () => {
    const headers = ["index", "address", "privateKey"];
    const rows = wallets.map((w) => [w.index, w.address, w.privateKey]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wallets-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePrintLayout = async (): Promise<string> => {
    const walletCards = await Promise.all(
      wallets.map(async (w) => {
        const qrAddress = await generateQR(w.address);
        const qrPrivateKey = await generateQR(w.privateKey);
        return { ...w, qrAddress, qrPrivateKey };
      })
    );

    const cards = walletCards
      .map(
        (w) => `
        <div class="wallet-card">
          <div class="section">
            <div class="label">Wallet #${w.index}</div>
          </div>
          <div class="section">
            <div class="label">Public Address</div>
            <div class="value">${w.address}</div>
            <div style="text-align: center; margin-top: 8px;">
              <img src="${w.qrAddress}" width="100" height="100" alt="Address QR" />
            </div>
          </div>
          <div class="cut-line">✂ ✂ ✂ ✂ ✂ ✂ ✂ ✂ ✂ ✂</div>
          <div class="section">
            <div class="label">Private Key</div>
            <div class="private-key-box">${w.privateKey}</div>
            <div style="text-align: center; margin-top: 8px;">
              <img src="${w.qrPrivateKey}" width="100" height="100" alt="Private Key QR" />
            </div>
          </div>
        </div>
      `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Batch Wallets</title>
          <style>
            body { font-family: monospace; background: #fff; color: #000; padding: 20px; }
            .wallet-card { 
              border: 2px solid #000; 
              padding: 20px; 
              margin-bottom: 20px; 
              page-break-after: always;
              max-width: 600px;
              margin-left: auto;
              margin-right: auto;
            }
            .section { margin-bottom: 16px; }
            .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-bottom: 4px; font-weight: bold; }
            .value { font-size: 12px; word-break: break-all; background: #f5f5f5; padding: 8px; border-radius: 4px; }
            .private-key-box { 
              font-size: 12px; 
              word-break: break-all; 
              background: #fff; 
              border: 2px dashed #000; 
              padding: 12px; 
              border-radius: 4px; 
            }
            .cut-line { 
              text-align: center; 
              color: #999; 
              margin: 16px 0; 
              font-size: 10px; 
              letter-spacing: 0.2em;
            }
            .warning { font-size: 10px; color: #c00; border: 1px solid #c00; padding: 8px; border-radius: 4px; text-align: center; margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <div class="warning">Keep this document secure. Never share or digitally store your private keys.</div>
          ${cards}
        </body>
      </html>
    `;
  };

  const handlePrintPDF = async () => {
    try {
      const html = await generatePrintLayout();
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } catch (err) {
      setError("Failed to generate PDF");
      console.error(err);
    }
  };

  return (
    <div className="border border-zinc-700 rounded-xl overflow-hidden">
      {/* Accordion Header */}
      <button
        onClick={() => setBatchOpen(!batchOpen)}
        className="w-full flex items-center justify-between py-3 px-6 bg-zinc-900 hover:bg-zinc-800 transition-colors text-left font-semibold text-base text-white min-h-[52px]"
      >
        <span className="flex items-center gap-2">
          <span>⚡</span>
          <span>Batch Generator</span>
        </span>
        <span
          className="transform transition-transform"
          style={{ transform: batchOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>

      {batchOpen && (
        <div className="p-6 space-y-4 bg-background border-t border-zinc-700">
          {/* Intro text */}
          <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
            <p>Generate multiple wallets at once and export as CSV or PDF.</p>
            <p>All wallets are generated locally — nothing is transmitted.</p>
          </div>

          {/* Security Warning */}
          <div className="bg-amber-900/20 border border-amber-700 rounded-md p-3 text-xs text-amber-500 flex items-start gap-2">
            <span className="text-base shrink-0 mt-0.5">⚠</span>
            <span>
              Keep your CSV or PDF file encrypted and offline. Never store private keys on cloud services (Google Drive, Dropbox, iCloud).
            </span>
          </div>

          {wallets.length === 0 ? (
            <>
              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="text-xs text-muted-foreground uppercase tracking-widest block">
                  Number of wallets
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_QUANTITIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuantity(q)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors min-h-[40px] ${
                        quantity === q
                          ? "bg-emerald-500 text-zinc-950"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateBatch}
                disabled={generating}
                className="w-full py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-base transition-colors disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Generating... {progress} / {quantity}</span>
                  </>
                ) : (
                  "Generate Batch"
                )}
              </button>

              {error && (
                <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-4">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Results Display */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    Generated {wallets.length} wallet{wallets.length !== 1 ? "s" : ""}
                  </p>
                  <button
                    onClick={toggleRevealAll}
                    className="text-xs px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    {revealedKeys.size === wallets.length ? "Hide All" : "Reveal All"}
                  </button>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto border border-zinc-700 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-700 bg-zinc-900">
                        <th className="px-4 py-2 text-left text-xs text-muted-foreground font-semibold">#</th>
                        <th className="px-4 py-2 text-left text-xs text-muted-foreground font-semibold">
                          Public Address
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-muted-foreground font-semibold">
                          Private Key
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-muted-foreground font-semibold">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {wallets.map((wallet, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                            {wallet.index}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-emerald-400 truncate max-w-[150px] sm:max-w-none">
                            {wallet.address}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono">
                            {revealedKeys.has(idx) ? (
                              <span className="text-amber-400">{wallet.privateKey}</span>
                            ) : (
                              <span className="text-zinc-500">{"•".repeat(20)}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <button
                              onClick={() => toggleReveal(idx)}
                              className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors text-xs"
                            >
                              {revealedKeys.has(idx) ? "Hide" : "Show"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Export Options */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={exportCSV}
                  className="flex-1 py-2 px-4 rounded-lg border border-border text-sm text-foreground hover:bg-zinc-900 transition-colors font-semibold min-h-[44px] flex items-center justify-center gap-2"
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={handlePrintPDF}
                  className="flex-1 py-2 px-4 rounded-lg border border-border text-sm text-foreground hover:bg-zinc-900 transition-colors font-semibold min-h-[44px] flex items-center justify-center gap-2"
                >
                  🖨 Print / Save PDF
                </button>
              </div>

            </>
          )}

          {/* New Session — mirrors WalletGenerator: always rendered, visible only after generation */}
          {wallets.length > 0 && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleReset}
                aria-label="Start a new batch session"
                className="px-6 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white font-semibold text-sm transition-colors min-h-[44px]"
              >
                ↺ New Session
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
