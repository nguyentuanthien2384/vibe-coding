'use client';

// components/product-list/product-grid.tsx
import { ProductItemData } from '@/types/product-list';
import ProductCardList from '@/components/shared/product-card-list';
import SkeletonCard from '@/components/shared/skeleton-card';
import ProductListEmpty from './product-list-empty';
import { useCartStore } from '@/store/use-cart-store';
import { useProductListNavigation } from '@/hooks/use-product-list-navigation';

const SKELETON_COUNT = 8;

export interface ProductGridContainerProps {
  products: ProductItemData[];
  isLoading?: boolean;
  isFilterOpen: boolean;
  onAddToCart?: (productId: string) => void;
  onResetFilter?: () => void;
}

const ProductGrid = ({
  products,
  isLoading = false,
  isFilterOpen,
  onAddToCart,
  onResetFilter,
}: ProductGridContainerProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const { resetAllFilters } = useProductListNavigation();

  const handleAddToCart = (productId: string) => {
    if (onAddToCart) {
      onAddToCart(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      image: product.imageUrl,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
    });
  };

  const handleResetFilter = onResetFilter ?? resetAllFilters;

  const gridClass = isFilterOpen
    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
    : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6';

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <ProductListEmpty onResetFilter={handleResetFilter} />;
  }

  return (
    <div className={gridClass}>
      {products.map((product) => (
        <ProductCardList key={product.id} product={product} onAddToCart={handleAddToCart} />
      ))}
    </div>
  );
};

export default ProductGrid;
