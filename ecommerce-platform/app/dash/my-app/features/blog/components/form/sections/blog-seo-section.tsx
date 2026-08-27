import { Search } from 'lucide-react';
import GoogleSerpPreviewCard from '../google-serp-preview-card';

interface BlogSeoSectionProps {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  onChangeTitle: (val: string) => void;
  onChangeDescription: (val: string) => void;
}

const META_TITLE_MIN = 50;
const META_TITLE_MAX = 60;
const META_DESC_MIN = 150;
const META_DESC_MAX = 160;

function getCounterColor(val: number, min: number, max: number): string {
  if (val === 0) return 'text-gray-400';
  if (val < min) return 'text-amber-500';
  if (val > max) return 'text-red-500';
  return 'text-emerald-600';
}

export default function BlogSeoSection({
  metaTitle,
  metaDescription,
  slug,
  onChangeTitle,
  onChangeDescription,
}: BlogSeoSectionProps) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-[#4880FF]" />
        <h2 className="text-sm font-bold text-[#202224]">SEO & Google Preview</h2>
      </div>

      {/* Meta Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide" htmlFor="meta-title">
            Meta Title
          </label>
          <span className={`text-xs font-semibold ${getCounterColor(metaTitle.length, META_TITLE_MIN, META_TITLE_MAX)}`}>
            {metaTitle.length}/{META_TITLE_MAX}
          </span>
        </div>
        <input
          id="meta-title"
          type="text"
          value={metaTitle}
          onChange={(e) => onChangeTitle(e.target.value)}
          maxLength={70}
          placeholder="Tiêu đề SEO (50–60 ký tự lý tưởng)"
          className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#202224] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all"
        />
        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              metaTitle.length > META_TITLE_MAX
                ? 'bg-red-500'
                : metaTitle.length >= META_TITLE_MIN
                ? 'bg-emerald-500'
                : 'bg-amber-400'
            }`}
            style={{ width: `${Math.min(100, (metaTitle.length / META_TITLE_MAX) * 100)}%` }}
          />
        </div>
      </div>

      {/* Meta Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide" htmlFor="meta-desc">
            Meta Description
          </label>
          <span className={`text-xs font-semibold ${getCounterColor(metaDescription.length, META_DESC_MIN, META_DESC_MAX)}`}>
            {metaDescription.length}/{META_DESC_MAX}
          </span>
        </div>
        <textarea
          id="meta-desc"
          value={metaDescription}
          onChange={(e) => onChangeDescription(e.target.value)}
          maxLength={180}
          rows={3}
          placeholder="Mô tả SEO (150–160 ký tự lý tưởng)"
          className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#202224] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all resize-none leading-relaxed"
        />
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              metaDescription.length > META_DESC_MAX
                ? 'bg-red-500'
                : metaDescription.length >= META_DESC_MIN
                ? 'bg-emerald-500'
                : 'bg-amber-400'
            }`}
            style={{ width: `${Math.min(100, (metaDescription.length / META_DESC_MAX) * 100)}%` }}
          />
        </div>
      </div>

      {/* Google SERP Preview */}
      <div className="space-y-1.5">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Xem trước Google</p>
        <GoogleSerpPreviewCard
          metaTitle={metaTitle}
          metaDescription={metaDescription}
          slug={slug}
        />
      </div>
    </div>
  );
}
