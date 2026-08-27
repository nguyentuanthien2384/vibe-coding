'use client';

import { useState } from 'react';

export interface SocialShareBarProps {
  url?: string;
  title?: string;
  className?: string;
}

export const SocialShareBar = ({ url = '', title = '', className = '' }: SocialShareBarProps) => {
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? (url || window.location.href) : url;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`,
      '_blank'
    );
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Facebook */}
      <button
        onClick={shareFacebook}
        aria-label="Chia sẻ lên Facebook"
        title="Chia sẻ lên Facebook"
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-600 border border-slate-200 hover:border-orange-300 transition-all cursor-pointer"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </button>

      {/* X / Twitter */}
      <button
        onClick={shareTwitter}
        aria-label="Chia sẻ lên X"
        title="Chia sẻ lên X (Twitter)"
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-600 border border-slate-200 hover:border-orange-300 transition-all cursor-pointer"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        aria-label="Sao chép liên kết"
        title={copied ? 'Đã sao chép liên kết!' : 'Sao chép liên kết'}
        className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer ${
          copied
            ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
            : 'bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-600 border-slate-200 hover:border-orange-300'
        }`}
      >
        {copied ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
};
