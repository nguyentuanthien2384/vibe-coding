import Link from 'next/link';
import { BlogPostListItem } from '@/types/blog';

export interface SidebarTrendingPostsProps {
  posts: BlogPostListItem[];
}

export const SidebarTrendingPosts = ({ posts }: SidebarTrendingPostsProps) => {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
        <span className="text-orange-600">🔥</span>
        <span>Bài viết xem nhiều nhất</span>
      </div>

      <div className="space-y-4">
        {posts.map((post, idx) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="flex items-start gap-3 group"
          >
            <span
              className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 mt-0.5 ${
                idx === 0
                  ? 'bg-orange-600 text-white'
                  : idx === 1
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              0{idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-800 group-hover:text-orange-600 line-clamp-2 transition-colors">
                {post.title}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span>{post.readTimeMinutes} phút</span>
                <span>·</span>
                <span>{post.views} lượt xem</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
