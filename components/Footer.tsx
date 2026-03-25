export default function Footer() {
  return (
    <footer className="py-8 px-4">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-4 text-center">

        {/* Links as menu items */}
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <a
            href="/how-it-works"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors duration-150 min-h-[44px]"
          >
            How it works
          </a>
          <span className="text-zinc-700 px-1">·</span>
          <a
            href="/guides"
            className="inline-flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors duration-150 font-medium min-h-[44px] min-w-[44px]"
          >
            <BookOpenIcon className="w-4 h-4 shrink-0" />
            <span>Guides</span>
          </a>
          <span className="text-zinc-700 px-1">|</span>
          <a
            href="https://github.com/Rentomy/eth-paper-wallet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-150 min-h-[44px] min-w-[44px]"
          >
            <GitHubIcon className="w-4 h-4 shrink-0" />
            <span>Source</span>
          </a>
        </div>

        {/* Tagline */}
        <p className="text-xs text-muted-foreground tracking-wide flex flex-wrap justify-center gap-x-2 gap-y-0.5">
          <span>Open source</span>
          <span aria-hidden="true">&middot;</span>
          <span>Auditable</span>
          <span aria-hidden="true">&middot;</span>
          <span>No server</span>
          <span aria-hidden="true">&middot;</span>
          <span>No tracking</span>
        </p>

      </div>
    </footer>
  );
}

/* Inline SVG — book open */
function BookOpenIcon({ className }: { className?: string }) {
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
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
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
