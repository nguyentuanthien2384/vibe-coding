'use client';

import { useState } from 'react';
import { TOCItem } from '@/types/blog';
import { useTocSpy } from '@/hooks/use-toc-spy';

export interface TableOfContentsNavProps {
  items: TOCItem[];
  className?: string;
  isMobileAccordion?: boolean;
}

export const TableOfContentsNav = ({
  items,
  className = '',
  isMobileAccordion = false,
}: TableOfContentsNavProps) => {
  const activeId = useTocSpy(items);
  const [isOpen, setIsOpen] = useState(false);

  if (!items || items.length === 0) return null;

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      if (isMobileAccordion) {
        setIsOpen(false);
      }
    }
  };

  if (isMobileAccordion) {
    return (
      <div className={`bg-slate-50/90 border border-slate-200 rounded-2xl overflow-hidden mb-8 ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-5 py-3.5 flex items-center justify-between font-bold text-slate-800 text-sm hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span>MỤC LỤC BÀI VIẾT ({items.length})</span>
          </div>
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="p-4 pt-0 border-t border-slate-200/60">
            <nav className="space-y-1 mt-2">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleScrollTo(e, item.id)}
                  className={`block py-1.5 transition-all text-sm ${
                    item.level === 3 ? 'pl-4 text-xs' : 'font-medium'
                  } ${
                    activeId === item.id
                      ? 'text-orange-600 font-bold border-l-2 border-orange-600 pl-2 bg-orange-50/50 rounded-r-md'
                      : 'text-slate-600 hover:text-orange-600'
                  }`}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-slate-50/80 border border-slate-200 rounded-2xl p-5 ${className}`}>
      <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
        <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        <span>Mục lục bài viết</span>
      </div>

      <nav className="space-y-1 text-sm max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleScrollTo(e, item.id)}
              className={`block py-1 transition-all ${
                item.level === 3
                  ? 'pl-4 text-xs'
                  : 'font-medium text-sm'
              } ${
                isActive
                  ? 'text-orange-600 font-bold border-l-2 border-orange-600 pl-2 bg-orange-50/50 rounded-r-md'
                  : 'text-slate-600 hover:text-orange-600 hover:translate-x-1'
              }`}
            >
              {item.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
};
