import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import { MaintenanceBanner } from "../components/layout/maintenance-banner";
import { FloatingContactWidget } from "../components/layout/floating-contact-widget";
import { HeroBanner } from "../components/home/hero-banner";
import { CategoryRail } from "../components/home/category-rail";
import { FeaturedProductsSection } from "../components/home/featured-products";
import { SocialProofBanner } from "../components/home/social-proof-banner";
import { Product } from "../components/home/product-card";
import { CartDrawer } from "../components/cart/cart-drawer";
import { Toast } from "../components/ui/toast";
import { getHeroBanners, getCategories, getFeaturedProducts } from "../lib/home";
import { getPublicSettings } from "../lib/settings";

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

  // Fetch song song các nguồn dữ liệu chính kèm Settings
  const [
    { banners, isError: bannersIsError },
    { categories },
    { general, menus, seo },
  ] = await Promise.all([
    getHeroBanners(),
    getCategories(),
    getPublicSettings(),
  ]);

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
    <div className="bg-gray-50 min-h-screen font-sans antialiased text-slate-900 pb-16 md:pb-0 flex flex-col justify-between">
      <div>
        {general.maintenanceMode && (
          <MaintenanceBanner message={general.maintenanceMessage} />
        )}
        <Header generalSettings={general} menus={menus} />

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
      </div>

      {/* Dynamic Footer */}
      <Footer generalSettings={general} menus={menus} seo={seo} />

      {/* Floating Contact & Quick Social Widget */}
      <FloatingContactWidget generalSettings={general} seo={seo} />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
}
