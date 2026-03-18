export default function Footer() {
  return (
    <footer className="border-t border-border mt-12 py-8 px-4">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-4 text-center">

        {/* Security statement */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground justify-center flex-wrap">
          <ShieldCheckIcon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <p>
            All wallet generation happens locally in your browser.
            Your private key never leaves your device.
          </p>
        </div>

        {/* GitHub link */}
        <a
          href="https://github.com/Rentomy/eth-paper-wallet"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-150 min-h-[44px] min-w-[44px]"
        >
          <GitHubIcon className="w-4 h-4 shrink-0" />
          <span>View source code on GitHub</span>
        </a>

        {/* Tagline */}
        <p className="text-xs text-muted-foreground tracking-wide flex flex-wrap justify-center gap-1">
          <span>Open source</span>
          <span className="hidden sm:inline">&middot;</span>
          <span>Auditable</span>
          <span className="hidden sm:inline">&middot;</span>
          <span>No server</span>
          <span className="hidden sm:inline">&middot;</span>
          <span>No tracking</span>
        </p>

      </div>
    </footer>
  );
}

/* Inline SVG — shield with checkmark */
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

/* Inline SVG — GitHub mark */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
    </svg>
  );
}
