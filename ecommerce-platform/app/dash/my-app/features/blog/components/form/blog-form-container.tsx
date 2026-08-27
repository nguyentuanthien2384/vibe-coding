'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  BlogPostFormData,
  PostStatus,
  AttachedProduct,
  AttachedProductDetail,
  PostCategory,
  PostTag,
} from '../../types/blog.types';
import { TipTapDoc } from '../../types/tiptap.types';
import { blogApi } from '../../../../lib/blog-api';
import BlogFormHeader from './blog-form-header';
import BlogFormLayout from './blog-form-layout';
import BlogGeneralSection from './sections/blog-general-section';
import BlogEditorSection from './sections/blog-editor-section';
import BlogCrossSellSection from './sections/blog-cross-sell-section';
import BlogPublishingSection from './sections/blog-publishing-section';
import BlogCategoryTagSection from './sections/blog-category-tag-section';
import BlogMediaSection from './sections/blog-media-section';
import BlogSeoSection from './sections/blog-seo-section';

interface BlogFormContainerProps {
  mode: 'create' | 'edit';
  postId?: number;
  initialData?: Partial<BlogPostFormData>;
}

const MOCK_TAGS: PostTag[] = [
  { id: 1, name: 'ăn vặt', slug: 'an-vat' },
  { id: 2, name: 'coder', slug: 'coder' },
  { id: 3, name: 'nước tăng lực', slug: 'nuoc-tang-luc' },
  { id: 4, name: 'năng lượng', slug: 'nang-luong' },
  { id: 5, name: 'review', slug: 'review' },
];

const EMPTY_DOC: TipTapDoc = { type: 'doc', content: [] };

const DEFAULT_FORM: BlogPostFormData = {
  title: '',
  slug: '',
  summary: '',
  thumbnail: '',
  content: EMPTY_DOC,
  status: 'DRAFT',
  categoryId: 0,
  tagIds: [],
  productIds: [],
  scheduledAt: null,
  metaTitle: '',
  metaDescription: '',
  canonicalUrl: null,
  ogImage: null,
};

export default function BlogFormContainer({ mode, postId, initialData }: BlogFormContainerProps) {
  const router = useRouter();
  const [form, setForm] = useState<BlogPostFormData>({ ...DEFAULT_FORM, ...initialData });
  const [attachedProducts, setAttachedProducts] = useState<AttachedProduct[]>([]);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [isLoadingPost, setIsLoadingPost] = useState(mode === 'edit' && !!postId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load categories
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await blogApi.getCategories();
        if (isMounted && res.data) {
          setCategories(res.data);
          if (mode === 'create' && res.data.length > 0 && form.categoryId === 0) {
            setForm((prev) => ({ ...prev, categoryId: res.data[0].id }));
          }
        }
      } catch (err) {
        console.warn('Could not load categories:', err);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [mode, form.categoryId]);

  // Load post for edit mode
  useEffect(() => {
    if (mode !== 'edit' || !postId) return;

    let isMounted = true;
    async function loadPost() {
      setIsLoadingPost(true);
      try {
        const res = await blogApi.getPostById(postId!);
        if (isMounted && res.data) {
          const post = res.data;
          setForm({
            title: post.title,
            slug: post.slug,
            summary: post.summary,
            thumbnail: post.thumbnail,
            content: (post.content as unknown as TipTapDoc) || EMPTY_DOC,
            status: post.status as PostStatus,
            categoryId: post.categoryId || (post.category?.id ?? 0),
            tagIds: post.tags?.map((t) => t.id) || [],
            productIds: post.products?.map((p) => p.productId) || [],
            scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : null,
            metaTitle: post.metaTitle || '',
            metaDescription: post.metaDescription || '',
            canonicalUrl: post.canonicalUrl,
            ogImage: post.ogImage,
          });

          if (post.products) {
            setAttachedProducts(
              post.products.map((pp) => ({
                id: pp.id,
                productId: pp.productId,
                displayOrder: pp.displayOrder,
                product: pp.product,
              })),
            );
          }
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Không thể tải dữ liệu bài viết');
      } finally {
        if (isMounted) setIsLoadingPost(false);
      }
    }
    loadPost();
    return () => {
      isMounted = false;
    };
  }, [mode, postId]);

  const updateForm = useCallback(<K extends keyof BlogPostFormData>(key: K, value: BlogPostFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Handlers for cross-sell products
  const handleAddProduct = (product: AttachedProductDetail) => {
    const newItem: AttachedProduct = {
      id: Date.now(),
      productId: product.id,
      displayOrder: attachedProducts.length + 1,
      product,
    };
    setAttachedProducts((prev) => [...prev, newItem]);
    updateForm('productIds', [...form.productIds, product.id]);
  };

  const handleRemoveProduct = (productId: number) => {
    setAttachedProducts((prev) => {
      const updated = prev.filter((p) => p.product.id !== productId);
      return updated.map((p, i) => ({ ...p, displayOrder: i + 1 }));
    });
    updateForm('productIds', form.productIds.filter((id) => id !== productId));
  };

  const handleReorderProduct = (productId: number, direction: 'UP' | 'DOWN') => {
    setAttachedProducts((prev) => {
      const sorted = [...prev].sort((a, b) => a.displayOrder - b.displayOrder);
      const idx = sorted.findIndex((p) => p.product.id === productId);
      if (idx < 0) return prev;

      const swapIdx = direction === 'UP' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;

      [sorted[idx], sorted[swapIdx]] = [sorted[swapIdx], sorted[idx]];
      const reordered = sorted.map((p, i) => ({ ...p, displayOrder: i + 1 }));
      updateForm('productIds', reordered.map((p) => p.product.id));
      return reordered;
    });
  };

  const handleTagToggle = (tagId: number) => {
    const current = form.tagIds;
    const updated = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    updateForm('tagIds', updated);
  };

  const handleSaveDraft = async () => {
    if (!form.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết');
      return;
    }
    if (!form.categoryId) {
      alert('Vui lòng chọn chuyên mục');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: BlogPostFormData = { ...form, status: 'DRAFT' };
      if (mode === 'edit' && postId) {
        await blogApi.updatePost(postId, payload);
      } else {
        await blogApi.createPost(payload);
      }
      router.push('/blog');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lưu bản nháp thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!form.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết');
      return;
    }
    if (!form.categoryId) {
      alert('Vui lòng chọn chuyên mục');
      return;
    }
    if (!form.thumbnail) {
      alert('Vui lòng tải lên ảnh đại diện bài viết');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetStatus: PostStatus = form.status === 'SCHEDULED' ? 'SCHEDULED' : 'PUBLISHED';
      const payload: BlogPostFormData = { ...form, status: targetStatus };

      if (mode === 'edit' && postId) {
        await blogApi.updatePost(postId, payload);
      } else {
        await blogApi.createPost(payload);
      }
      router.push('/blog');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xuất bản bài viết thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPost) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#4880FF]" />
        <span className="text-sm font-semibold text-gray-500">Đang tải dữ liệu bài viết...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <BlogFormHeader
        mode={mode}
        isSubmitting={isSubmitting}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />

      {/* Form Layout */}
      <BlogFormLayout
        leftColumn={
          <>
            <BlogGeneralSection
              title={form.title}
              slug={form.slug}
              summary={form.summary}
              onTitleChange={(val) => updateForm('title', val)}
              onSlugChange={(val) => updateForm('slug', val)}
              onSummaryChange={(val) => updateForm('summary', val)}
            />
            <BlogEditorSection
              content={form.content}
              onChange={(doc) => updateForm('content', doc)}
            />
            <BlogCrossSellSection
              attachedProducts={attachedProducts}
              onAddProduct={handleAddProduct}
              onRemoveProduct={handleRemoveProduct}
              onReorderProduct={handleReorderProduct}
            />
          </>
        }
        rightColumn={
          <>
            <BlogPublishingSection
              status={form.status}
              scheduledAt={form.scheduledAt ?? null}
              onStatusChange={(status) => updateForm('status', status)}
              onScheduledAtChange={(val) => updateForm('scheduledAt', val)}
            />
            <BlogCategoryTagSection
              categoryId={form.categoryId}
              selectedTagIds={form.tagIds}
              categories={categories}
              availableTags={MOCK_TAGS}
              onCategoryChange={(id) => updateForm('categoryId', id)}
              onTagToggle={handleTagToggle}
            />
            <BlogMediaSection
              thumbnail={form.thumbnail}
              onChange={(url) => updateForm('thumbnail', url)}
            />
            <BlogSeoSection
              metaTitle={form.metaTitle ?? ''}
              metaDescription={form.metaDescription ?? ''}
              slug={form.slug}
              onChangeTitle={(val) => updateForm('metaTitle', val)}
              onChangeDescription={(val) => updateForm('metaDescription', val)}
            />
          </>
        }
      />
    </div>
  );
}
