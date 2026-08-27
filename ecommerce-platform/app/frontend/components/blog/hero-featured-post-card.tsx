import Image from 'next/image';
import Link from 'next/link';
import { BlogPostListItem } from '@/types/blog';

export interface HeroFeaturedPostCardProps {
  post: BlogPostListItem;
}

export const HeroFeaturedPostCard = ({ post }: HeroFeaturedPostCardProps) => {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="relative overflow-hidden rounded-3xl bg-slate-900 text-white group cursor-pointer aspect-[16/10] md:aspect-[16/9] lg:aspect-auto h-full min-h-[420px] shadow-lg hover:shadow-2xl transition-all duration-300 block"
    >
      {/* Background Image */}
      <Image
        src={post.thumbnail}
        alt={post.title}
        fill
        priority
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        sizes="(max-width: 1024px) 100vw, 58vw"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
        {/* Badges Row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-600 text-white shadow-md shadow-orange-600/30">
            🔥 Nổi Bật
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30">
            {post.category.icon && <span className="mr-1">{post.category.icon}</span>}
            {post.category.name}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight line-clamp-2 group-hover:text-orange-300 transition-colors">
          {post.title}
        </h2>

        {/* Summary */}
        <p className="text-sm md:text-base text-slate-300 line-clamp-2 mt-2">
          {post.summary}
        </p>

        {/* Author & Meta Row */}
        <div className="flex items-center gap-3 text-xs md:text-sm text-slate-300 mt-4">
          {post.author.avatarUrl && (
            <Image
              src={post.author.avatarUrl}
              alt={post.author.fullName}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full border border-white/40 object-cover flex-shrink-0"
            />
          )}
          <span className="font-medium text-white">{post.author.fullName}</span>
          <span>·</span>
          <span>{post.readTimeMinutes} phút đọc</span>
          <span>·</span>
          <span>{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>
    </Link>
  );
};
