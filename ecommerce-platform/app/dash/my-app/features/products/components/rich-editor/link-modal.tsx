'use client';

import { useState, useEffect } from 'react';
import { X, Link as LinkIcon, ExternalLink, Globe, Check } from 'lucide-react';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  initialUrl?: string;
  onSave: (text: string, url: string) => void;
}

export default function LinkModal({
  isOpen,
  onClose,
  initialText,
  initialUrl = '',
  onSave,
}: LinkModalProps) {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialText || '');
      setUrl(initialUrl || '');
      setError(null);
    }
  }, [isOpen, initialText, initialUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setError('Vui lòng nhập đường dẫn URL liên kết');
      return;
    }

    const cleanText = text.trim() || cleanUrl;
    onSave(cleanText, cleanUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 flex items-center justify-center text-blue-400 border border-blue-400/20">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">Chèn liên kết (Hyperlink)</h3>
              <p className="text-[11px] text-slate-400">Gắn link cho văn bản được chọn</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Display Text */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#202224] flex items-center gap-1">
              <span>Văn bản hiển thị</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhập chữ hiển thị (vd: Xem khuyến mãi tại đây)..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
            />
          </div>

          {/* URL Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#202224] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#4880FF]" />
                <span>Đường dẫn liên kết (URL)</span>
                <span className="text-red-500">*</span>
              </span>
              {url.trim() && (
                <a
                  href={url.trim().startsWith('http') || url.trim().startsWith('/') ? url.trim() : `https://${url.trim()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#4880FF] hover:underline flex items-center gap-0.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Thử mở</span>
                </a>
              )}
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="https://example.com/khuyen-mai hoặc /products/..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
              autoFocus
            />
            <p className="text-[10px] text-gray-400">
              Có thể nhập URL đầy đủ (https://...) hoặc link nội bộ (/san-pham/...)
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#4880FF] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-200 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Chèn liên kết</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
