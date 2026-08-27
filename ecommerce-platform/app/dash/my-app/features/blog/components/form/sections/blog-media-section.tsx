'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ImageIcon, Link as LinkIcon, X, Upload, Loader2 } from 'lucide-react';
import { blogApi } from '../../../../../lib/blog-api';
import { getImageUrl } from '../../../../../lib/image-url';

interface BlogMediaSectionProps {
  thumbnail: string;
  onChange: (url: string) => void;
}

export default function BlogMediaSection({ thumbnail, onChange }: BlogMediaSectionProps) {
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlMode(false);
      setUrlInput('');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await blogApi.uploadThumbnail(file);
      if (data?.url) {
        onChange(data.url);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Tải ảnh lên thất bại');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const displayThumbnail = thumbnail ? getImageUrl(thumbnail) : '';

  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      <h2 className="text-sm font-bold text-[#202224]">Ảnh đại diện (Thumbnail)</h2>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preview or Dropzone */}
      {thumbnail ? (
        <div className="relative group">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            <Image src={displayThumbnail} alt="Thumbnail preview" fill className="object-cover" unoptimized />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-gray-500 hover:text-red-500 rounded-xl shadow-sm border border-gray-200 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-full aspect-video rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#4880FF] transition-colors bg-gray-50/50 flex flex-col items-center justify-center gap-3 cursor-pointer group"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#4880FF]" />
              <p className="text-xs font-semibold text-gray-500">Đang tải ảnh lên...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#4880FF] transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600">Bấm để tải ảnh lên</p>
                <p className="text-xs text-gray-400">Tỉ lệ 16:9 · JPG, PNG, WEBP tối đa 5MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* URL Input toggle */}
      {urlMode ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              placeholder="https://example.com/image.jpg"
              autoFocus
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50/70 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2.5 text-sm font-bold text-white bg-[#4880FF] hover:bg-blue-600 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Áp dụng
          </button>
          <button
            type="button"
            onClick={() => setUrlMode(false)}
            className="px-3 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
          >
            Hủy
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1 py-2 text-xs font-semibold text-gray-600 hover:text-[#4880FF] hover:bg-blue-50 rounded-xl border border-dashed border-gray-200 hover:border-[#4880FF] transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            Chọn file từ máy
          </button>
          <button
            type="button"
            onClick={() => setUrlMode(true)}
            className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-[#4880FF] hover:bg-blue-50 rounded-xl border border-dashed border-gray-200 hover:border-[#4880FF] transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Dán URL
          </button>
        </div>
      )}
    </div>
  );
}
