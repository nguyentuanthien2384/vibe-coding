'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingBag, Search, ArrowUp, ArrowDown, X, Plus, Loader2 } from 'lucide-react';
import { AttachedProduct, AttachedProductDetail } from '../../../types/blog.types';
import { useDebounce } from '../../../../../hooks/use-debounce';
import { blogApi } from '../../../../../lib/blog-api';
import { getImageUrl } from '../../../../../lib/image-url';

interface BlogCrossSellSectionProps {
  attachedProducts: AttachedProduct[];
  onAddProduct: (product: AttachedProductDetail) => void;
  onRemoveProduct: (productId: number) => void;
  onReorderProduct: (productId: number, direction: 'UP' | 'DOWN') => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function BlogCrossSellSection({
  attachedProducts,
  onAddProduct,
  onRemoveProduct,
  onReorderProduct,
}: BlogCrossSellSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AttachedProductDetail[]>([]);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Search products via API
  useEffect(() => {
    let isMounted = true;
    async function doSearch() {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await blogApi.searchEmbedProducts(debouncedQuery.trim());
        if (isMounted && res && res.data) {
          const filtered = res.data.filter(
            (p) => !attachedProducts.some((ap) => ap.product.id === p.id),
          );
          setSearchResults(filtered);
        }
      } catch (err) {
        console.warn('Search products failed:', err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    }
    doSearch();
    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, attachedProducts]);

  const handleAdd = (product: AttachedProductDetail) => {
    onAddProduct(product);
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-4 h-4 text-[#4880FF]" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#202224]">Sản phẩm liên quan</h2>
          <p className="text-xs text-gray-400">Gắn sản phẩm để tăng tỉ lệ chuyển đổi từ bài viết</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Tìm kiếm sản phẩm để gắn vào bài viết..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#202224] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4880FF]/20 focus:border-[#4880FF] transition-all"
        />

        {/* Search Results Dropdown */}
        {showResults && debouncedQuery && (
          <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin text-[#4880FF]" />
                Đang tìm sản phẩm...
              </div>
            ) : searchResults.length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-400 font-medium text-center">
                Không tìm thấy sản phẩm phù hợp
              </p>
            ) : (
              searchResults.map((product) => {
                const img = getImageUrl(product.imageUrl);
                return (
                  <button
                    key={product.id}
                    type="button"
                    onMouseDown={() => handleAdd(product)}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left cursor-pointer"
                  >
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                      <Image src={img} alt={product.name} fill className="object-cover" unoptimized />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#202224] line-clamp-1">{product.name}</p>
                      <p className="text-xs font-extrabold text-[#4880FF] mt-0.5">
                        {formatPrice(product.salePrice ?? product.price)}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-[#4880FF] flex-shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Attached Products List */}
      {attachedProducts.length > 0 && (
        <div className="space-y-2">
          {attachedProducts
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((attached, idx) => {
              const { product } = attached;
              const img = getImageUrl(product.imageUrl);
              return (
                <div
                  key={attached.id}
                  className="flex items-center justify-between p-3.5 bg-gray-50/80 hover:bg-gray-100/80 border border-gray-200 rounded-2xl transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                    <Image src={img} alt={product.name} fill className="object-cover" unoptimized />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 mx-3">
                    <p className="text-xs font-bold text-[#202224] line-clamp-1">{product.name}</p>
                    <p className="text-xs font-extrabold text-[#4880FF] mt-0.5">
                      {formatPrice(product.salePrice ?? product.price)}
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium">Kho: {product.stock}</p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[11px] font-bold text-gray-600">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => onReorderProduct(product.id, 'UP')}
                      disabled={idx === 0}
                      className="p-1.5 text-gray-400 hover:text-[#4880FF] hover:bg-blue-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onReorderProduct(product.id, 'DOWN')}
                      disabled={idx === attachedProducts.length - 1}
                      className="p-1.5 text-gray-400 hover:text-[#4880FF] hover:bg-blue-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveProduct(product.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {attachedProducts.length === 0 && !searchQuery && (
        <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-2xl">
          Chưa có sản phẩm nào được gắn vào bài viết
        </p>
      )}
    </div>
  );
}
