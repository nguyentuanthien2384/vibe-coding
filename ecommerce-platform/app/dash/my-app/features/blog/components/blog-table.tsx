import { BlogPostListItem } from '../types/blog.types';
import BlogTableHeader from './blog-table-header';
import BlogTableRow from './blog-table-row';

interface BlogTableProps {
  posts: BlogPostListItem[];
  onFilterByCategory: (categoryId: number) => void;
  onDeleteClick: (post: BlogPostListItem) => void;
}

export default function BlogTable({ posts, onFilterByCategory, onDeleteClick }: BlogTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <BlogTableHeader />
        <tbody>
          {posts.map((post) => (
            <BlogTableRow
              key={post.id}
              post={post}
              onFilterByCategory={onFilterByCategory}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
