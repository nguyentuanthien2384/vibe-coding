import Image from 'next/image';
import Link from 'next/link';
import { BlogPostListItem } from '@/types/blog';

export interface SecondaryFeaturedPostCardProps {
  post: BlogPostListItem;
}

export const SecondaryFeaturedPostCard = ({ post }: SecondaryFeaturedPostCardProps) => {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="relative overflow-hidden rounded-2xl bg-slate-900 text-white group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 flex-1 min-h-[180px] block"
    >
      {/* Background Image */}
      <Image
        src={post.thumbnail}
        alt={post.title}
        fill
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        sizes="(max-width: 1024px) 100vw, 42vw"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30 w-fit mb-2">
          {post.category.icon && <span className="mr-1">{post.category.icon}</span>}
          {post.category.name}
        </span>
        <h3 className="text-base md:text-lg font-bold text-white leading-snug line-clamp-2 group-hover:text-orange-300 transition-colors">
          {post.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
          <span>{post.readTimeMinutes} phút</span>
          <span>·</span>
          <span>{post.author.fullName}</span>
        </div>
      </div>
    </Link>
  );
};
