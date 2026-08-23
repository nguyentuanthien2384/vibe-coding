'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Image as ImageIcon,
  Link as LinkIcon,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ExternalLink,
  Trash2,
  Save,
  FolderOpen,
  Eye,
} from 'lucide-react';
import { getImageUrl } from '@/lib/image-url';

export interface ImageAttributes {
  src: string;
  alt: string;
  title: string;
  width: string; // '25%' | '50%' | '75%' | '100%' | '300px' etc.
  align: 'left' | 'center' | 'right';
  href: string;
}

interface ImageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ImageAttributes | null;
  onSave: (updated: ImageAttributes) => void;
  onDelete?: () => void;
  onChangeImage?: () => void;
}

const WIDTH_PRESETS = [
  { label: '25%', value: '25%' },
  { label: '50%', value: '50%' },
  { label: '75%', value: '75%' },
  { label: '100%', value: '100%' },
];

export default function ImageSettingsModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  onDelete,
  onChangeImage,
}: ImageSettingsModalProps) {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [title, setTitle] = useState('');
  const [width, setWidth] = useState('100%');
  const [customWidth, setCustomWidth] = useState('');
  const [isCustomWidth, setIsCustomWidth] = useState(false);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center');
  const [href, setHref] = useState('');

  // Sync state when initialData or modal open status changes
  useEffect(() => {
    if (initialData && isOpen) {
      setSrc(initialData.src || '');
      setAlt(initialData.alt || '');
      setTitle(initialData.title || '');
      const initialWidth = initialData.width || '100%';
      setWidth(initialWidth);
      if (!WIDTH_PRESETS.some((p) => p.value === initialWidth)) {
        setIsCustomWidth(true);
        setCustomWidth(initialWidth);
      } else {
        setIsCustomWidth(false);
        setCustomWidth('');
      }
      setAlign(initialData.align || 'center');
      setHref(initialData.href || '');
    }
  }, [initialData, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !initialData) return null;

  const currentEffectiveWidth = isCustomWidth ? (customWidth.trim() || '100%') : width;
  const fullPreviewUrl = getImageUrl(src);

  const handleSelectWidthPreset = (presetValue: string) => {
    setIsCustomWidth(false);
    setWidth(presetValue);
    setCustomWidth('');
  };

  const handleSave = () => {
    onSave({
      src,
      alt: alt.trim(),
      title: title.trim(),
      width: currentEffectiveWidth,
      align,
      href: href.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 flex items-center justify-center text-blue-400 border border-blue-400/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Cài đặt & Tùy chỉnh hình ảnh</h2>
              <p className="text-xs text-slate-400">
                Thay đổi kích thước, căn lề, thẻ SEO và liên kết cho ảnh
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Live Preview Box with Current Width & Align */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#4880FF]" />
                <span>Xem trước trực tiếp (Live Preview)</span>
              </label>
              {onChangeImage && (
                <button
                  type="button"
                  onClick={onChangeImage}
                  className="text-xs font-bold text-[#4880FF] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Đổi ảnh từ thư viện</span>
                </button>
              )}
            </div>

            <div className="w-full min-h-[160px] max-h-[220px] bg-gray-50 rounded-2xl border border-gray-200 p-4 flex flex-col justify-center overflow-hidden">
              <div
                className={`w-full flex ${
                  align === 'left'
                    ? 'justify-start text-left'
                    : align === 'right'
                    ? 'justify-end text-right'
                    : 'justify-center text-center'
                }`}
              >
                <div style={{ maxWidth: currentEffectiveWidth }} className="w-full flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fullPreviewUrl}
                    alt={alt || 'Preview'}
                    title={title}
                    className="max-h-40 w-auto rounded-xl object-contain shadow-sm border border-gray-200"
                  />
                  {(title || alt) && (
                    <span className="text-[11px] text-gray-500 mt-1 font-medium italic block truncate max-w-full">
                      {title || alt}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 1. Kích thước & Căn lề */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
            {/* Kích thước ảnh (Width) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#202224] flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-[#4880FF]" />
                <span>1. Kích thước hiển thị (Width)</span>
              </label>

              <div className="grid grid-cols-4 gap-1.5">
                {WIDTH_PRESETS.map((p) => {
                  const isSelected = !isCustomWidth && width === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handleSelectWidthPreset(p.value)}
                      className={`py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#4880FF] text-white border-[#4880FF] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Width Toggle/Input */}
              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customWidth}
                    onChange={(e) => {
                      setIsCustomWidth(true);
                      setCustomWidth(e.target.value);
                    }}
                    placeholder="Tùy chỉnh (vd: 350px hoặc 60%)..."
                    className={`flex-1 px-3 py-1.5 bg-white border rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4880FF] ${
                      isCustomWidth ? 'border-[#4880FF] ring-1 ring-blue-100' : 'border-gray-200'
                    }`}
                  />
                  {isCustomWidth && (
                    <button
                      type="button"
                      onClick={() => handleSelectWidthPreset('100%')}
                      className="text-xs text-gray-400 hover:text-gray-600 font-medium"
                    >
                      Mặc định
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Căn lề ảnh (Alignment) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#202224] flex items-center gap-1.5">
                <span>Căn lề (Alignment)</span>
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setAlign('left')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 border cursor-pointer ${
                    align === 'left'
                      ? 'bg-[#4880FF] text-white border-[#4880FF] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Trái</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAlign('center')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 border cursor-pointer ${
                    align === 'center'
                      ? 'bg-[#4880FF] text-white border-[#4880FF] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                  <span>Giữa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAlign('right')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 border cursor-pointer ${
                    align === 'right'
                      ? 'bg-[#4880FF] text-white border-[#4880FF] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                  <span>Phải</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 pt-0.5">
                Vị trí căn chỉnh hình ảnh trong bài viết
              </p>
            </div>
          </div>

          {/* 2. Alt & Title */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-xs font-extrabold text-[#202224] flex items-center gap-1.5 border-b pb-2">
              <ImageIcon className="w-3.5 h-3.5 text-[#4880FF]" />
              <span>2. Thông tin mô tả & SEO (Alt & Title)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">
                  Văn bản thay thế (Alt Text)
                </label>
                <input
                  type="text"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Mô tả hình ảnh cho SEO..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]"
                />
                <p className="text-[10px] text-gray-400">Hiển thị khi ảnh bị lỗi hoặc cho Google bot</p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700">
                  Tiêu đề / Chú thích (Caption)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Chú thích hiển thị bên dưới ảnh..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]"
                />
                <p className="text-[10px] text-gray-400">Hiển thị dòng chú thích chân ảnh</p>
              </div>
            </div>
          </div>

          {/* 3. Link Hyperlink */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-xs font-extrabold text-[#202224] flex items-center gap-1.5 border-b pb-2">
              <LinkIcon className="w-3.5 h-3.5 text-[#4880FF]" />
              <span>3. Bổ sung liên kết (Hyperlink khi nhấp vào ảnh)</span>
            </h3>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={href}
                  onChange={(e) => setHref(e.target.value)}
                  placeholder="https://example.com/khuyen-mai hoặc /products/..."
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]"
                />
                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 hover:bg-blue-50 hover:text-[#4880FF] text-gray-600 rounded-xl text-xs transition-all flex items-center gap-1"
                    title="Mở liên kết thử"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-[10px] text-gray-400">
                Khi người dùng nhấp vào ảnh trên trang web, trình duyệt sẽ mở liên kết này trong tab mới.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="px-3 py-2 text-red-500 hover:bg-red-50 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa ảnh khỏi bài viết</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#4880FF] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
