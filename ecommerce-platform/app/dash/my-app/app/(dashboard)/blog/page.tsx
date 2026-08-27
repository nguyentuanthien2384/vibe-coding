import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import BlogListPageClient from '../../../features/blog/components/blog-list-page-client';

export const metadata = {
  title: 'Quản lý Bài viết & Tin tức | Admin Dashboard',
  description: 'Quản lý toàn bộ bài viết blog, tin tức và nội dung ẩm thực trên TechBite',
};

export default function BlogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#4880FF]" />
          <span className="text-sm font-medium">Đang tải danh sách bài viết...</span>
        </div>
      }
    >
      <BlogListPageClient />
    </Suspense>
  );
}
