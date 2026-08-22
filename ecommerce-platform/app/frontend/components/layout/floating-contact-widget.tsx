"use client";

import React, { useState, useEffect } from "react";
import { GeneralSettings, SeoSocialSettings } from "../../types/settings";

interface FloatingContactWidgetProps {
  generalSettings?: GeneralSettings;
  seo?: SeoSocialSettings;
}

export const FloatingContactWidget: React.FC<FloatingContactWidgetProps> = ({
  generalSettings,
  seo,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const hotline = generalSettings?.hotline || generalSettings?.storePhone;
  const zaloUrl = seo?.zaloUrl;
  const facebookUrl = seo?.facebookUrl;
  const tiktokUrl = seo?.tiktokUrl;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasAnySocial = !!(hotline || zaloUrl || facebookUrl || tiktokUrl);
  if (!hasAnySocial && !showBackToTop) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5">
      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          title="Cuộn lên đầu trang"
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-lg hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center justify-center text-sm active:scale-95 animate-fade-in"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Expanded Quick Social Buttons */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Zalo Button */}
          {zaloUrl && (
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105"
            >
              <span>Chat Zalo</span>
              <span className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center font-extrabold text-[10px]">
                Z
              </span>
            </a>
          )}

          {/* Facebook Button */}
          {facebookUrl && (
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105"
            >
              <span>Facebook</span>
              <span className="w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center font-extrabold text-[10px]">
                f
              </span>
            </a>
          )}

          {/* Hotline Call Button */}
          {hotline && (
            <a
              href={`tel:${hotline}`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105 animate-pulse"
            >
              <span>Gọi: {hotline}</span>
              <span className="w-6 h-6 rounded-full bg-white text-emerald-600 flex items-center justify-center text-xs">
                📞
              </span>
            </a>
          )}
        </div>
      )}

      {/* Main Toggle Button */}
      {hasAnySocial && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Liên hệ & Hỗ trợ nhanh"
          className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-xl shadow-orange-600/30 flex items-center justify-center text-xl font-bold transition-all hover:scale-110 active:scale-95"
        >
          {isOpen ? (
            <span className="text-lg">✕</span>
          ) : (
            <span className="animate-bounce">💬</span>
          )}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
          )}
        </button>
      )}
    </div>
  );
};
