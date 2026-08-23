'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Sparkles,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Layers,
  Upload,
  Loader2,
  AlertCircle,
  Star,
  Trash2,
  Plus,
  ArrowUpDown,
  FolderOpen,
} from 'lucide-react';
import { ProductItem, ProductFormData, CategoryOption, ProductGalleryItem, JSONEditorContent } from '../types/product.types';
import { categoriesApi } from '../../../lib/categories-api';
import { productsApi } from '../../../lib/products-api';
import { uploadApi } from '../../../lib/upload-api';
import { getImageUrl } from '../../../lib/image-url';
import { useToast } from '../../../components/ui/toast';
import JSONRichEditor from './rich-editor/json-rich-editor';
import MediaManagerModal, { SelectedImagePayload } from '../../media/components/media-manager-modal';

interface ProductFormContainerProps {
  initialData?: ProductItem | null;
  productId?: number;
  mode: 'create' | 'edit';
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function ProductFormContainer({
  initialData,
  productId,
  mode,
}: ProductFormContainerProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // Dynamic Categories options from API
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  // Loading state when fetching product detail in edit mode
  const [isProductLoading, setIsProductLoading] = useState(mode === 'edit');

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [categoryId, setCategoryId] = useState<number>(initialData?.categoryId || 0);
  const [price, setPrice] = useState<number | ''>(initialData?.price ?? '');
  const [salePrice, setSalePrice] = useState<number | ''>(initialData?.salePrice ?? '');
  const [stock, setStock] = useState<number | ''>(initialData?.stock ?? 10);
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  
  // Media Gallery & Reordering State
  const [galleryImages, setGalleryImages] = useState<ProductGalleryItem[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : initialData?.imageUrl
        ? [{ url: initialData.imageUrl, position: 1 }]
        : []
  );
  const [inputUrl, setInputUrl] = useState('');

  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(initialData?.status || 'ACTIVE');

  const [shortDescription, setShortDescription] = useState<JSONEditorContent | Record<string, unknown> | null>(
    initialData?.shortDescription || null,
  );
  const [longDescription, setLongDescription] = useState<JSONEditorContent | Record<string, unknown> | null>(
    initialData?.longDescription || null,
  );

  // UI States
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Media Manager Picker State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'cover' | 'gallery'>('gallery');

  const handleSelectFromMedia = (payload: SelectedImagePayload) => {
    if (mediaPickerTarget === 'cover') {
      setImageUrl(payload.url);
      if (!galleryImages.some((img) => img.url === payload.url)) {
        const nextPos = galleryImages.length + 1;
        setGalleryImages([...galleryImages, { url: payload.url, position: nextPos }]);
      }
      showToast('success', 'Đã chọn ảnh đại diện từ Thư viện Media');
    } else {
      if (galleryImages.some((img) => img.url === payload.url)) {
        showToast('warning', 'Hình ảnh này đã tồn tại trong thư viện sản phẩm');
        return;
      }
      const nextPos = galleryImages.length + 1;
      const nextImages = [...galleryImages, { url: payload.url, position: nextPos }];
      setGalleryImages(nextImages);
      if (!imageUrl) {
        setImageUrl(payload.url);
      }
      showToast('success', 'Đã thêm ảnh vào thư viện sản phẩm');
    }
  };

  // Load categories list on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoriesApi.getList({ limit: 100 });
        const list: CategoryOption[] = res.data.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        }));
        setCategories(list);
        if (mode === 'create' && list.length > 0) {
          setCategoryId(list[0].id);
        }
      } catch (err) {
        showToast('error', 'Không thể tải danh sách chuyên mục từ máy chủ');
      } finally {
        setIsCategoriesLoading(false);
      }
    }
    loadCategories();
  }, [mode, showToast]);

  // In edit mode: load product detail from API if not provided or when editing
  useEffect(() => {
    if (mode === 'edit' && productId) {
      async function loadProductDetail() {
        setIsProductLoading(true);
        try {
          let item = initialData;
          if (!item) {
            const res = await productsApi.getOne(productId!);
            item = res.data;
          }

          if (item) {
            setName(item.name || '');
            setSlug(item.slug || '');
            setCategoryId(item.categoryId || 0);
            setPrice(item.price ?? '');
            setSalePrice(item.salePrice ?? '');
            setStock(item.stock ?? 0);
            setImageUrl(item.imageUrl || '');
            
            // Set Gallery images
            if (item.images && item.images.length > 0) {
              setGalleryImages(item.images);
            } else if (item.imageUrl) {
              setGalleryImages([{ url: item.imageUrl, position: 1 }]);
            }

            setIsFeatured(item.isFeatured ?? false);
            setStatus(item.status || (item.isActive ? 'ACTIVE' : 'INACTIVE'));
            setShortDescription(item.shortDescription || null);
            setLongDescription(item.longDescription || null);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Không tìm thấy thông tin sản phẩm cần chỉnh sửa';
          setSubmitError(msg);
          showToast('error', msg);
        } finally {
          setIsProductLoading(false);
        }
      }
      loadProductDetail();
    }
  }, [mode, productId, initialData, showToast]);

  // Auto-generate slug when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    if (mode === 'create' || !slug) {
      setSlug(generateSlug(val));
    }
  };

  // Image File Upload handler (Support Single & Multiple)
  const handleMultipleFilesUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const newItems: ProductGalleryItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadApi.uploadImage(file);
        newItems.push({
          url: res.data.url,
          position: galleryImages.length + newItems.length + 1,
        });
      }

      const updatedGallery = [...galleryImages, ...newItems];
      setGalleryImages(updatedGallery);

      // If main imageUrl is empty, set first uploaded image as cover
      if (!imageUrl && updatedGallery.length > 0) {
        setImageUrl(updatedGallery[0].url);
      }

      showToast('success', `Đã tải lên ${newItems.length} hình ảnh vào thư viện`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload file thất bại';
      showToast('error', msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Add Direct URL to Gallery
  const handleAddUrlToGallery = () => {
    if (!inputUrl.trim()) return;
    const url = inputUrl.trim();
    const exists = galleryImages.some((img) => img.url === url);
    if (exists) {
      showToast('error', 'URL ảnh đã có trong thư viện');
      return;
    }

    const updated = [...galleryImages, { url, position: galleryImages.length + 1 }];
    setGalleryImages(updated);
    if (!imageUrl) {
      setImageUrl(url);
    }
    setInputUrl('');
    showToast('success', 'Đã thêm ảnh vào thư viện');
  };

  // Set Main Image (Cover / Thumbnail)
  const handleSetMainImage = (url: string) => {
    setImageUrl(url);
    showToast('success', 'Đã thiết lập làm ảnh đại diện sản phẩm');
  };

  // Gallery Sort Handlers (Move Left & Right)
  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryImages.length) return;

    const list = [...galleryImages];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Recalculate positions
    const reordered = list.map((item, idx) => ({
      ...item,
      position: idx + 1,
    }));

    setGalleryImages(reordered);
  };

  // Auto Re-index Positions (Sắp xếp lại thứ tự từ 1 đến N)
  const handleResetPositions = () => {
    const reordered = galleryImages.map((item, idx) => ({
      ...item,
      position: idx + 1,
    }));
    setGalleryImages(reordered);
    showToast('success', 'Đã sắp xếp lại vị trí thư viện ảnh');
  };

  // Remove image from gallery
  const handleRemoveImage = (index: number) => {
    const target = galleryImages[index];
    const updated = galleryImages.filter((_, idx) => idx !== index);
    
    // Re-index remaining
    const reindexed = updated.map((item, idx) => ({
      ...item,
      position: idx + 1,
    }));

    setGalleryImages(reindexed);

    // If removed main image, reset to first item
    if (target.url === imageUrl) {
      setImageUrl(reindexed.length > 0 ? reindexed[0].url : '');
    }

    showToast('success', 'Đã xóa ảnh khỏi thư viện');
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim()) {
      setSubmitError('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!categoryId || categoryId <= 0) {
      setSubmitError('Vui lòng chọn chuyên mục sản phẩm');
      return;
    }
    if (price === '' || Number(price) < 0) {
      setSubmitError('Vui lòng nhập giá bán sản phẩm hợp lệ');
      return;
    }
    if (salePrice !== '' && Number(salePrice) >= Number(price)) {
      setSubmitError('Giá khuyến mãi phải nhỏ hơn giá gốc của sản phẩm');
      return;
    }

    // Determine final cover image URL
    const finalCoverUrl = imageUrl.trim() || (galleryImages.length > 0 ? galleryImages[0].url : '');

    if (!finalCoverUrl) {
      setSubmitError('Vui lòng tải lên hoặc chọn 1 ảnh đại diện sản phẩm');
      return;
    }

    setIsSubmitting(true);

    // Ensure positions are clean
    const formattedGallery: ProductGalleryItem[] = galleryImages.map((img, idx) => ({
      url: img.url,
      position: idx + 1,
    }));

    const payload: ProductFormData = {
      name: name.trim(),
      slug: slug.trim() || generateSlug(name),
      categoryId: Number(categoryId),
      price: Number(price),
      salePrice: salePrice !== '' ? Number(salePrice) : null,
      stock: Number(stock) || 0,
      imageUrl: finalCoverUrl,
      images: formattedGallery.length > 0 ? formattedGallery : undefined,
      isFeatured,
      status,
      shortDescription,
      longDescription,
    };

    try {
      if (mode === 'create') {
        await productsApi.create(payload);
        showToast('success', `Tạo mới sản phẩm "${name}" thành công!`);
      } else if (productId) {
        await productsApi.update(productId, payload);
        showToast('success', `Cập nhật sản phẩm "${name}" thành công!`);
      }
      router.push('/products');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu sản phẩm.';
      setSubmitError(msg);
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolvedPreviewUrl = getImageUrl(imageUrl);

  if (isProductLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#4880FF]" />
        <span className="text-sm font-bold text-gray-600">Đang tải thông tin sản phẩm...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="p-2.5 bg-white text-gray-500 hover:text-[#4880FF] hover:bg-blue-50 rounded-2xl border border-gray-100 transition-all shadow-sm"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#202224]">
              {mode === 'create' ? 'Thêm sản phẩm mới' : `Chỉnh sửa sản phẩm #${productId || initialData?.id}`}
            </h1>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">
              Cập nhật thông tin chi tiết, giá bán, thư viện ảnh và thuộc tính sản phẩm
            </p>
          </div>
        </div>
      </div>

      {/* Submit Error Banner */}
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 font-bold rounded-2xl flex items-center gap-3 animate-fade-in text-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Main Column: General, Pricing, Gallery, Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Thông tin cơ bản */}
            <div className="bg-white p-6 rounded-3xl custom-shadow border border-gray-50 space-y-4">
              <div className="flex items-center gap-2 text-base font-extrabold text-[#202224] border-b border-gray-100 pb-3">
                <Tag className="w-5 h-5 text-[#4880FF]" />
                <span>Thông tin chung</span>
              </div>

              {/* Tên sản phẩm */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Bánh Burger Bò Phô Mai..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-[#202224] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Đường dẫn (Slug)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="banh-burger-bo-pho-mai"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
                />
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Chuyên mục sản phẩm <span className="text-red-500">*</span>
                </label>
                {isCategoriesLoading ? (
                  <div className="flex items-center gap-2 text-xs text-gray-400 py-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-[#4880FF]" />
                    <span>Đang tải danh mục...</span>
                  </div>
                ) : (
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-[#202224] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all cursor-pointer"
                  >
                    <option value={0} disabled>-- Chọn chuyên mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* 2. Giá cả & Kho hàng */}
            <div className="bg-white p-6 rounded-3xl custom-shadow border border-gray-50 space-y-4">
              <div className="flex items-center gap-2 text-base font-extrabold text-[#202224] border-b border-gray-100 pb-3">
                <DollarSign className="w-5 h-5 text-[#4880FF]" />
                <span>Giá cả & Tồn kho</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Giá gốc */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Giá gốc (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="89000"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-extrabold text-[#4880FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
                  />
                </div>

                {/* Giá khuyến mãi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Giá khuyến mãi (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="69000 (tùy chọn)"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
                  />
                </div>

                {/* Tồn kho */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Tồn kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="45"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#202224] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 3. THƯ VIỆN HÌNH ẢNH & SẮP XẾP THỨ TỰ (MEDIA GALLERY) */}
            <div className="bg-white p-6 rounded-3xl custom-shadow border border-gray-50 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-base font-extrabold text-[#202224]">
                  <ImageIcon className="w-5 h-5 text-[#4880FF]" />
                  <span>Thư viện hình ảnh sản phẩm ({galleryImages.length})</span>
                </div>
                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    onClick={handleResetPositions}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-[#4880FF] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Tự động chuẩn hóa lại thứ tự 1..N"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>Sắp xếp lại thứ tự</span>
                  </button>
                )}
              </div>

              {/* Top: Gallery Grid Display with Reordering Controls */}
              {galleryImages.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400 font-semibold">
                  Chưa có hình ảnh nào trong thư viện. Vui lòng sử dụng các nút bên dưới để thêm ảnh.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {galleryImages.map((img, idx) => {
                    const isMain = img.url === imageUrl;
                    const fullUrl = getImageUrl(img.url) || '/placeholder-food.png';

                    return (
                      <div
                        key={`${img.url}-${idx}`}
                        className={`relative rounded-2xl border bg-gray-50 overflow-hidden group transition-all p-2 flex flex-col items-center gap-2 ${
                          isMain
                            ? 'border-2 border-[#4880FF] shadow-md shadow-blue-100'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Position Badge & Main Cover Indicator */}
                        <div className="w-full flex items-center justify-between px-1">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gray-800 text-white font-mono">
                            #{idx + 1}
                          </span>
                          {isMain ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              Ảnh chính
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(img.url)}
                              className="text-[10px] font-bold text-gray-400 hover:text-[#4880FF] bg-white px-2 py-0.5 rounded-full border border-gray-200 hover:border-blue-200 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                            >
                              Đặt làm đại diện
                            </button>
                          )}
                        </div>

                        {/* Image Preview Box */}
                        <div className="w-full h-28 rounded-xl bg-white p-1 border border-gray-100 overflow-hidden relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={fullUrl}
                            alt={`Gallery item ${idx + 1}`}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>

                        {/* Sorting Action Controls (Move Left, Right, Delete) */}
                        <div className="w-full flex items-center justify-between pt-1 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            {/* Move Left */}
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveImage(idx, 'left')}
                              className="p-1 text-gray-500 hover:text-[#4880FF] hover:bg-blue-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                              title="Di chuyển sang trái"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Move Right */}
                            <button
                              type="button"
                              disabled={idx === galleryImages.length - 1}
                              onClick={() => handleMoveImage(idx, 'right')}
                              className="p-1 text-gray-500 hover:text-[#4880FF] hover:bg-blue-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                              title="Di chuyển sang phải"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Xóa khỏi thư viện"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

  {/* Bottom Row: Upload, Media Library & Add URL Controls */}
  <div className="pt-4 border-t border-gray-100 space-y-3">
    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
      ➕ Thêm ảnh mới vào thư viện
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Upload Multi-Files Box */}
      <label className="flex items-center justify-center p-3 border-2 border-dashed border-gray-200 rounded-2xl hover:border-[#4880FF] hover:bg-blue-50/40 transition-all cursor-pointer group">
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleMultipleFilesUpload(e.target.files);
            }
          }}
        />
        {isUploading ? (
          <div className="flex items-center gap-2 text-xs font-bold text-[#4880FF]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang tải...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-left">
            <Upload className="w-4 h-4 text-gray-400 group-hover:text-[#4880FF] transition-colors" />
            <div>
              <p className="text-xs font-bold text-gray-700 group-hover:text-[#4880FF]">Tải từ máy</p>
              <p className="text-[10px] text-gray-400">File PNG, JPG, WebP</p>
            </div>
          </div>
        )}
      </label>

      {/* Pick from Media Library Button */}
      <button
        type="button"
        onClick={() => {
          setMediaPickerTarget('gallery');
          setIsMediaPickerOpen(true);
        }}
        className="flex items-center justify-center p-3 border border-blue-200 bg-blue-50/60 rounded-2xl hover:bg-blue-100/70 hover:border-[#4880FF] text-[#4880FF] transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-2 text-left">
          <FolderOpen className="w-4 h-4 text-[#4880FF]" />
          <div>
            <p className="text-xs font-bold text-[#4880FF]">Thư viện Media</p>
            <p className="text-[10px] text-blue-400">Chọn từ kho ảnh có sẵn</p>
          </div>
        </div>
      </button>

      {/* Paste URL Box */}
      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4880FF]">
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Dán URL ảnh..."
          className="flex-1 px-2 py-1 bg-transparent text-xs font-mono text-gray-600 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAddUrlToGallery}
          className="px-3 py-1.5 bg-gray-200 hover:bg-[#4880FF] hover:text-white text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm</span>
        </button>
      </div>
    </div>
  </div>
</div>

{/* 4. Mô tả sản phẩm (JSON Editor Format) */}
<div className="bg-white p-6 rounded-3xl custom-shadow border border-gray-50 space-y-6">
  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
    <div className="flex items-center gap-2 text-base font-extrabold text-[#202224]">
      <Sparkles className="w-5 h-5 text-[#4880FF]" />
      <span>Mô tả sản phẩm (JSON Rich Editor)</span>
    </div>
  </div>

  {/* Short Description JSON Editor */}
  <JSONRichEditor
    label="Mô tả ngắn (Short Description)"
    value={shortDescription}
    onChange={(val) => setShortDescription(val)}
    placeholder="Nhập tóm tắt mô tả ngắn sản phẩm..."
  />

  {/* Long Description JSON Editor */}
  <JSONRichEditor
    label="Mô tả chi tiết (Long Description)"
    value={longDescription}
    onChange={(val) => setLongDescription(val)}
    placeholder="Nhập chi tiết tính năng, thông số kỹ thuật sản phẩm..."
  />
</div>
</div>

{/* Right Sidebar Column: Preview & Settings */}
<div className="space-y-6">
{/* Xem trước Ảnh đại diện sản phẩm */}
<div className="bg-white p-6 rounded-3xl custom-shadow border border-gray-50 space-y-4">
  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
    <div className="flex items-center gap-2 text-base font-extrabold text-[#202224]">
      <ImageIcon className="w-5 h-5 text-[#4880FF]" />
      <span>Ảnh đại diện <span className="text-red-500">*</span></span>
    </div>
    <button
      type="button"
      onClick={() => {
        setMediaPickerTarget('cover');
        setIsMediaPickerOpen(true);
      }}
      className="px-2.5 py-1 bg-blue-50 hover:bg-[#4880FF] text-[#4880FF] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
    >
      <FolderOpen className="w-3.5 h-3.5" />
      <span>Thư viện</span>
    </button>
  </div>

  <div className="space-y-3">
    <div className="w-full h-48 rounded-2xl bg-gray-50 border border-gray-200 p-2 flex items-center justify-center overflow-hidden relative shadow-inner">
      {resolvedPreviewUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={resolvedPreviewUrl}
          alt="Product cover preview"
          className="w-full h-full object-contain rounded-xl"
        />
      ) : (
        <span className="text-xs text-gray-400 font-semibold">Chưa có ảnh đại diện</span>
      )}
    </div>

    <div className="space-y-1">
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
        URL Ảnh đại diện hiện tại
      </label>
      <input
        type="text"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="/uploads/images/product.jpg..."
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
      />
    </div>
  </div>
</div>

{/* 5. Cấu hình Trạng thái & Nổi bật */}
<div className="bg-white p-6 rounded-3xl custom-shadow border border-gray-50 space-y-4">
  <div className="flex items-center gap-2 text-base font-extrabold text-[#202224] border-b border-gray-100 pb-3">
    <Layers className="w-5 h-5 text-[#4880FF]" />
    <span>Trạng thái & Cấu hình</span>
  </div>

  {/* Status Selector */}
  <div className="space-y-2">
    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
      Trạng thái kinh doanh
    </label>
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => setStatus('ACTIVE')}
        className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
          status === 'ACTIVE'
            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
        }`}
      >
        Đang bán
      </button>
      <button
        type="button"
        onClick={() => setStatus('INACTIVE')}
        className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
          status === 'INACTIVE'
            ? 'bg-gray-600 text-white border-gray-600 shadow-sm'
            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
        }`}
      >
        Ngừng bán
      </button>
    </div>
  </div>

  {/* Is Featured Toggle */}
  <div className="pt-2 border-t border-gray-100">
    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-200/80 cursor-pointer hover:bg-blue-50/50 transition-colors">
      <div className="space-y-0.5">
        <span className="text-xs font-bold text-[#202224] block">Sản phẩm nổi bật ⭐</span>
        <span className="text-[11px] text-gray-400 block">Ưu tiên hiển thị trang chủ</span>
      </div>
      <input
        type="checkbox"
        checked={isFeatured}
        onChange={(e) => setIsFeatured(e.target.checked)}
        className="w-5 h-5 rounded-lg text-[#4880FF] focus:ring-[#4880FF] border-gray-300 transition-all cursor-pointer"
      />
    </label>
  </div>
</div>

{/* Sticky Submit Bar */}
<div className="bg-white p-6 rounded-3xl custom-shadow border border-gray-50 space-y-3">
  <button
    type="submit"
    disabled={isSubmitting}
    className="w-full py-3.5 px-4 bg-[#4880FF] hover:bg-blue-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-blue-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
  >
    {isSubmitting ? (
      <>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Đang lưu sản phẩm...</span>
      </>
    ) : (
      <>
        <Save className="w-5 h-5" />
        <span>{mode === 'create' ? 'Tạo sản phẩm mới' : 'Cập nhật sản phẩm'}</span>
      </>
    )}
  </button>

  <Link
    href="/products"
    className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center"
  >
    Hủy bỏ quay lại
  </Link>
</div>
</div>
</div>
</form>

{/* Reusable Media Manager Modal for Cover and Gallery */}
<MediaManagerModal
  isOpen={isMediaPickerOpen}
  onClose={() => setIsMediaPickerOpen(false)}
  onSelectImage={handleSelectFromMedia}
  title={mediaPickerTarget === 'cover' ? 'Chọn ảnh đại diện sản phẩm' : 'Chọn ảnh cho thư viện sản phẩm'}
/>
</div>
);
}
