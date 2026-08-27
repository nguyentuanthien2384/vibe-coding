import Image from 'next/image';
import Link from 'next/link';
import { BlogPostListItem } from '@/types/blog';

export interface BlogCardProps {
  post: BlogPostListItem;
  priority?: boolean;
}

const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatViews = (views: number): string => {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return String(views);
};

export const BlogCard = ({ post, priority = false }: BlogCardProps) => {
  return (
    <Link href={`/blog/${post.slug}`} className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-orange-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      {/* Image Wrapper */}
      <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
        <Image
          src={post.thumbnail}
          alt={post.title}
          fill
          priority={priority}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Category Pill */}
        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/90 backdrop-blur-sm text-orange-600 shadow-sm">
          {post.category.icon && <span className="mr-1">{post.category.icon}</span>}
          {post.category.name}
        </span>
        {/* Reading Time Badge */}
        <span className="absolute bottom-3 right-3 z-10 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-900/70 text-white backdrop-blur-sm flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {post.readTimeMinutes} phút đọc
        </span>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed">
          {post.summary}
        </p>

        {/* Footer Row */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          {/* Author Block */}
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            {post.author.avatarUrl && (
              <Image
                src={post.author.avatarUrl}
                alt={post.author.fullName}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover"
              />
            )}
            <span>{post.author.fullName}</span>
          </div>
          {/* Views Count */}
          <div className="flex items-center gap-1 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{formatViews(post.views)}</span>
            <span className="ml-2">{formatDate(post.publishedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
