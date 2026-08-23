import { Header } from "../components/layout/header";
import { HeroBanner } from "../components/home/hero-banner";
import { CategoryRail } from "../components/home/category-rail";
import { FeaturedProductsSection } from "../components/home/featured-products";
import { SocialProofBanner } from "../components/home/social-proof-banner";
import { Product } from "../components/home/product-card";
import { CartDrawer } from "../components/cart/cart-drawer";
import { Toast } from "../components/ui/toast";
import { getHeroBanners, getCategories, getFeaturedProducts } from "../lib/home";

// Fallback khi banner chưa có trong DB
const FALLBACK_HERO = {
  badgeLabel: "🔥 HOT DEAL • 22h - 2h sáng",
  title: "Nạp Năng Lượng\nCode Phê Hơn",
  subtitle: "Combo Thức Khuya giảm giá 20% — Chỉ dành cho anh em chạy deadline.",
  ctaLabel: "Xem Combo Ngay",
  ctaHref: "/products?tag=combo-deadline",
  imageUrl:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1400&h=500",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const resolvedParams = await searchParams;
  const activeCategorySlug = resolvedParams?.category || "";

  // Fetch song song 2 nguồn dữ liệu chính
  const [{ banners, isError: bannersIsError }, { categories, isError: categoriesIsError }] =
    await Promise.all([getHeroBanners(), getCategories()]);

  // Tìm categoryId từ slug được chọn
  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);
  const activeCategoryId = activeCategory ? activeCategory.id : undefined;

  // Fetch danh sách sản phẩm theo danh mục hoặc nổi bật
  const { products, isError: productsIsError } = await getFeaturedProducts(
    1,
    8,
    activeCategoryId
  );

  // Map banner đầu tiên sang HeroBanner props (fallback nếu DB chưa có data hoặc lỗi)
  const firstBanner = banners[0];
  const heroProps = firstBanner && !bannersIsError
    ? {
        badgeLabel: "🔥 HOT DEAL",
        title: firstBanner.title,
        subtitle: firstBanner.subtitle ?? "",
        ctaLabel: "Xem Ngay",
        ctaHref: firstBanner.linkUrl ?? "/products",
        imageUrl: firstBanner.imageUrl,
      }
    : FALLBACK_HERO;

  // Map categories từ API sang format CategoryRail cần
  const categoryRailItems = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    iconUrl: c.iconUrl ?? "",
  }));

  // Map featured products từ API sang Product type của ProductCard
  const featuredProducts: Product[] = products.map((p) => ({
    id: String(p.id),
    name: p.name,
    price: p.price,
    salePrice: p.salePrice,
    stock: p.stock,
    imageUrl: p.imageUrl,
  }));

  return (
    <div className="bg-gray-50 min-h-screen font-sans antialiased text-slate-900 pb-16 md:pb-0">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Section 1: Hero Banner */}
        <HeroBanner {...heroProps} />

        {/* Section 2: Category Rail */}
        <CategoryRail
          categories={categoryRailItems}
          activeCategorySlug={activeCategorySlug}
        />

        {/* Section 3: Social Proof Banner */}
        <SocialProofBanner
          statNumber="500+"
          message="anh em dev đã nạp năng lượng tại TechBite"
        />

        {/* Section 4: Featured Products */}
        <FeaturedProductsSection
          title={activeCategory ? `Danh Mục: ${activeCategory.name}` : "Món Bán Chạy 🔥"}
          subtitle={
            activeCategory
              ? `Các món ngon thuộc danh mục ${activeCategory.name}`
              : "Top 8 món được anh em dev order nhiều nhất tuần này"
          }
          actionLabel="Xem tất cả"
          actionHref="/products"
          products={featuredProducts}
          isError={productsIsError}
        />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-8 sm:py-10 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <span className="text-xl font-extrabold tracking-tight">
              Tech<span className="text-orange-500">Bite</span>
            </span>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Nạp năng lượng tức thì cho Đội ngũ Chạy Deadline &amp; Coder.
            </p>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500">
            © 2026 TechBite E-Commerce. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}

