'use client';

import { X, Download, ExternalLink } from 'lucide-react';
import { MediaItem } from '@/lib/upload-api';
import { getImageUrl } from '@/lib/image-url';

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItem: MediaItem | null;
}

export default function MediaPreviewModal({
  isOpen,
  onClose,
  mediaItem,
}: MediaPreviewModalProps) {
  if (!isOpen || !mediaItem) return null;

  const fullUrl = getImageUrl(mediaItem.url);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-zoom-out"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[88vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col cursor-default animate-in zoom-in-95 duration-200"
      >
        {/* Top bar */}
        <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2 truncate pr-4">
            <span className="text-xs font-mono font-bold truncate text-slate-300">
              {mediaItem.filename}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              title="Mở tab mới"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href={fullUrl}
              download={mediaItem.filename}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              title="Tải ảnh về máy"
            >
              <Download className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Image View */}
        <div className="p-4 flex items-center justify-center overflow-auto max-h-[75vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullUrl}
            alt={mediaItem.filename}
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
