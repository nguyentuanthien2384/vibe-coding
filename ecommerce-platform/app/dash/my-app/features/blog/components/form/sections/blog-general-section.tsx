'use client';

import { useEffect } from 'react';
import { FileText } from 'lucide-react';

interface BlogGeneralSectionProps {
  title: string;
  slug: string;
  summary: string;
  onTitleChange: (val: string) => void;
  onSlugChange: (val: string) => void;
  onSummaryChange: (val: string) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const MAX_SUMMARY = 500;

export default function BlogGeneralSection({
  title,
  slug,
  summary,
  onTitleChange,
  onSlugChange,
  onSummaryChange,
}: BlogGeneralSectionProps) {
  // Auto-generate slug from title
  useEffect(() => {
    if (title && !slug) {
      onSlugChange(slugify(title));
    }
  }, [title]);

  const handleTitleChange = (val: string) => {
    onTitleChange(val);
    onSlugChange(slugify(val));
  };

  const summaryLeft = MAX_SUMMARY - summary.length;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-[#4880FF]" />
        </div>
        <h2 className="text-sm font-bold text-[#202224]">Thông tin chung</h2>
      </div>

      {/* Title Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide" htmlFor="post-title">
          Tiêu đề bài viết <span className="text-red-500">*</span>
        </label>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Nhập tiêu đề bài viết..."
          className="w-full px-4 py-3 text-lg font-bold text-[#202224] placeholder:font-normal placeholder:text-gray-400 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all"
        />
      </div>

      {/* Slug Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide" htmlFor="post-slug">
          Slug URL
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 flex-shrink-0 font-mono">/blog/</span>
          <input
            id="post-slug"
            type="text"
            value={slug}
            onChange={(e) => onSlugChange(slugify(e.target.value))}
            placeholder="ten-bai-viet"
            className="flex-1 px-4 py-2.5 text-sm font-mono text-gray-700 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all"
          />
          <span className="text-[10px] px-2 py-1 bg-blue-50 text-[#4880FF] font-bold rounded-lg flex-shrink-0">
            Tự động sinh
          </span>
        </div>
      </div>

      {/* Summary Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide" htmlFor="post-summary">
            Mô tả tóm tắt
          </label>
          <span
            className={`text-xs font-medium ${
              summaryLeft < 50 ? 'text-amber-600' : 'text-gray-400'
            }`}
          >
            {summary.length}/{MAX_SUMMARY} ký tự
          </span>
        </div>
        <textarea
          id="post-summary"
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          maxLength={MAX_SUMMARY}
          rows={3}
          placeholder="Viết một đoạn tóm tắt ngắn gọn về nội dung bài viết..."
          className="w-full px-4 py-3 text-sm text-[#202224] placeholder:text-gray-400 bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}
