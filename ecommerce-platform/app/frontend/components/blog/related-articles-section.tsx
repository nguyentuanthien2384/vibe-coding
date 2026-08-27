import { BlogPostListItem } from '@/types/blog';
import { BlogCard } from './blog-card';

export interface RelatedArticlesSectionProps {
  posts: BlogPostListItem[];
}

export const RelatedArticlesSection = ({ posts }: RelatedArticlesSectionProps) => {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-slate-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            Khám phá thêm
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">
            Bài Viết Liên Quan
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};
