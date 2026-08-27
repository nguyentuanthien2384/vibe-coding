import type { Metadata } from 'next';
import { StorefrontShell } from '@/components/layout/storefront-shell';
import { BlogListClient } from '@/components/blog/blog-list-client';
import { getBlogCategories, getBlogPosts } from '@/lib/blog';
import {
  MOCK_CATEGORIES,
  MOCK_HERO_POST,
  MOCK_SECONDARY_POSTS,
  MOCK_BLOG_POSTS,
} from '@/components/blog/mock-data';

export const metadata: Metadata = {
  title: 'Blog & Tin Tức Mẹo Coder Chạy Deadline | TechBite',
  description:
    'Chuyên trang mẹo sinh tồn công nghệ, review đồ ăn vặt, nước tăng lực và cẩm nang giữ tỉnh táo 100% khi thức đêm làm việc từ TechBite.',
  openGraph: {
    title: 'Blog & Tin Tức Mẹo Coder Chạy Deadline | TechBite',
    description:
      'Chuyên trang mẹo sinh tồn công nghệ, review đồ ăn vặt, nước tăng lực và cẩm nang giữ tỉnh táo 100% khi thức đêm làm việc từ TechBite.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=675&fit=crop',
        width: 1200,
        height: 675,
        alt: 'TechBite Blog',
      },
    ],
  },
};

export default async function BlogPage() {
  const [categoriesRes, postsRes] = await Promise.all([
    getBlogCategories(),
    getBlogPosts({ limit: 30 }),
  ]);

  const rawCategories = categoriesRes.categories;
  const categories =
    rawCategories && rawCategories.length > 0
      ? rawCategories
      : MOCK_CATEGORIES;

  const rawPosts = postsRes.data?.items;
  const posts = rawPosts && rawPosts.length > 0 ? rawPosts : MOCK_BLOG_POSTS;

  const heroPost = posts[0] || MOCK_HERO_POST;
  const secondaryPosts =
    posts.length > 1 ? posts.slice(1, 3) : MOCK_SECONDARY_POSTS;
  const allPosts = posts.length > 3 ? posts.slice(3) : posts;

  return (
    <StorefrontShell>
      <BlogListClient
        initialCategories={categories}
        heroPost={heroPost}
        secondaryPosts={secondaryPosts}
        allPosts={allPosts}
      />
    </StorefrontShell>
  );
}

