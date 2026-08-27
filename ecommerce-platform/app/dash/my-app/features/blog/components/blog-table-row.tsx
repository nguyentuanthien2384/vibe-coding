'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Eye, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { BlogPostListItem } from '../types/blog.types';
import { usePermissions } from '../../../hooks/use-permissions';
import { getImageUrl } from '../../../lib/image-url';
import BlogStatusBadge from './blog-status-badge';

interface BlogTableRowProps {
  post: BlogPostListItem;
  onFilterByCategory: (categoryId: number) => void;
  onDeleteClick: (post: BlogPostListItem) => void;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
}

function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toString();
}

export default function BlogTableRow({ post, onFilterByCategory, onDeleteClick }: BlogTableRowProps) {
  const { hasAnyPermission } = usePermissions();

  const canEdit = hasAnyPermission(['blog.manage', 'blog.edit']);
  const canDelete = hasAnyPermission(['blog.manage', 'blog.delete']);

  const displayDate = post.publishedAt ?? post.scheduledAt ?? post.createdAt;
  const dateLabel = post.publishedAt
    ? 'Xuất bản'
    : post.scheduledAt
    ? 'Lên lịch'
    : 'Tạo lúc';

  const thumbnailSrc = post.thumbnail
    ? getImageUrl(post.thumbnail)
    : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=113&fit=crop';

  return (
    <tr className="border-b border-gray-100 hover:bg-[#F9FAFB] transition-colors duration-200">
      {/* 1. Thumbnail + Title */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
            <Image
              src={thumbnailSrc}
              alt={post.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-[#202224] hover:text-[#4880FF] line-clamp-1 transition-colors cursor-default">
              {post.title}
            </p>
            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5 font-mono">/{post.slug}</p>
          </div>
        </div>
      </td>

      {/* 2. Category */}
      <td className="py-4 px-4">
        {post.category ? (
          <button
            type="button"
            onClick={() => onFilterByCategory(post.category.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-blue-50 hover:text-[#4880FF] transition-all cursor-pointer"
          >
            {post.category.name}
          </button>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>

      {/* 3. Author */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-2.5">
          {post.author?.avatarUrl ? (
            <Image
              src={getImageUrl(post.author.avatarUrl)}
              alt={post.author.fullName}
              width={28}
              height={28}
              className="rounded-full object-cover border border-gray-200 flex-shrink-0"
              unoptimized
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#4880FF] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {(post.author?.fullName || 'A').charAt(0)}
            </div>
          )}
          <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
            {post.author?.fullName || 'Admin'}
          </span>
        </div>
      </td>

      {/* 4. Views & Read Time */}
      <td className="py-4 px-4">
        <div className="flex flex-col">
          <span className="flex items-center gap-1 text-[#202224] font-semibold text-xs">
            <Eye className="w-3.5 h-3.5 text-gray-400" />
            {formatViews(post.views)}
          </span>
          <span className="text-gray-400 text-[11px] mt-0.5">{post.readTimeMinutes} phút đọc</span>
        </div>
      </td>

      {/* 5. Status */}
      <td className="py-4 px-4 whitespace-nowrap">
        <BlogStatusBadge status={post.status} />
      </td>

      {/* 6. Published Date */}
      <td className="py-4 px-4">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">{dateLabel}</span>
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap">{formatDate(displayDate)}</span>
        </div>
      </td>

      {/* 7. Actions */}
      <td className="py-4 px-6 text-right">
        <div className="inline-flex items-center gap-1">
          {/* Preview link */}
          <a
            href={`http://localhost:3000/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Xem trước bài viết"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Edit link - hidden if no permission */}
          {canEdit && (
            <Link
              href={`/blog/${post.id}/edit`}
              className="p-2 text-gray-400 hover:text-[#4880FF] hover:bg-blue-50 rounded-lg transition-all"
              title="Chỉnh sửa bài viết"
            >
              <Pencil className="w-4 h-4" />
            </Link>
          )}

          {/* Delete button - hidden if no permission */}
          {canDelete && (
            <button
              type="button"
              onClick={() => onDeleteClick(post)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
              title="Xóa bài viết"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
