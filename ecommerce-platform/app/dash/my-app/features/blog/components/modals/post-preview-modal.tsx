'use client';

import React from 'react';
import {
  X,
  ExternalLink,
  Clock,
  User,
  Calendar,
  Eye,
  Globe,
  Sparkles,
} from 'lucide-react';
import { TipTapDoc, TipTapNode, TipTapMark } from '../../types/tiptap.types';
import { PostStatus } from '../../types/blog.types';
import { getImageUrl } from '../../../../lib/image-url';

interface PostPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  slug: string;
  summary: string;
  thumbnail: string;
  content: TipTapDoc | null;
  categoryName?: string;
  status?: PostStatus;
  metaTitle?: string;
  metaDescription?: string;
}

function renderMarks(text: string, marks?: TipTapMark[]): React.ReactNode {
  if (!marks || marks.length === 0) return text;

  return marks.reduce<React.ReactNode>((acc, mark) => {
    switch (mark.type) {
      case 'bold':
        return <strong>{acc}</strong>;
      case 'italic':
        return <em>{acc}</em>;
      case 'underline':
        return <u>{acc}</u>;
      case 'strike':
        return <s className="line-through">{acc}</s>;
      case 'code':
        return (
          <code className="px-1.5 py-0.5 bg-slate-100 text-orange-600 rounded font-mono text-sm">
            {acc}
          </code>
        );
      case 'link':
        return (
          <a
            href={mark.attrs?.href || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:underline font-medium"
          >
            {acc}
          </a>
        );
      default:
        return acc;
    }
  }, text);
}

function renderNode(node: TipTapNode, index: number): React.ReactNode {
  if (node.type === 'text') {
    return <React.Fragment key={index}>{renderMarks(node.text || '', node.marks)}</React.Fragment>;
  }

  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case 'paragraph':
      return (
        <p key={index} className="text-slate-700 leading-relaxed text-base mb-4">
          {children && children.length > 0 ? children : <br />}
        </p>
      );

    case 'heading': {
      const level = node.attrs?.level || 2;
      if (level === 2) {
        return (
          <h2 key={index} className="text-xl md:text-2xl font-extrabold text-slate-900 mt-8 mb-3 pt-2">
            {children}
          </h2>
        );
      }
      if (level === 3) {
        return (
          <h3 key={index} className="text-lg md:text-xl font-bold text-slate-800 mt-6 mb-2">
            {children}
          </h3>
        );
      }
      return (
        <h4 key={index} className="text-base font-bold text-slate-800 mt-4 mb-2">
          {children}
        </h4>
      );
    }

    case 'bulletList':
      return (
        <ul key={index} className="list-disc list-inside space-y-1.5 mb-5 text-slate-700 pl-2">
          {children}
        </ul>
      );

    case 'orderedList':
      return (
        <ol key={index} className="list-decimal list-inside space-y-1.5 mb-5 text-slate-700 pl-2">
          {children}
        </ol>
      );

    case 'listItem':
      return (
        <li key={index} className="leading-relaxed">
          {children}
        </li>
      );

    case 'blockquote':
      return (
        <blockquote
          key={index}
          className="border-l-4 border-orange-500 pl-4 py-2.5 my-5 italic bg-orange-50/50 rounded-r-xl text-slate-700 text-base"
        >
          {children}
        </blockquote>
      );

    case 'image':
      return (
        <figure key={index} className="my-6 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
          <div className="relative aspect-[16/9] w-full bg-slate-100 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImageUrl(node.attrs?.src || '')}
              alt={node.attrs?.alt || 'Hình ảnh bài viết'}
              className="w-full h-full object-cover"
            />
          </div>
          {node.attrs?.caption && (
            <figcaption className="p-2.5 text-center text-xs text-slate-500 bg-slate-50 border-t border-slate-200">
              {node.attrs.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'horizontalRule':
      return <hr key={index} className="my-6 border-slate-200" />;

    case 'hardBreak':
      return <br key={index} />;

    default:
      return <div key={index}>{children}</div>;
  }
}

export default function PostPreviewModal({
  isOpen,
  onClose,
  title,
  slug,
  summary,
  thumbnail,
  content,
  categoryName,
  status,
  metaTitle,
  metaDescription,
}: PostPreviewModalProps) {
  if (!isOpen) return null;

  const frontendBase = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  const articleUrl = slug ? `${frontendBase}/blog/${slug}?preview=true` : `${frontendBase}/blog`;
  const displayTitle = title || 'Tiêu đề bài viết chưa nhập';
  const displaySummary = summary || 'Tóm tắt nội dung bài viết sẽ hiển thị tại đây...';
  const displayCategory = categoryName || 'Ẩm thực & Đồ ăn nhanh';

  // Calculate rough reading time
  const readingTime = Math.max(1, Math.ceil((displaySummary.length + 500) / 400));

  const handleOpenNewTab = () => {
    window.open(articleUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="preview-modal-title" className="text-sm font-bold text-gray-900">
                  Xem trước bài viết (Live Preview)
                </h2>
                {status && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {status}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 truncate max-w-md">
                Đường dẫn:{' '}
                <span className="font-mono text-gray-600">{slug ? `/blog/${slug}` : '/blog/...'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenNewTab}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4880FF] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              title="Mở sang tab mới trên website thật"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Mở tab mới
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body - Simulating Storefront Article view */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* Breadcrumb & Category badge */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200/60 text-orange-600 font-bold text-xs rounded-full">
              <Sparkles className="w-3 h-3" />
              {displayCategory}
            </span>

            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {readingTime} phút đọc
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Hôm nay
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gray-400" />
                Admin
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {displayTitle}
          </h1>

          {/* Featured Image */}
          {thumbnail ? (
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(thumbnail)}
                alt={displayTitle}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 flex flex-col items-center justify-center text-orange-400 gap-2">
              <Globe className="w-8 h-8" />
              <span className="text-xs font-semibold">Chưa có ảnh bìa (thumbnail)</span>
            </div>
          )}

          {/* Summary / Lead paragraph */}
          <div className="p-4 bg-orange-50/40 border-l-4 border-orange-500 rounded-r-2xl text-slate-700 text-base md:text-lg italic leading-relaxed">
            {displaySummary}
          </div>

          {/* Article Body Content */}
          <div className="border-t border-gray-100 pt-6">
            {content && content.content && content.content.length > 0 ? (
              <div className="prose-preview">
                {content.content.map((node, index) => renderNode(node, index))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 space-y-1">
                <p className="text-sm font-medium">Chưa có nội dung bài viết chi tiết.</p>
                <p className="text-xs">Hãy nhập nội dung trong khung soạn thảo để xem trước đầy đủ.</p>
              </div>
            )}
          </div>

          {/* Google SERP Snippet Preview Box */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Xem trước kết quả tìm kiếm Google (SERP Preview)
            </h3>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[#202124]">
                <div className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[9px] font-bold">
                  T
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[#202124] text-xs">TechBite · Ẩm thực & Đồ ăn nhanh</p>
                  <p className="text-gray-500 text-[11px]">https://techbite.vn › blog › {slug || 'ten-bai-viet'}</p>
                </div>
              </div>
              <p className="text-[17px] font-normal text-[#1a0dab] line-clamp-1 leading-snug">
                {metaTitle || displayTitle}
              </p>
              <p className="text-[13px] text-[#4d5156] line-clamp-2 leading-relaxed">
                {metaDescription || displaySummary}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-gray-400">
            * Xem trước mô phỏng giao diện người dùng trên máy tính.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleOpenNewTab}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#4880FF] hover:bg-blue-600 rounded-xl shadow-md shadow-blue-200 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Mở trang thực tế trên tab mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
