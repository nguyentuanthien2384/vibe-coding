interface GoogleSerpPreviewCardProps {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  siteName?: string;
  baseUrl?: string;
}

export default function GoogleSerpPreviewCard({
  metaTitle,
  metaDescription,
  slug,
  siteName = 'TechBite · Ẩm thực & Đồ ăn nhanh',
  baseUrl = 'https://techbite.vn',
}: GoogleSerpPreviewCardProps) {
  const displayTitle = metaTitle || 'Tiêu đề bài viết (chưa nhập)';
  const displayDesc = metaDescription || 'Mô tả nội dung bài viết sẽ hiển thị ở đây. Nhập meta description để preview.';
  const displayUrl = `${baseUrl} › blog › ${slug || 'ten-bai-viet'}`;

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-inner space-y-1.5">
      {/* Chrome-like search result header */}
      <div className="flex items-center gap-2 text-xs text-[#202124]">
        <div className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">
          T
        </div>
        <div className="min-w-0">
          <p className="font-medium text-[#202124] text-xs truncate">{siteName}</p>
          <p className="text-gray-500 text-[11px] truncate">{displayUrl}</p>
        </div>
      </div>

      {/* SERP Title */}
      <p className="text-[17px] font-normal text-[#1a0dab] hover:underline cursor-pointer line-clamp-1 leading-snug">
        {displayTitle}
      </p>

      {/* SERP Description */}
      <p className="text-[13px] text-[#4d5156] line-clamp-2 leading-relaxed">
        {displayDesc}
      </p>
    </div>
  );
}
