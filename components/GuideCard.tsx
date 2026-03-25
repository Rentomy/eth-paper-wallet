"use client";

import { useState } from "react";

interface GuideCardProps {
  icon: string;
  badge: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

interface GuideCardProps {
  icon: string;
  badge: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}

export default function GuideCard({
  icon,
  badge,
  title,
  intro,
  children,
}: GuideCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePrintGuide = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const contentElement = document.getElementById(`guide-content-${badge}`);
    if (!contentElement) return;

    const content = contentElement.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - emitkey.com</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap');
            body { 
              font-family: 'IBM Plex Mono', monospace; 
              background: #fff; 
              color: #000; 
              padding: 40px; 
              line-height: 1.6;
            }
            .guide-print { max-width: 700px; margin: 0 auto; }
            h1 { font-size: 24px; margin-bottom: 8px; margin-top: 0; }
            .intro { font-size: 13px; color: #555; margin-bottom: 24px; line-height: 1.5; }
            h2 { font-size: 14px; font-weight: 600; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
            .section { margin-bottom: 20px; }
            .steps { margin: 0; padding-left: 0; list-style: none; }
            .steps li { margin-bottom: 12px; padding-left: 20px; position: relative; font-size: 12px; line-height: 1.6; }
            .steps li::before { content: attr(data-step); position: absolute; left: 0; font-weight: 600; }
            ul { margin: 12px 0; padding-left: 20px; font-size: 12px; line-height: 1.6; }
            ul li { margin-bottom: 6px; }
            .box { 
              border: 1px solid #ccc; 
              padding: 16px; 
              margin: 16px 0; 
              border-radius: 4px; 
              font-size: 12px; 
              line-height: 1.6;
            }
            .remember { border-color: #d4a574; background: #fef9f3; }
            .why-works { border-color: #10b981; background: #f0fdf4; }
            .extra-security { border-color: #888; background: #f5f5f5; }
            .key-principles { border-color: #10b981; background: #f0fdf4; }
            .important { border-color: #d4a574; background: #fef9f3; }
            .box strong { display: block; margin-bottom: 8px; font-weight: 600; }
            .code-box { 
              background: #f5f5f5; 
              border: 1px solid #ddd; 
              padding: 12px; 
              border-radius: 4px; 
              font-size: 11px; 
              margin: 12px 0; 
              white-space: pre-wrap; 
              word-break: break-word;
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #ddd; 
              font-size: 11px; 
              color: #666;
            }
            .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #000; }
            .header-badge { font-size: 28px; margin-bottom: 8px; }
            .header-title { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="guide-print">
            <div class="header">
              <div class="header-badge">${icon}</div>
              <div class="header-title">${title}</div>
            </div>
            ${content}
            <div class="footer">
              Generated from emitkey.com — works independently of this website
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl">{icon}</span>
          <span className="text-xs font-semibold text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
            {badge}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{intro}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          aria-label={isExpanded ? "Collapse" : "Expand"}
          className="flex-shrink-0 p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div id={`guide-content-${badge}`} className="mt-6 pt-6 border-t border-zinc-800 text-sm text-zinc-300 space-y-4">
          {children}
          
          {/* Download PDF Button */}
          <button
            onClick={handlePrintGuide}
            className="w-full mt-6 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-zinc-800/50 font-semibold text-sm transition-colors min-h-[44px]"
          >
            📄 Download Guide as PDF
          </button>
        </div>
      )}
    </div>
  );
}
