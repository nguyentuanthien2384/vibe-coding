'use client';

import { useState, useEffect } from 'react';
import { TOCItem } from '@/types/blog';

/**
 * Hook theo dõi vị trí cuộn chuột để highlight TOC item đang đọc
 * Sử dụng IntersectionObserver để detect H2/H3 đang trong viewport
 */
export function useTocSpy(items: TOCItem[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const headingElements = items
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [items]);

  return activeId;
}
