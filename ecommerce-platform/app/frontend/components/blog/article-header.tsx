import Image from 'next/image';
import Link from 'next/link';
import { BlogPostDetail } from '@/types/blog';
import { SocialShareBar } from './social-share-bar';

export interface ArticleHeaderProps {
  post: BlogPostDetail;
}

export const ArticleHeader = ({ post }: ArticleHeaderProps) => {
  const publishDate = new Date(post.publishedAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Category & Date Row */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
        <Link
          href={`/blog?category=${post.category.slug}`}
          className="hover:underline flex items-center gap-1"
        >
          {post.category.icon && <span>{post.category.icon}</span>}
          {post.category.name}
        </Link>
        <span>·</span>
        <span className="text-slate-400 normal-case font-medium">{publishDate}</span>
      </div>

      {/* Main Heading H1 */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
        {post.title}
      </h1>

      {/* Summary Lead */}
      {post.summary && (
        <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed italic border-l-4 border-orange-500 pl-4 py-1">
          {post.summary}
        </p>
      )}

      {/* Author & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-b border-slate-200 pb-6">
        {/* Author Info */}
        <div className="flex items-center gap-3">
          {post.author.avatarUrl && (
            <Image
              src={post.author.avatarUrl}
              alt={post.author.fullName}
              width={44}
              height={44}
              className="w-11 h-11 rounded-full object-cover border-2 border-orange-200"
            />
          )}
          <div>
            <div className="text-sm font-bold text-slate-900">{post.author.fullName}</div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>{post.author.role}</span>
              <span>·</span>
              <span>{post.readTimeMinutes} phút đọc</span>
              <span>·</span>
              <span>{post.views} lượt xem</span>
            </div>
          </div>
        </div>

        {/* Social Share Bar */}
        <SocialShareBar title={post.title} />
      </div>
    </div>
  );
};
