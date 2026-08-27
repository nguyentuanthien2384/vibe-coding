'use client';

import { Calendar } from 'lucide-react';
import { PostStatus } from '../../../types/blog.types';

interface BlogPublishingSectionProps {
  status: PostStatus;
  scheduledAt: string | null;
  onStatusChange: (status: PostStatus) => void;
  onScheduledAtChange: (val: string | null) => void;
}

const STATUS_OPTIONS: { value: PostStatus; label: string; description: string; color: string }[] = [
  {
    value: 'DRAFT',
    label: 'Bản nháp',
    description: 'Chỉ bạn mới thấy bài viết này',
    color: 'border-slate-300 bg-slate-50 text-slate-700',
  },
  {
    value: 'PUBLISHED',
    label: 'Xuất bản ngay',
    description: 'Hiển thị công khai ngay lập tức',
    color: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  },
  {
    value: 'SCHEDULED',
    label: 'Lên lịch',
    description: 'Tự động xuất bản vào thời điểm đã chọn',
    color: 'border-blue-300 bg-blue-50 text-blue-700',
  },
  {
    value: 'ARCHIVED',
    label: 'Lưu trữ',
    description: 'Ẩn bài viết khỏi trang chủ',
    color: 'border-amber-300 bg-amber-50 text-amber-700',
  },
];

export default function BlogPublishingSection({
  status,
  scheduledAt,
  onStatusChange,
  onScheduledAtChange,
}: BlogPublishingSectionProps) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      <h2 className="text-sm font-bold text-[#202224]">Trạng thái xuất bản</h2>

      {/* Status options */}
      <div className="space-y-2">
        {STATUS_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
              status === opt.value
                ? `${opt.color} ring-1 ring-offset-0`
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="post-status"
              value={opt.value}
              checked={status === opt.value}
              onChange={() => onStatusChange(opt.value)}
              className="mt-0.5 flex-shrink-0 accent-[#4880FF]"
            />
            <div>
              <p className="text-xs font-bold text-[#202224]">{opt.label}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{opt.description}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Scheduled Date Picker */}
      {status === 'SCHEDULED' && (
        <div className="space-y-1.5 pt-1">
          <label
            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wide"
            htmlFor="scheduled-at"
          >
            <Calendar className="w-3.5 h-3.5" />
            Thời gian xuất bản
          </label>
          <input
            id="scheduled-at"
            type="datetime-local"
            value={scheduledAt ?? ''}
            onChange={(e) => onScheduledAtChange(e.target.value || null)}
            className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#202224] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all"
          />
        </div>
      )}
    </div>
  );
}
