"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import QRCode from "qrcode";

interface WalletData {
  address: string;
  privateKey: string;
  addressQR: string;
  privateKeyQR: string;
}

export default function WalletGenerator() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const generate = useCallback(async () => {
    setGenerating(true);
    setShowPrivateKey(false);
    try {
      const w = ethers.Wallet.createRandom();
      const [addressQR, privateKeyQR] = await Promise.all([
        QRCode.toDataURL(w.address, {
          errorCorrectionLevel: "H",
          margin: 1,
          color: { dark: "#000000", light: "#ffffff" },
          width: 200,
        }),
        QRCode.toDataURL(w.privateKey, {
          errorCorrectionLevel: "H",
          margin: 1,
          color: { dark: "#000000", light: "#ffffff" },
          width: 200,
        }),
      ]);
      setWallet({
        address: w.address,
        privateKey: w.privateKey,
        addressQR,
        privateKeyQR,
      });
    } finally {
      setGenerating(false);
    }
  }, []);

  const handlePrint = async () => {
    if (!wallet) return;

    // Generate fresh QR codes as base64 PNG data URLs
    const qrAddress = await QRCode.toDataURL(wallet.address, { width: 160, margin: 1 });
    const qrPrivKey = await QRCode.toDataURL(wallet.privateKey, { width: 160, margin: 1 });

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ETH Paper Wallet</title>
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
            <h2>Ethereum Paper Wallet</h2>
            <p class="warning">Keep this document secure. Never share your private key.</p>
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
                <img src="${qrAddress}" width="140" height="140" alt="Address QR" />
                <div class="qr-label">Public Address</div>
              </div>
              <div class="qr-box">
                <img src="${qrPrivKey}" width="140" height="140" alt="Private Key QR" />
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

  return (
    <div className="flex flex-col gap-6">
      {/* Generate button */}
      <button
        onClick={generate}
        disabled={generating}
        className="w-full py-3 px-6 rounded-lg bg-accent text-accent-foreground font-semibold text-sm tracking-wide transition-opacity duration-150 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
      >
        {generating ? "Generating…" : wallet ? "Generate New Wallet" : "Generate Wallet"}
      </button>

      {wallet && (
        <>
          {/* Address */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground uppercase tracking-widest">
              Public Address
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-foreground bg-card border border-border rounded-md px-3 py-2 break-all flex-1 leading-relaxed">
                {wallet.address}
              </span>
              <CopyButton value={wallet.address} />
            </div>
          </div>

          {/* Private key */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground uppercase tracking-widest">
              Private Key
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-foreground bg-card border border-border rounded-md px-3 py-2 break-all flex-1 leading-relaxed">
                {showPrivateKey
                  ? wallet.privateKey
                  : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
              </span>
              <button
                onClick={() => setShowPrivateKey((v) => !v)}
                title={showPrivateKey ? "Hide private key" : "Reveal private key"}
                className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-muted transition-colors"
                aria-label={showPrivateKey ? "Hide private key" : "Reveal private key"}
              >
                {showPrivateKey ? <EyeOffIcon /> : <EyeIcon />}
              </button>
              {showPrivateKey && <CopyButton value={wallet.privateKey} />}
            </div>
            <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
              <WarningIcon />
              Never share your private key. Anyone with it controls your funds.
            </p>
          </div>

          {/* QR codes */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <QRPanel label="Address QR" src={wallet.addressQR} />
            <QRPanel label="Private Key QR" src={wallet.privateKeyQR} blurred={!showPrivateKey} onReveal={() => setShowPrivateKey(true)} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-card transition-colors"
            >
              <PrintIcon />
              Print / Save PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Small sub-components ──────────────────────────────────────── */

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
      className="p-2 rounded-md border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
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
    <div className="flex flex-col items-center gap-2 bg-card border border-border rounded-lg p-4">
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

/* ── Icons ─────────────────────────────────────────────────────── */
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
function CopyIcon() {
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
