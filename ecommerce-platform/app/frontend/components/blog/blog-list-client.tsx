'use client';

import { useState, useTransition, useMemo } from 'react';
import { BlogPostListItem, PostCategorySummary } from '@/types/blog';
import { BlogHeroSection } from './blog-hero-section';
import { BlogFilterToolbar } from './blog-filter-toolbar';
import { BlogCard } from './blog-card';
import { BlogCardSkeleton } from './blog-card-skeleton';
import { BlogPagination } from './blog-pagination';

export interface BlogListClientProps {
  initialCategories: PostCategorySummary[];
  heroPost: BlogPostListItem;
  secondaryPosts: BlogPostListItem[];
  allPosts: BlogPostListItem[];
}

export const BlogListClient = ({
  initialCategories,
  heroPost,
  secondaryPosts,
  allPosts,
}: BlogListClientProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('tat-ca');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'views'>('latest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isPending, startTransition] = useTransition();

  const handleCategoryChange = (slug: string) => {
    startTransition(() => {
      setActiveCategory(slug);
      setCurrentPage(1);
    });
  };

  const handleSearchChange = (query: string) => {
    startTransition(() => {
      setSearchQuery(query);
      setCurrentPage(1);
    });
  };

  const handleSortChange = (sort: 'latest' | 'views') => {
    startTransition(() => {
      setSortBy(sort);
      setCurrentPage(1);
    });
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      setCurrentPage(page);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    });
  };

  // Filter & Sort logic
  const filteredPosts = useMemo(() => {
    let result = [...allPosts];

    // Filter by Category
    if (activeCategory !== 'tat-ca') {
      result = result.filter((p) => p.category.slug === activeCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.author.fullName.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'views') {
      result.sort((a, b) => b.views - a.views);
    } else {
      result.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    return result;
  }, [allPosts, activeCategory, searchQuery, sortBy]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPosts.slice(start, start + itemsPerPage);
  }, [filteredPosts, currentPage, itemsPerPage]);

  const showHero = activeCategory === 'tat-ca' && !searchQuery.trim() && currentPage === 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Title Section */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 mb-3">
          <span>⚡ TechBite Knowledge Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          Góc Coder & Mẹo Sinh Tồn Deadline
        </h1>
        <p className="text-base sm:text-lg text-slate-600 mt-2 max-w-3xl">
          Khám phá các bí quyết dinh dưỡng, review món ngon tăng lực và kinh nghiệm giữ tỉnh táo 100% khi lập trình từ cộng đồng TechBite.
        </p>
      </div>

      {/* Hero Section (only when on default view) */}
      {showHero && (
        <BlogHeroSection
          heroPost={heroPost}
          secondaryPosts={secondaryPosts}
        />
      )}

      {/* Filter & Search Toolbar */}
      <BlogFilterToolbar
        categories={initialCategories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />

      {/* Posts Grid Section */}
      <div className="mb-12">
        {isPending ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : paginatedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {paginatedPosts.map((post, idx) => (
              <BlogCard key={post.id} post={post} priority={idx === 0} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900">
              Không tìm thấy bài viết nào
            </h3>
            <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
              Thử tìm kiếm với từ khóa khác hoặc chuyển sang chuyên mục khác bạn nhé.
            </p>
            <button
              onClick={() => {
                setActiveCategory('tat-ca');
                setSearchQuery('');
              }}
              className="mt-6 px-5 py-2.5 bg-orange-600 text-white text-sm font-bold rounded-xl shadow-md hover:bg-orange-500 transition-all cursor-pointer"
            >
              Xem tất cả bài viết
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isPending && totalPages > 1 && (
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
