'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, Tag, DollarSign, PackageCheck, Layers } from 'lucide-react';
import { ProductItem, ProductFormData, CategoryOption, JSONEditorContent } from '../types/product.types';
import { MOCK_CATEGORIES } from '../data/mock-products';
import JSONRichEditor from './rich-editor/json-rich-editor';

interface ProductFormContainerProps {
  initialData?: ProductItem | null;
  mode: 'create' | 'edit';
}

// Utility slug generator from Vietnamese text
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
  mode,
}: ProductFormContainerProps) {
  const router = useRouter();

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || MOCK_CATEGORIES[0].id
  );
  const [price, setPrice] = useState<number | ''>(initialData?.price ?? '');
  const [salePrice, setSalePrice] = useState<number | ''>(
    initialData?.salePrice ?? ''
  );
  const [stock, setStock] = useState<number | ''>(initialData?.stock ?? 10);
  const [imageUrl, setImageUrl] = useState(
    initialData?.imageUrl ||
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop&q=80'
  );
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(
    initialData?.status || 'ACTIVE'
  );

  const [shortDescription, setShortDescription] = useState<JSONEditorContent | null>(
    initialData?.shortDescription || null
  );
  const [longDescription, setLongDescription] = useState<JSONEditorContent | null>(
    initialData?.longDescription || null
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-generate slug when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    if (mode === 'create' || !slug) {
      setSlug(generateSlug(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }

    setIsSubmitting(true);

    // Prepare DTO
    const formData: ProductFormData = {
      name,
      slug: slug || generateSlug(name),
      categoryId,
      price: Number(price) || 0,
      salePrice: salePrice ? Number(salePrice) : null,
      stock: Number(stock) || 0,
      imageUrl,
      isFeatured,
      status,
      shortDescription,
      longDescription,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/products');
      }, 1000);
    }, 800);
  };

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
              {mode === 'create' ? 'Thêm sản phẩm mới' : `Chỉnh sửa sản phẩm #${initialData?.id}`}
            </h1>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">
              Cập nhật thông tin chi tiết, giá bán và thuộc tính sản phẩm trong hệ thống
            </p>
          </div>
        </div>
      </div>

      {isSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 font-bold rounded-2xl flex items-center justify-between animate-fade-in">
          <span>✓ {mode === 'create' ? 'Tạo mới' : 'Cập nhật'} sản phẩm thành công! Đang chuyển hướng...</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Main Column: General, Pricing, Media, Description */}
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
                  placeholder="Ví dụ: Apple Watch Series 4 GPS..."
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
                  placeholder="apple-watch-series-4"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
                />
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Chuyên mục sản phẩm <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-[#202224] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all cursor-pointer"
                >
                  {MOCK_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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
                    Giá gốc ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="690.00"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-extrabold text-[#4880FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
                  />
                </div>

                {/* Giá khuyến mãi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Giá khuyến mãi ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="590.00 (không bắt buộc)"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
                  />
                </div>

                {/* Tồn kho */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Số lượng tồn kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="63"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#202224] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 3. Mô tả sản phẩm (JSON Editor Format) */}
            <div className="bg-white p-6 rounded-3xl custom-shadow border border-gray-50 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-base font-extrabold text-[#202224]">
                  <Sparkles className="w-5 h-5 text-[#4880FF]" />
                  <span>Mô tả sản phẩm (Xuất JSON Format)</span>
                </div>
              </div>

              {/* Short Description JSON Editor */}
              <JSONRichEditor
                label="Mô tả ngắn (Short Description)"
                value={shortDescription}
                onChange={setShortDescription}
                placeholder="Nhập tóm tắt mô tả ngắn sản phẩm..."
              />

              {/* Long Description JSON Editor */}
              <JSONRichEditor
                label="Mô tả chi tiết (Long Description)"
                value={longDescription}
                onChange={setLongDescription}
                placeholder="Nhập chi tiết tính năng, thông số kỹ thuật sản phẩm..."
              />
            </div>
          </div>

          {/* Right Sidebar Column: Media & Settings */}
          <div className="space-y-6">
            {/* 4. Hình ảnh sản phẩm */}
            <div className="bg-white p-6 rounded-3xl custom-shadow border border-gray-50 space-y-4">
              <div className="flex items-center gap-2 text-base font-extrabold text-[#202224] border-b border-gray-100 pb-3">
                <ImageIcon className="w-5 h-5 text-[#4880FF]" />
                <span>Ảnh sản phẩm</span>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  URL Hình ảnh
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF] transition-all"
                />

                {/* Preview Box */}
                <div className="w-full h-48 rounded-2xl bg-gray-50 border border-gray-200 p-2 flex items-center justify-center overflow-hidden relative shadow-inner">
                  {imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <span className="text-xs text-gray-400 font-semibold">Chưa có xem trước ảnh</span>
                  )}
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
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all border ${
                      status === 'ACTIVE'
                        ? 'bg-green-50 text-green-700 border-green-200 shadow-sm'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ● Đang bán (Active)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('INACTIVE')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all border ${
                      status === 'INACTIVE'
                        ? 'bg-gray-200 text-gray-700 border-gray-300 shadow-sm'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ○ Tạm ẩn (Inactive)
                  </button>
                </div>
              </div>

              {/* Featured Switch */}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                <div>
                  <h4 className="text-sm font-bold text-[#202224]">Sản phẩm nổi bật</h4>
                  <p className="text-xs text-gray-400 font-medium">Hiển thị ở vị trí ưu tiên trang chủ</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors ${
                    isFeatured ? 'bg-[#4880FF]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                      isFeatured ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Submit Action Buttons */}
            <div className="bg-white p-6 rounded-3xl custom-shadow border border-gray-50 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-[#4880FF] hover:bg-blue-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-blue-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-5 h-5" />
                <span>{isSubmitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo sản phẩm mới' : 'Cập nhật sản phẩm'}</span>
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
    </div>
  );
}
