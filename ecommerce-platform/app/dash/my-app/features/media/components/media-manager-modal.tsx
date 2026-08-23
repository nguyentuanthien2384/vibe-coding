'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Search,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Edit2,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { uploadApi, MediaItem } from '@/lib/upload-api';
import { getImageUrl } from '@/lib/image-url';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/components/ui/toast';
import EditMediaModal from './edit-media-modal';
import MediaPreviewModal from './media-preview-modal';

export interface SelectedImagePayload {
  url: string;
  alt: string;
  title: string;
  filename?: string;
}

interface MediaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (payload: SelectedImagePayload) => void;
  title?: string;
  initialAlt?: string;
  initialTitle?: string;
  selectButtonText?: string;
}

export default function MediaManagerModal({
  isOpen,
  onClose,
  onSelectImage,
  title = 'Quản lý Media',
  initialAlt = '',
  initialTitle = '',
  selectButtonText = 'Chèn ảnh vào Editor',
}: MediaManagerModalProps) {
  const { showToast } = useToast();

  // Active Top Tab: 'library' (grid) | 'upload' | 'url'
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');

  // Media Library State
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Selected Item in Library
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  // Image Insertion Config Fields
  const [altText, setAltText] = useState(initialAlt);
  const [captionTitle, setCaptionTitle] = useState(initialTitle);

  // Direct URL Tab State
  const [directUrl, setDirectUrl] = useState('');
  const [isDirectUrlValid, setIsDirectUrlValid] = useState<boolean | null>(null);

  // Sub-Modals: Edit & Preview
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Upload Tab States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickUploadInputRef = useRef<HTMLInputElement>(null);

  // Fetch Media List
  const fetchMediaList = useCallback(
    async (page = 1, search = '') => {
      setIsLoading(true);
      try {
        const res = await uploadApi.getMediaList({ page, limit: 30, search });
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

  // Fetch media when modal opens or search/page changes
  useEffect(() => {
    if (isOpen) {
      fetchMediaList(currentPage, debouncedSearch);
    }
  }, [isOpen, currentPage, debouncedSearch, fetchMediaList]);

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setAltText(initialAlt);
      setCaptionTitle(initialTitle);
      setActiveTab('library');
    }
  }, [isOpen, initialAlt, initialTitle]);

  if (!isOpen) return null;

  // Handle Quick Upload (from file input or drop)
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
    setUploadProgress(30);

    try {
      setUploadProgress(70);
      const res = await uploadApi.uploadImage(file);
      setUploadProgress(100);
      showToast('success', 'Tải ảnh lên thành công!');

      // Automatically select the newly uploaded item
      const newItem: MediaItem = {
        filename: res.data.filename,
        url: res.data.url,
        size: file.size,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mimeType: file.type,
        isReferenced: false,
      };

      setSelectedItem(newItem);
      setAltText(file.name.replace(/\.[^/.]+$/, ''));
      setActiveTab('library');
      await fetchMediaList(1, '');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải ảnh lên';
      showToast('error', msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Open Edit Modal for a specific media item
  const handleOpenEdit = (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  // Open Preview Lightbox for a specific media item
  const handleOpenPreview = (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewItem(item);
    setIsPreviewModalOpen(true);
  };

  // Handle Quick Delete for a specific media item
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

  // Handle Item Updated from EditMediaModal
  const handleItemUpdated = (updated: MediaItem) => {
    setMediaList((prev) =>
      prev.map((item) => (item.filename === editingItem?.filename ? updated : item)),
    );
    if (selectedItem?.filename === editingItem?.filename) {
      setSelectedItem(updated);
    }
    fetchMediaList(currentPage, debouncedSearch);
  };

  // Handle Item Deleted from EditMediaModal
  const handleItemDeleted = (filename: string) => {
    setMediaList((prev) => prev.filter((item) => item.filename !== filename));
    if (selectedItem?.filename === filename) {
      setSelectedItem(null);
    }
    fetchMediaList(currentPage, debouncedSearch);
  };

  // Confirm Selection and Insert into Editor / Parent form
  const handleInsertSelected = () => {
    if (!selectedItem) {
      showToast('warning', 'Vui lòng chọn một hình ảnh');
      return;
    }

    onSelectImage({
      url: selectedItem.url,
      alt: altText.trim() || selectedItem.filename.replace(/\.[^/.]+$/, ''),
      title: captionTitle.trim(),
      filename: selectedItem.filename,
    });

    onClose();
  };

  // Insert from Direct URL
  const handleInsertDirectUrl = () => {
    if (!directUrl.trim()) {
      showToast('warning', 'Vui lòng nhập URL hình ảnh');
      return;
    }

    onSelectImage({
      url: directUrl.trim(),
      alt: altText.trim() || 'Hình ảnh',
      title: captionTitle.trim(),
    });

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-5xl h-[88vh] max-h-[760px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center text-[#4880FF] border border-blue-100">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h2>
                <p className="text-xs text-slate-400">
                  Thư viện hình ảnh sản phẩm & nội dung ({totalItems} ảnh)
                </p>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-2">
              <input
                ref={quickUploadInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => quickUploadInputRef.current?.click()}
                disabled={isUploading}
                className="px-3.5 py-1.5 bg-[#4880FF] hover:bg-blue-600 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm shadow-blue-200 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Tải ảnh lên</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation & Search Subheader */}
          <div className="px-6 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between shrink-0 flex-wrap gap-2">
            {/* Tabs */}
            <div className="flex items-center bg-gray-200/70 p-1 rounded-xl text-xs font-bold gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'library'
                    ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 text-[#4880FF]" />
                <span>Thư viện ({totalItems})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Tải tệp mới</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>URL liên kết</span>
              </button>
            </div>

            {/* Search and Refresh */}
            {activeTab === 'library' && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên ảnh..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl w-48 sm:w-60 focus:outline-none focus:ring-2 focus:ring-[#4880FF] text-gray-700 font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fetchMediaList(currentPage, debouncedSearch)}
                  className="p-2 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl transition-all cursor-pointer"
                  title="Làm mới danh sách"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#4880FF]' : ''}`} />
                </button>
              </div>
            )}
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* TAB 1: MEDIA LIBRARY (CLEAN SQUARE GRID) */}
            {activeTab === 'library' && (
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-gray-400 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4880FF]" />
                    <p className="text-xs font-semibold">Đang tải thư viện media...</p>
                  </div>
                ) : mediaList.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center text-gray-400 gap-3">
                    <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">Chưa có hình ảnh nào</p>
                    <p className="text-xs text-gray-400 max-w-xs">
                      {searchQuery
                        ? `Không tìm thấy file nào khớp với "${searchQuery}".`
                        : 'Thư viện hiện đang trống. Hãy tải ảnh lên để bắt đầu sử dụng.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => quickUploadInputRef.current?.click()}
                      className="mt-2 px-4 py-2 bg-[#4880FF] text-white hover:bg-blue-600 font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tải ảnh mới lên</span>
                    </button>
                  </div>
                ) : (
                  /* VISUAL SQUARE GRID MATCHING USER SCREENSHOT */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 auto-rows-max">
                    {mediaList.map((item) => {
                      const isSelected = selectedItem?.filename === item.filename;
                      const fullUrl = getImageUrl(item.url);

                      return (
                        <div
                          key={item.filename}
                          onClick={() => {
                            setSelectedItem(item);
                            if (!altText) {
                              setAltText(item.filename.replace(/\.[^/.]+$/, ''));
                            }
                          }}
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

                          {/* Hover Action Bar (Zoom, Edit, Delete) */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-1.5 p-2 rounded-2xl backdrop-blur-[2px]">
                            {/* Preview Lightbox */}
                            <button
                              type="button"
                              onClick={(e) => handleOpenPreview(item, e)}
                              className="p-2 bg-white/90 hover:bg-white text-slate-800 hover:text-[#4880FF] rounded-xl shadow-md transition-transform hover:scale-110 cursor-pointer"
                              title="Xem ảnh lớn (Zoom)"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit / Sửa */}
                            <button
                              type="button"
                              onClick={(e) => handleOpenEdit(item, e)}
                              className="p-2 bg-white/90 hover:bg-white text-slate-800 hover:text-[#4880FF] rounded-xl shadow-md transition-transform hover:scale-110 cursor-pointer"
                              title="Sửa thông tin / Đổi tên"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete / Xóa */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteItem(item, e)}
                              className="p-2 bg-white/90 hover:bg-white text-red-600 hover:text-red-700 rounded-xl shadow-md transition-transform hover:scale-110 cursor-pointer"
                              title="Xóa ảnh"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: UPLOAD NEW FILES */}
            {activeTab === 'upload' && (
              <div className="flex-1 p-8 flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />

                {/* Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    handleFileUpload(e.dataTransfer.files);
                  }}
                  className={`w-full p-10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-[#4880FF] bg-blue-50/50 scale-[1.01]'
                      : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-blue-300'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-[#4880FF] flex items-center justify-center shadow-inner">
                    <Upload className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-800">
                      Kéo thả hình ảnh vào đây hoặc nhấp để chọn tệp
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Hỗ trợ định dạng PNG, JPG, JPEG, WebP, SVG, GIF (Tối đa 5MB)
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-5 py-2.5 bg-[#4880FF] text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-200 hover:bg-blue-600 transition-all"
                  >
                    Chọn file từ máy tính
                  </button>
                </div>

                {isUploading && (
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>Đang tải tệp lên máy chủ...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4880FF] transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DIRECT URL */}
            {activeTab === 'url' && (
              <div className="flex-1 p-8 flex flex-col items-center justify-center max-w-lg mx-auto space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
                  <LinkIcon className="w-7 h-7" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-extrabold text-gray-800">Chèn hình ảnh từ URL trực tiếp</h3>
                  <p className="text-xs text-gray-400">
                    Nhập đường link trực tiếp của ảnh (Unsplash, CDN ngoài, v.v.)
                  </p>
                </div>

                <div className="w-full space-y-3">
                  <input
                    type="url"
                    value={directUrl}
                    onChange={(e) => {
                      setDirectUrl(e.target.value);
                      setIsDirectUrlValid(null);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]"
                  />

                  {directUrl && (
                    <div className="w-full h-44 rounded-2xl border border-gray-200 bg-gray-50 p-2 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={directUrl}
                        alt="URL Preview"
                        onLoad={() => setIsDirectUrlValid(true)}
                        onError={() => setIsDirectUrlValid(false)}
                        className="max-h-full object-contain rounded-xl"
                      />
                    </div>
                  )}

                  {isDirectUrlValid === false && (
                    <p className="text-xs text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Không thể tải ảnh từ URL này. Vui lòng kiểm tra lại đường dẫn.
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={!directUrl.trim() || isDirectUrlValid === false}
                    onClick={handleInsertDirectUrl}
                    className="w-full py-3 bg-[#4880FF] hover:bg-blue-600 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{selectButtonText}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Bar for Selection & Pagination */}
            {activeTab === 'library' && (
              <div className="p-4 bg-gray-50/90 border-t border-gray-200/80 flex items-center justify-between gap-4 flex-wrap shrink-0">
                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Trang {currentPage} / {totalPages || 1}
                  </span>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={currentPage <= 1 || isLoading}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="p-1.5 bg-white border border-gray-200 text-xs font-bold rounded-lg disabled:opacity-30 hover:bg-gray-100 transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={currentPage >= totalPages || isLoading}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="p-1.5 bg-white border border-gray-200 text-xs font-bold rounded-lg disabled:opacity-30 hover:bg-gray-100 transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Selected Item Insertion Action Bar */}
                {selectedItem ? (
                  <div className="flex items-center gap-3 flex-wrap animate-in fade-in">
                    {/* Thumbnail of selected item */}
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl border border-blue-200 bg-white overflow-hidden p-0.5 shrink-0 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(selectedItem.url)}
                          alt={selectedItem.filename}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                      <div className="text-xs truncate max-w-[140px] hidden sm:block">
                        <span className="font-bold text-gray-800 block truncate" title={selectedItem.filename}>
                          {selectedItem.filename}
                        </span>
                      </div>
                    </div>

                    {/* Alt Text Quick Input */}
                    <input
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Alt text (SEO)..."
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs w-36 sm:w-44 focus:outline-none focus:ring-2 focus:ring-[#4880FF] text-gray-700"
                    />

                    {/* Submit Select Button */}
                    <button
                      type="button"
                      onClick={handleInsertSelected}
                      className="px-4 py-2 bg-[#4880FF] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{selectButtonText}</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">
                    Nhấp vào một hình ảnh để chọn và chèn
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
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
    </>
  );
}
