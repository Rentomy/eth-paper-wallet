"use client";

import { useState, useRef, useEffect } from "react";
import { ethers } from "ethers";
import { generateQR, copyToClipboard } from "@/lib/utils";
import type { Wallet } from "@/types/wallet";

interface VanityGeneratorProps {
  onWalletFound: (wallet: Wallet) => void;
}

export default function VanityGenerator({ onWalletFound }: VanityGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [searching, setSearching] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const workerRef = useRef<Worker | null>(null);
  const [error, setError] = useState("");

  // Initialize worker once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      workerRef.current = new Worker("/vanity-worker.js");

      workerRef.current.onmessage = async (e) => {
        const { type, wallet, attemptCount: count, error: err } = e.data;

        if (type === "found") {
          // Generate QR codes for the found wallet
          try {
            const [qrAddress, qrPrivateKey] = await Promise.all([
              generateQR(wallet.address),
              generateQR(wallet.privateKey),
            ]);

            onWalletFound({
              address: wallet.address,
              privateKey: wallet.privateKey,
              qrAddress,
              qrPrivateKey,
            });

            setSearching(false);
            setAttemptCount(0);
            setPrefix("");
            setError("");
          } catch (err) {
            setError("Failed to generate QR codes");
            setSearching(false);
          }
        } else if (type === "progress") {
          setAttemptCount(count);
        } else if (type === "stopped") {
          setSearching(false);
          setAttemptCount(0);
        } else if (type === "error") {
          setError(err || "An error occurred");
          setSearching(false);
        }
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [onWalletFound]);

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
      workerRef.current.postMessage({ action: "start", prefix });
    }
  };

  const handleStopSearch = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ action: "stop" });
    }
  };

  const estimatedTime = (prefixLength: number): string => {
    if (prefixLength === 4) return "seconds";
    if (prefixLength === 5) return "minutes";
    if (prefixLength === 6) return "up to 1 hour";
    return "";
  };

  return (
    <div className="w-full mt-6 border border-zinc-700 rounded-xl p-4">
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
          {/* Input field */}
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
              <>
                <button
                  onClick={handleStopSearch}
                  className="flex-1 py-2 px-4 rounded-lg bg-zinc-700 text-white font-semibold text-sm transition-opacity hover:opacity-90 min-h-[44px] flex items-center justify-center"
                >
                  Stop
                </button>
              </>
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
        </div>
      )}
    </div>
  );
}
