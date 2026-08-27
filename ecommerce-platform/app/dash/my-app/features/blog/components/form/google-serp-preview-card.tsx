'use client';

import { useState } from 'react';
import { ExternalLink, Eye, Globe, Sparkles } from 'lucide-react';
import PostPreviewModal from '../modals/post-preview-modal';
import { TipTapDoc } from '../../types/tiptap.types';
import { PostStatus } from '../../types/blog.types';

interface GoogleSerpPreviewCardProps {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  siteName?: string;
  baseUrl?: string;
  title?: string;
  summary?: string;
  thumbnail?: string;
  content?: TipTapDoc | null;
  categoryName?: string;
  status?: PostStatus;
}

export default function GoogleSerpPreviewCard({
  metaTitle,
  metaDescription,
  slug,
  siteName = 'TechBite · Ẩm thực & Đồ ăn nhanh',
  baseUrl = 'https://techbite.vn',
  title = '',
  summary = '',
  thumbnail = '',
  content = null,
  categoryName = '',
  status = 'DRAFT',
}: GoogleSerpPreviewCardProps) {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const frontendBase = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  // Luôn kèm cờ preview=true để xem được cả bài viết nháp (DRAFT)
  const articleUrl = slug ? `${frontendBase}/blog/${slug}?preview=true` : `${frontendBase}/blog`;

  const displayTitle = metaTitle || title || 'Tiêu đề bài viết (chưa nhập)';
  const displayDesc =
    metaDescription ||
    summary ||
    'Mô tả nội dung bài viết sẽ hiển thị ở đây. Nhập meta description để preview.';
  const displayUrl = `${baseUrl} › blog › ${slug || 'ten-bai-viet'}`;

  return (
    <>
      <div className="p-4 bg-white hover:bg-blue-50/20 border border-gray-200 hover:border-blue-300 rounded-2xl shadow-sm space-y-2.5 transition-all group/serp">
        {/* Quick action bar */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 font-medium">
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>Google Search Snippet</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:text-blue-600 bg-gray-100 hover:bg-blue-100/70 rounded-lg transition-colors cursor-pointer"
              title="Bấm để xem popup giao diện bài viết"
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              Xem nhanh
            </button>
            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-[#4880FF] hover:bg-blue-600 rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Mở bài viết trực tiếp sang tab mới"
            >
              <ExternalLink className="w-3 h-3" />
              Mở tab mới
            </a>
          </div>
        </div>

        {/* Chrome-like search result header */}
        <div
          onClick={() => setIsPreviewModalOpen(true)}
          className="flex items-center gap-2 text-xs text-[#202124] cursor-pointer"
        >
          <div className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">
            T
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[#202124] text-xs truncate">{siteName}</p>
            <p className="text-gray-500 text-[11px] truncate">{displayUrl}</p>
          </div>
        </div>

        {/* SERP Title - Clickable Link to open in new tab or click to view */}
        <div className="space-y-1">
          <a
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[17px] font-normal text-[#1a0dab] hover:underline cursor-pointer line-clamp-1 leading-snug group-hover/serp:text-[#1a0dab] inline-flex items-center gap-1.5"
            title={`Mở sang tab mới: ${articleUrl}`}
          >
            <span>{displayTitle}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover/serp:opacity-100 text-[#1a0dab] transition-opacity flex-shrink-0" />
          </a>

          {/* SERP Description - Clickable to open preview modal */}
          <p
            onClick={() => setIsPreviewModalOpen(true)}
            className="text-[13px] text-[#4d5156] line-clamp-2 leading-relaxed cursor-pointer hover:text-gray-700"
            title="Bấm vào để xem trước giao diện bài viết"
          >
            {displayDesc}
          </p>
        </div>

        {/* Click hint footer */}
        <div className="pt-1 flex items-center justify-between text-[11px] text-gray-400">
          <span
            onClick={() => setIsPreviewModalOpen(true)}
            className="hover:text-blue-600 cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            Nhấn để xem trước giao diện
          </span>
          <a
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 inline-flex items-center gap-0.5 font-medium"
          >
            Mở tab mới ↗
          </a>
        </div>
      </div>

      {/* Live Preview Modal */}
      <PostPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={title || metaTitle}
        slug={slug}
        summary={summary || metaDescription}
        thumbnail={thumbnail}
        content={content}
        categoryName={categoryName}
        status={status}
        metaTitle={metaTitle}
        metaDescription={metaDescription}
      />
    </>
  );
}
