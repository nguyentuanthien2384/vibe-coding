'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Loader2, Link as LinkIcon } from 'lucide-react';
import { uploadApi } from '../../lib/upload-api';
import { getImageUrl } from '../../lib/image-url';

export interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file quá lớn (tối đa 5MB)');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Chỉ chấp nhận file ảnh (PNG, JPG, WebP, SVG)');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const res = await uploadApi.uploadImage(file);
      onChange(res.data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải ảnh thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          Ảnh Icon
        </label>
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              mode === 'upload'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UploadCloud className="w-3 h-3" /> Upload file
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              mode === 'url'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LinkIcon className="w-3 h-3" /> URL Link
          </button>
        </div>
      </div>

      {/* Main Content Box */}
      {value ? (
        // Preview State
        (() => {
          const rawVal = value.trim();
          const isImage =
            rawVal.startsWith('/') ||
            rawVal.startsWith('http://') ||
            rawVal.startsWith('https://') ||
            rawVal.startsWith('data:') ||
            rawVal.includes('/uploads/') ||
            /\.(png|jpg|jpeg|webp|svg)($|\?)/i.test(rawVal);

          const previewUrl = getImageUrl(rawVal);

          return (
            <div className="relative group flex items-center gap-4 p-3 border border-gray-200 rounded-2xl bg-gray-50/50">
              <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                {isImage && previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Icon preview"
                    width={48}
                    height={48}
                    unoptimized
                    className="object-contain p-1"
                    onError={() => setError('Không thể tải ảnh từ URL này')}
                  />
                ) : (
                  <span className="text-2xl">{value}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-700 truncate">{value}</p>
                <p className="text-[11px] text-green-600 font-semibold mt-0.5">✓ Icon đã chọn</p>
              </div>
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={disabled || isUploading}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Xóa ảnh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })()
      ) : mode === 'upload' ? (
        // Upload File Drag & Drop State
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
              : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50/80 bg-gray-50/30'
          } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            disabled={disabled || isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2 text-blue-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-xs font-bold">Đang tải ảnh lên server...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700">
                  Kéo thả file ảnh vào đây hoặc{' '}
                  <span className="text-blue-600 hover:underline">kích để chọn</span>
                </p>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  Hỗ trợ PNG, JPG, WebP, SVG (Tối đa 5MB)
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Manual URL Input State
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/icon.png"
            disabled={disabled}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50"
          />
        </div>
      )}

      {/* Error text */}
      {error && <p className="text-xs font-semibold text-red-500 mt-1">{error}</p>}
    </div>
  );
};
