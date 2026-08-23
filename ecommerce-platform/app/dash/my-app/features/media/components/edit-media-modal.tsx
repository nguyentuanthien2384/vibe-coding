'use client';

import { useState } from 'react';
import { X, Save, Trash2, Copy, Check, Info, FileText, Calendar, HardDrive, ShieldCheck, AlertTriangle } from 'lucide-react';
import { MediaItem, uploadApi } from '@/lib/upload-api';
import { getImageUrl } from '@/lib/image-url';
import { useToast } from '@/components/ui/toast';

interface EditMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItem: MediaItem | null;
  onUpdated: (updatedItem: MediaItem) => void;
  onDeleted: (filename: string) => void;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export default function EditMediaModal({
  isOpen,
  onClose,
  mediaItem,
  onUpdated,
  onDeleted,
}: EditMediaModalProps) {
  const { showToast } = useToast();
  const [newFilename, setNewFilename] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync state when modal opens
  const [prevMediaFilename, setPrevMediaFilename] = useState<string | null>(null);
  if (mediaItem && mediaItem.filename !== prevMediaFilename) {
    setPrevMediaFilename(mediaItem.filename);
    setNewFilename(mediaItem.filename);
    setShowDeleteConfirm(false);
  }

  if (!isOpen || !mediaItem) return null;

  const fullUrl = getImageUrl(mediaItem.url);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    showToast('success', 'Đã sao chép đường dẫn hình ảnh');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newFilename.trim();
    if (!cleanName) {
      showToast('warning', 'Vui lòng nhập tên file');
      return;
    }
    if (cleanName === mediaItem.filename) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      const res = await uploadApi.renameMedia(mediaItem.filename, cleanName);
      showToast('success', res.message || 'Đổi tên file thành công');
      onUpdated({
        ...mediaItem,
        filename: res.data.filename,
        url: res.data.url,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đổi tên file';
      showToast('error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (force = false) => {
    setIsDeleting(true);
    try {
      await uploadApi.deleteMedia(mediaItem.filename, force);
      showToast('success', `Đã xóa tập tin '${mediaItem.filename}'`);
      onDeleted(mediaItem.filename);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa file media';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight">Chi tiết & Sửa thông tin Media</h3>
              <p className="text-[11px] text-slate-400">Xem metadata, đổi tên hoặc xóa tệp</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Image Preview Box */}
          <div className="w-full h-56 bg-gray-50 rounded-2xl border border-gray-200 p-3 flex items-center justify-center relative overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullUrl}
              alt={mediaItem.filename}
              className="w-full h-full object-contain rounded-xl"
            />
            {mediaItem.isReferenced && (
              <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Đang dùng trong sản phẩm / danh mục
              </span>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSaveRename} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#4880FF]" />
                <span>Tên file (Filename)</span>
              </label>
              <input
                type="text"
                value={newFilename}
                onChange={(e) => setNewFilename(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]"
                placeholder="VD: san-pham-1.webp"
              />
            </div>

            {/* Metadata Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs">
              <div>
                <span className="text-gray-400 font-medium block text-[11px]">Dung lượng:</span>
                <span className="font-bold text-gray-700 flex items-center gap-1 mt-0.5">
                  <HardDrive className="w-3 h-3 text-gray-400" />
                  {formatBytes(mediaItem.size)}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block text-[11px]">Định dạng:</span>
                <span className="font-bold text-gray-700 mt-0.5 block">{mediaItem.mimeType}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block text-[11px]">Ngày tải lên:</span>
                <span className="font-semibold text-gray-700 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {formatDate(mediaItem.createdAt)}
                </span>
              </div>
            </div>

            {/* URL Copy Bar */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Đường dẫn hình ảnh (URL)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={fullUrl}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-500 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="px-3.5 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      <span>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Delete confirmation message if requested */}
            {showDeleteConfirm && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 text-red-700 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Xác nhận xóa hình ảnh này khỏi máy chủ?</span>
                </div>
                <p className="text-[11px] text-red-600">
                  {mediaItem.isReferenced
                    ? 'Ảnh này đang được dùng trong sản phẩm hoặc danh mục. Xóa có thể làm mất ảnh hiển thị trên website.'
                    : 'Hành động này không thể khôi phục sau khi xóa.'}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleDelete(true)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa vĩnh viễn'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-gray-100">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa ảnh này</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSaving || newFilename.trim() === mediaItem.filename}
                  className="px-4 py-2 bg-[#4880FF] hover:bg-blue-600 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu tên mới'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
