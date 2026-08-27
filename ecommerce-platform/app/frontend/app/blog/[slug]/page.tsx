import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StorefrontShell } from '@/components/layout/storefront-shell';
import { ArticleHeader } from '@/components/blog/article-header';
import { BlogContentRenderer } from '@/components/blog/blog-content-renderer';
import { TableOfContentsNav } from '@/components/blog/table-of-contents-nav';
import { PostProductEmbedWidget } from '@/components/blog/post-product-embed-widget';
import { PostTagList } from '@/components/blog/post-tag-list';
import { AuthorBioCard } from '@/components/blog/author-bio-card';
import { SidebarTrendingPosts } from '@/components/blog/sidebar-trending-posts';
import { RelatedArticlesSection } from '@/components/blog/related-articles-section';
import { SocialShareBar } from '@/components/blog/social-share-bar';
import { PostViewTracker } from '@/components/blog/post-view-tracker';
import { getBlogPostDetail, extractTocFromTipTap } from '@/lib/blog';
import {
  getPostBySlug,
  MOCK_TOC_ITEMS,
  MOCK_BLOG_POSTS,
} from '@/components/blog/mock-data';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getBlogPostDetail(slug);
  const post = res.post || getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Không tìm thấy bài viết | TechBite Blog',
    };
  }

  return {
    title: post.metaTitle || `${post.title} | TechBite Blog`,
    description: post.metaDescription || post.summary,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.summary,
      images: [
        {
          url: post.ogImage || post.thumbnail,
          width: 1200,
          height: 675,
          alt: post.title,
        },
      ],
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      authors: [post.author.fullName],
    },
  };
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const res = await getBlogPostDetail(slug);
  const post = res.post || getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Trích xuất Table of Contents tự động từ TipTap doc
  const dynamicToc = extractTocFromTipTap(post.content);
  const tocItems = dynamicToc.length > 0 ? dynamicToc : MOCK_TOC_ITEMS;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.thumbnail,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author.fullName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TechBite Ecommerce',
      logo: {
        '@type': 'ImageObject',
        url: 'https://techbite.vn/logo.png',
      },
    },
  };

  return (
    <StorefrontShell>
      {/* Schema.org Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Track Post View count */}
      <PostViewTracker slug={post.slug} />

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumbs"
          className="flex items-center gap-2 text-xs md:text-sm text-slate-500 mb-6 flex-wrap"
        >
          <Link href="/" className="hover:text-orange-600 transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-orange-600 transition-colors">
            Blog
          </Link>
          <span>/</span>
          <Link
            href={`/blog?category=${post.category.slug}`}
            className="hover:text-orange-600 transition-colors font-medium text-slate-700"
          >
            {post.category.name}
          </Link>
          <span>/</span>
          <span className="text-slate-400 truncate max-w-[200px] md:max-w-xs">
            {post.title}
          </span>
        </nav>

        {/* 12-Column Grid Layout */}
        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          {/* Main Article Body Column: 8 cols desktop */}
          <div className="col-span-12 lg:col-span-8">
            {/* Article Header */}
            <ArticleHeader post={post} />

            {/* Featured Media Image */}
            <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-md mb-8 bg-slate-100">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 800px"
              />
            </div>

            {/* Mobile TOC Accordion (visible only on mobile) */}
            <div className="block lg:hidden">
              <TableOfContentsNav items={tocItems} isMobileAccordion={true} />
            </div>

            {/* Core Rich Content Renderer */}
            <div className="mb-10">
              <BlogContentRenderer doc={post.content} />
            </div>

            {/* Embedded Products Cross-selling Widget */}
            {post.products && post.products.length > 0 && (
              <PostProductEmbedWidget products={post.products} />
            )}

            {/* Tags Section */}
            {post.tags && post.tags.length > 0 && (
              <PostTagList tags={post.tags} />
            )}

            {/* Author Bio Card */}
            <AuthorBioCard author={post.author} />
          </div>

          {/* Sticky Sidebar: 4 cols desktop */}
          <aside className="col-span-12 lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Desktop Table of Contents */}
              <TableOfContentsNav items={tocItems} />

              {/* Sidebar Trending Posts */}
              <SidebarTrendingPosts
                posts={
                  post.relatedPosts && post.relatedPosts.length > 0
                    ? post.relatedPosts
                    : MOCK_BLOG_POSTS.slice(0, 4)
                }
              />
            </div>
          </aside>
        </div>

        {/* Floating Share Bar on Mobile */}
        <div className="fixed bottom-4 left-4 right-4 z-40 block lg:hidden">
          <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Chia sẻ bài viết này:
            </span>
            <SocialShareBar title={post.title} />
          </div>
        </div>

        {/* Related Articles Section */}
        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <RelatedArticlesSection posts={post.relatedPosts} />
        )}
      </article>
    </StorefrontShell>
  );
}

