import Link from 'next/link';
import { TagSummary } from '@/types/blog';

export interface PostTagListProps {
  tags: TagSummary[];
}

export const PostTagList = ({ tags }: PostTagListProps) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="mb-8 pt-4 border-t border-slate-200">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        Thẻ chủ đề:
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/blog?tag=${tag.slug}`}
            className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-orange-100 hover:text-orange-700 transition-colors"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
};
