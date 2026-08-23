'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Search,
  RefreshCw,
  Trash2,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Edit2,
  Plus,
  Copy,
  FolderOpen,
  Calendar,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';
import { uploadApi, MediaItem } from '@/lib/upload-api';
import { getImageUrl } from '@/lib/image-url';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/components/ui/toast';
import EditMediaModal from './edit-media-modal';
import MediaPreviewModal from './media-preview-modal';

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function MediaPageClient() {
  const { showToast } = useToast();

  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Selected item for info bar
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  // Modals
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Upload
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMediaList = useCallback(
    async (page = 1, search = '') => {
      setIsLoading(true);
      try {
        const res = await uploadApi.getMediaList({ page, limit: 36, search });
        setMediaList(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.total);
        setCurrentPage(res.pagination.page);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể tải danh sách media';
        showToast('error', msg);
      } finally {
        setIsLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    fetchMediaList(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, fetchMediaList]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showToast('warning', 'Chỉ chấp nhận file ảnh (PNG, JPG, WebP, SVG, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('warning', 'Dung lượng ảnh tối đa 5MB');
      return;
    }

    setIsUploading(true);
    try {
      await uploadApi.uploadImage(file);
      showToast('success', 'Tải ảnh lên thành công!');
      await fetchMediaList(1, '');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải ảnh lên';
      showToast('error', msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenEdit = (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleOpenPreview = (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewItem(item);
    setIsPreviewModalOpen(true);
  };

  const handleDeleteItem = async (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa ảnh '${item.filename}'?`);
    if (!confirmed) return;

    try {
      await uploadApi.deleteMedia(item.filename, true);
      showToast('success', `Đã xóa ảnh '${item.filename}'`);
      if (selectedItem?.filename === item.filename) {
        setSelectedItem(null);
      }
      await fetchMediaList(currentPage, debouncedSearch);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa file media';
      showToast('error', msg);
    }
  };

  const handleItemUpdated = (updated: MediaItem) => {
    setMediaList((prev) =>
      prev.map((item) => (item.filename === editingItem?.filename ? updated : item)),
    );
    if (selectedItem?.filename === editingItem?.filename) {
      setSelectedItem(updated);
    }
    fetchMediaList(currentPage, debouncedSearch);
  };

  const handleItemDeleted = (filename: string) => {
    setMediaList((prev) => prev.filter((item) => item.filename !== filename));
    if (selectedItem?.filename === filename) {
      setSelectedItem(null);
    }
    fetchMediaList(currentPage, debouncedSearch);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-[#4880FF] flex items-center justify-center border border-blue-100">
              <ImageIcon className="w-5 h-5" />
            </span>
            <span>Quản lý Media & Thư viện Ảnh</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng cộng <span className="font-bold text-slate-800">{totalItems}</span> tệp hình ảnh đã được lưu trữ trong hệ thống
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2.5 bg-[#4880FF] hover:bg-blue-600 text-white rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-md shadow-blue-200 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 stroke-[3]" />
            )}
            <span>Tải ảnh mới</span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên file..."
              className="pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-2xl w-56 sm:w-64 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] text-gray-800 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => fetchMediaList(currentPage, debouncedSearch)}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-2xl transition-all cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#4880FF]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid Content Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[500px] flex flex-col justify-between">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-gray-400 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#4880FF]" />
            <p className="text-xs font-bold text-gray-500">Đang tải danh sách media...</p>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center text-gray-400 gap-3">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300">
              <ImageIcon className="w-10 h-10" />
            </div>
            <p className="text-base font-extrabold text-slate-800">Không tìm thấy hình ảnh nào</p>
            <p className="text-xs text-gray-400 max-w-sm">
              {searchQuery
                ? `Không có file nào khớp với từ khóa "${searchQuery}".`
                : 'Thư viện hiện chưa có ảnh nào. Bạn có thể bấm nút Tải ảnh mới ở trên.'}
            </p>
          </div>
        ) : (
          /* Square Grid matching screenshot */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4.5 auto-rows-max">
            {mediaList.map((item) => {
              const isSelected = selectedItem?.filename === item.filename;
              const fullUrl = getImageUrl(item.url);

              return (
                <div
                  key={item.filename}
                  onClick={() => setSelectedItem(item)}
                  className={`group relative rounded-2xl border bg-white overflow-hidden cursor-pointer transition-all duration-200 aspect-square flex items-center justify-center p-2 shadow-xs ${
                    isSelected
                      ? 'border-transparent ring-4 ring-[#4880FF] ring-offset-2 shadow-lg bg-blue-50/20 scale-[0.98]'
                      : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  {/* Image Render */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fullUrl}
                    alt={item.filename}
                    className="w-full h-full object-contain rounded-xl transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Selected Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 bg-[#4880FF] text-white p-1 rounded-full shadow-md z-10 animate-in zoom-in-75">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}

                  {/* Hover Action Bar */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-1.5 p-2 rounded-2xl backdrop-blur-[2px]">
                    <button
                      type="button"
                      onClick={(e) => handleOpenPreview(item, e)}
                      className="p-2 bg-white/90 hover:bg-white text-slate-800 hover:text-[#4880FF] rounded-xl shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="Xem ảnh lớn (Zoom)"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(item, e)}
                      className="p-2 bg-white/90 hover:bg-white text-slate-800 hover:text-[#4880FF] rounded-xl shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="Sửa thông tin / Đổi tên"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(item, e)}
                      className="p-2 bg-white/90 hover:bg-white text-red-600 hover:text-red-700 rounded-xl shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Trang {currentPage} / {totalPages} ({totalItems} ảnh)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-2 bg-white border border-gray-200 text-xs font-bold rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trang trước</span>
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-2 bg-white border border-gray-200 text-xs font-bold rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Trang sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sub-Modals */}
      <EditMediaModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        mediaItem={editingItem}
        onUpdated={handleItemUpdated}
        onDeleted={handleItemDeleted}
      />

      <MediaPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewItem(null);
        }}
        mediaItem={previewItem}
      />
    </div>
  );
}
