'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { BlogPostListItem, PostCategory, PostStatus } from '../types/blog.types';
import { useDebounce } from '../../../hooks/use-debounce';
import { blogApi } from '../../../lib/blog-api';
import BlogPageHeader from './blog-page-header';
import BlogFilterBar from './blog-filter-bar';
import BlogTable from './blog-table';
import BlogPagination from './blog-pagination';
import DeletePostConfirmModal from './modals/delete-post-confirm-modal';

const PAGE_SIZE = 10;

export default function BlogListPageClient() {
  // Data state
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<PostStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'views'>('latest');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [postToDelete, setPostToDelete] = useState<BlogPostListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search — 300ms
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Load categories
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await blogApi.getCategories();
        if (isMounted && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.warn('Could not load blog categories:', err);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await blogApi.getPosts({
        page: currentPage,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        categoryId: selectedCategoryId || undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        sortBy,
      });

      if (res && res.data) {
        setPosts(res.data.items || []);
        const total = res.data.meta?.total ?? res.data.meta?.totalItems ?? res.data.items?.length ?? 0;
        setTotalItems(total);
        setTotalPages(res.data.meta?.totalPages || Math.max(1, Math.ceil(total / PAGE_SIZE)));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ';
      setErrorMessage(msg);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedCategoryId, selectedStatus, sortBy]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handlers
  const handleFilterByCategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1);
  };

  const handleDeleteClick = (post: BlogPostListItem) => {
    setPostToDelete(post);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await blogApi.deletePost(postToDelete.id);
      setPostToDelete(null);
      await fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa bài viết thất bại');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategoryId(null);
    setSelectedStatus('ALL');
    setSortBy('latest');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <BlogPageHeader totalCount={totalItems} />

      {/* Filter Bar */}
      <BlogFilterBar
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={(id) => {
          setSelectedCategoryId(id);
          setCurrentPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(status) => {
          setSelectedStatus(status);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        onSortChange={(sort) => {
          setSortBy(sort);
          setCurrentPage(1);
        }}
        categories={categories}
        onReset={handleReset}
      />

      {/* Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#4880FF]" />
            <span className="text-sm font-semibold text-gray-500">Đang tải danh sách bài viết...</span>
          </div>
        ) : errorMessage ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Lỗi kết nối dữ liệu</h3>
              <p className="text-xs text-gray-500 mt-1">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchPosts()}
              className="px-4 py-2 bg-[#4880FF] text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-600 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Tải lại
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-4xl">📝</p>
            <p className="text-gray-400 font-semibold text-sm">
              Chưa có bài viết nào phù hợp với bộ lọc hiện tại.
            </p>
            {(searchTerm || selectedCategoryId !== null || selectedStatus !== 'ALL') && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold text-[#4880FF] hover:underline cursor-pointer"
              >
                Xóa bộ lọc & thử lại
              </button>
            )}
          </div>
        ) : (
          <>
            <BlogTable
              posts={posts}
              onFilterByCategory={handleFilterByCategory}
              onDeleteClick={handleDeleteClick}
            />
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Delete Modal */}
      <DeletePostConfirmModal
        isOpen={postToDelete !== null}
        post={postToDelete}
        isDeleting={isDeleting}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
