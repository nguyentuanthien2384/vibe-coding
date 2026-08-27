'use client';

import { useEffect, useRef } from 'react';
import { recordBlogPostView } from '@/lib/blog';

interface PostViewTrackerProps {
  slug: string;
}

export function PostViewTracker({ slug }: PostViewTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current && slug) {
      trackedRef.current = true;
      // Ghi nhận view sau 2s đọc bài để tránh bot crawler
      const timer = setTimeout(() => {
        recordBlogPostView(slug);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [slug]);

  return null;
}
