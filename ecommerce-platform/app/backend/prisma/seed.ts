// prisma/seed.ts
// Seed data cho module Home Page: Banner, Category, Product
// Chạy: npm run db:seed

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient, BannerType, Role, PostStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

// Parse DATABASE_URL: mysql://user:pass@host:port/db
const dbUrl = new URL(
  process.env.DATABASE_URL ?? 'mysql://root:123456@127.0.0.1:3306/ecommerce_db',
);

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port || '3306', 10),
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace('/', ''),
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Bắt đầu seeding...');

  // ─── CLEAN UP (idempotent) ─────────────────────────────────────────────────
  await prisma.postProduct.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.postCategory.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  console.log('🗑️  Đã xóa dữ liệu cũ');

  // ─── BANNERS (Home Page) ──────────────────────────────────────────────────
  const bannersHome = await prisma.banner.createMany({
    data: [
      {
        title: 'Nạp Năng Lượng — Code Phê Hơn',
        subtitle: '🔥 HOT DEAL • 22h - 2h sáng | Combo Thức Khuya giảm giá 20%',
        imageUrl:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1400&h=500',
        linkUrl: '/products?tag=combo-deadline',
        type: BannerType.HERO_BANNER,
        position: 1,
        isActive: true,
      },
      {
        title: 'Đồ Ăn Vặt Giờ Vàng',
        subtitle: 'Flash Sale mỗi tối 8h — giảm đến 30% toàn bộ snack',
        imageUrl:
          'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=1400&h=500',
        linkUrl: '/products?category=do-an-vat',
        type: BannerType.PROMOTION_BANNER,
        position: 1,
        isActive: true,
      },
      {
        title: '500+ Anh Em Dev Đã Tin Dùng',
        subtitle: 'Ship nhanh 30 phút — Freeship cho đơn từ 150k',
        imageUrl:
          'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1400&h=300',
        linkUrl: null,
        type: BannerType.SOCIAL_PROOF,
        position: 1,
        isActive: true,
      },
    ],
  });
  console.log(`✅ Đã tạo ${bannersHome.count} banners (Home Page)`);

  // ─── BANNERS (Product List Page) ──────────────────────────────────────────
  const bannersProductList = await prisma.banner.createMany({
    data: [
      {
        title: 'Flash Sale Snack — Chỉ Hôm Nay!',
        subtitle: '⚡ Giảm 30% tất cả Đồ Ăn Vặt • Áp dụng đến 23:59 hôm nay',
        imageUrl:
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200&h=300',
        linkUrl: '/products?category=do-an-vat&sortBy=isFeatured&sortOrder=desc',
        type: BannerType.PROMOTION_BANNER,
        position: 10,
        isActive: true,
      },
      {
        title: 'Freeship Đơn Từ 99k 🛵',
        subtitle: 'Giao hàng tận nơi trong 30 phút — Order ngay đừng chần chừ!',
        imageUrl:
          'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=1200&h=300',
        linkUrl: '/products?sortBy=price&sortOrder=asc',
        type: BannerType.PROMOTION_BANNER,
        position: 11,
        isActive: true,
      },
      {
        title: 'Combo Deadline — Tiết Kiệm Tới 35%',
        subtitle: 'Cà phê + Snack + Trà sữa | Bộ ba hoàn hảo cho đêm chạy deadline',
        imageUrl:
          'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=1200&h=300',
        linkUrl: '/products?category=combo-deadline',
        type: BannerType.PROMOTION_BANNER,
        position: 12,
        isActive: true,
      },
    ],
  });
  console.log(`✅ Đã tạo ${bannersProductList.count} banners (Product List Page)`);

  // ─── CATEGORIES ───────────────────────────────────────────────────────────
  const catDoAnVat = await prisma.category.create({
    data: {
      name: 'Đồ Ăn Vặt',
      slug: 'do-an-vat',
      iconUrl: '🍟',
      position: 1,
      isActive: true,
    },
  });

  const catNuocUong = await prisma.category.create({
    data: {
      name: 'Nước Uống',
      slug: 'nuoc-uong',
      iconUrl: '🧃',
      position: 2,
      isActive: true,
    },
  });

  const catTraiCay = await prisma.category.create({
    data: {
      name: 'Trái Cây Tô',
      slug: 'trai-cay-to',
      iconUrl: '🍓',
      position: 3,
      isActive: true,
    },
  });

  const catCombo = await prisma.category.create({
    data: {
      name: 'Combo Deadline',
      slug: 'combo-deadline',
      iconUrl: '💻',
      position: 4,
      isActive: true,
    },
  });

  const catTraSua = await prisma.category.create({
    data: {
      name: 'Trà Sữa',
      slug: 'tra-sua',
      iconUrl: '🧋',
      position: 5,
      isActive: true,
    },
  });

  console.log('✅ Đã tạo 5 categories');

  // ─── PRODUCTS ─────────────────────────────────────────────────────────────
  const products = await prisma.product.createMany({
    data: [
      // --- Burger & Combo ---
      {
        name: 'Burger Bò Phô Mai Hai Tầng Sốt BBQ Đặc Biệt',
        slug: 'burger-bo-pho-mai-hai-tang-sot-bbq',
        description: 'Trải nghiệm bùng nổ vị giác với 2 lớp bò Úc tươi xay nướng than hoa mọng nước, phô mai Cheddar tan chảy béo ngậy, kẹp trong vỏ bánh mì bơ Pháp mềm thơm, quyện cùng nước sốt BBQ công thức độc quyền đậm đà.',
        price: 119000,
        salePrice: 89000,
        stock: 45,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catCombo.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Combo Gà Rán Sốt Cay Hàn Quốc + Pepsi',
        slug: 'combo-ga-ran-sot-cay-han-quoc-pepsi',
        description: 'Gà rán giòn rụm phủ sốt cay ngọt chuẩn vị Hàn Quốc, kèm 1 ly Pepsi mát lạnh giúp giải đắng ngắt khi fixer bug thâm đêm.',
        price: 105000,
        salePrice: 89000,
        stock: 35,
        imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catCombo.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Combo Năng Lượng Coder (3 món)',
        slug: 'combo-nang-luong-coder-3-mon',
        description: 'Bộ ba cứu cánh đêm muộn: 1 Cà phê đen phin đậm đặc + 1 Khô gà lá chanh 100g + 1 Snack mực nướng Hàn Quốc.',
        price: 120000,
        salePrice: 89000,
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catCombo.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Combo Bug Killer (5 món)',
        slug: 'combo-bug-killer-5-mon',
        description: 'Combo giải cứu deadline đỉnh cao: Trà sữa oolong nướng + 2 gói snack + 1 lon nước tăng lực Celsius + 1 hộp mochi trà xanh.',
        price: 180000,
        salePrice: 149000,
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catCombo.id,
        isFeatured: true,
        isActive: true,
      },

      // --- Đồ Ăn Vặt ---
      {
        name: 'Khô Gà Lá Chanh Xé Cay Premium',
        slug: 'kho-ga-la-chanh-xe-cay',
        description: 'Khô gà xé sợi tẩm ướp ớt sừng và lá chanh tươi rang sấy giòn rụm. Hương vị đậm đà cay nồng vừa phải, ăn hoài không chán.',
        price: 55000,
        salePrice: 45000,
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catDoAnVat.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Khoai Tây Chiên Lắc Phô Mai Bơ Tỏi',
        slug: 'khoai-tay-chien-lac-pho-mai-bo-toi',
        description: 'Khoai tây cắt lát giòn tan lắc cùng bột phô mai bơ tỏi thơm ngậy béo bùi, vàng ươm hấp dẫn.',
        price: 45000,
        salePrice: 35000,
        stock: 60,
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catDoAnVat.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Bánh Mỳ Nướng Bơ Tỏi Xốt Kem Phô Mai',
        slug: 'banh-my-nuong-bo-toi-xot-kem-pho-mai',
        description: 'Bánh mỳ nướng bơ tỏi giòn rụm bên ngoài, béo ngậy mềm mịn với nhân xốt kem phô mai chảy béo ngậy bên trong.',
        price: 49000,
        salePrice: 39000,
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catDoAnVat.id,
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Snack Vị Mực Nướng Hàn Quốc',
        slug: 'snack-vi-muc-nuong-han-quoc',
        description: 'Snack mực nướng tẩm vị sa tế đậm đà nhập khẩu Hàn Quốc, vừa giòn ngọt vừa thơm mùi biển.',
        price: 38000,
        salePrice: null,
        stock: 80,
        imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catDoAnVat.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Hạt Macca Rang Muối Úc',
        slug: 'hat-macca-rang-muoi-uc',
        description: 'Hạt macca nhập khẩu Úc rang muối sấy giòn, giàu Omega-3 giúp nạp năng lượng nhanh cho não bộ khi làm việc ban đêm.',
        price: 75000,
        salePrice: 65000,
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1567892737950-30c4db39a622?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catDoAnVat.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Bánh Mochi Kem Trà Xanh Matcha',
        slug: 'banh-mochi-kem-tra-xanh',
        description: 'Bánh mochi dẻo mịn với lớp vỏ nếp mềm dẻo và nhân kem trà xanh Matcha nguyên chất thanh mát dịu ngọt.',
        price: 35000,
        salePrice: 28000,
        stock: 0,
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catDoAnVat.id,
        isFeatured: false,
        isActive: true,
      },

      // --- Nước Uống ---
      {
        name: 'Nước Tăng Lực Celsius Dưa Hấu 355ml',
        slug: 'nuoc-tang-luc-celsius-dua-hau',
        description: ' Celsius dưa hấu mát lạnh chứa 200mg caffeine tự nhiên & b vitamin giúp duy trì tỉnh táo suốt 8 tiếng code không lo mệt mỏi.',
        price: 32000,
        salePrice: 25000,
        stock: 100,
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catNuocUong.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Cà Phê Đen Đá Phin Đậm Đà',
        slug: 'ca-phe-den-da',
        description: 'Cà phê Robusta Đắk Lắk nguyên chất pha phin đậm đà, vị đắng dịu hậu vị ngọt sâu, đánh tan cơn buồn ngủ.',
        price: 30000,
        salePrice: 25000,
        stock: 200,
        imageUrl: 'https://images.unsplash.com/photo-1611564494260-6f21b80af7ea?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catNuocUong.id,
        isFeatured: false,
        isActive: true,
      },

      // --- Trà Sữa ---
      {
        name: 'Trà Sữa Oolong Nướng Full Topping',
        slug: 'tra-sua-oolong-nuong-full-topping',
        description: 'Đậm đà vị trà oolong nướng thơm sực, hòa cùng vị béo thơm của sữa tươi và đầy ắp trân châu đường đen, thạch dừa, pudding sô-cô-la.',
        price: 45000,
        salePrice: 35000,
        stock: 40,
        imageUrl: 'https://images.unsplash.com/photo-1558857563-b37102e99e00?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catTraSua.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Trà Sữa Đào Cam Sả Size L',
        slug: 'tra-sua-dao-cam-sa-size-l',
        description: 'Trà tươi vị đào thơm ngát kết hợp cam tươi dầm sả đập dập, vị chua ngọt thanh mát và giải nhiệt sảng khoái.',
        price: 52000,
        salePrice: 45000,
        stock: 60,
        imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catTraSua.id,
        isFeatured: true,
        isActive: true,
      },

      // --- Trái Cây Tô ---
      {
        name: 'Trái Cây Tô Sữa Chua Hy Lạp Mix',
        slug: 'trai-cay-to-sua-chua-mix',
        description: 'Tô trái cây nhiệt đới tươi xanh (dưa hấu, kiwi, nho ngón tay, xoài chín, dâu tây) phủ sữa chua Hy Lạp béo mịn mát lạnh.',
        price: 55000,
        salePrice: 45000,
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catTraiCay.id,
        isFeatured: true,
        isActive: true,
      },
    ],
  });

  // ─── VOUCHERS (Checkout Module) ───────────────────────────────────────────
  await prisma.voucher.deleteMany();
  await prisma.voucher.createMany({
    data: [
      {
        code: 'TECHBITE200K',
        title: 'Voucher Giảm 200k Cho Đơn Hàng Chạy Deadline',
        discountType: 'FIXED_AMOUNT',
        discountValue: 200000,
        minOrderAmount: 300000,
        usageLimit: 1000,
        isActive: true,
      },
      {
        code: 'WELCOME50K',
        title: 'Voucher Giảm 50k Cho Khách Hàng Mới',
        discountType: 'FIXED_AMOUNT',
        discountValue: 50000,
        minOrderAmount: 100000,
        usageLimit: 5000,
        isActive: true,
      },
    ],
  });
  console.log('✅ Đã tạo 2 vouchers mẫu');

  // ─── SYSTEM SETTINGS (Settings Module) ──────────────────────────────────
  await prisma.systemSetting.deleteMany();
  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'general',
        value: {
          storeName: 'TechBite - Chuỗi Cửa Hàng Công Nghệ & Đồ Ăn Đỉnh Cao',
          storeEmail: 'contact@techbite.vn',
          storePhone: '1900 6868',
          hotline: '0988 123 456',
          storeAddress: 'Tầng 12, Tòa nhà Innovation Tower, Đường Cầu Giấy, Hà Nội',
          copyrightText: '© 2026 TechBite E-Commerce Platform. Tất cả quyền được bảo lưu.',
          logoUrl: '/images/logo-techbite.png',
          faviconUrl: '/images/favicon.ico',
          workingHours: '08:00 - 22:00 (Thứ 2 - Chủ Nhật)',
          taxCode: '0109988776',
          maintenanceMode: false,
          maintenanceMessage: 'Hệ thống đang bảo trì nâng cấp định kỳ. Vui lòng quay lại sau ít phút!',
        },
      },
      {
        key: 'menus',
        value: [
          {
            id: 'm-1',
            title: 'Trang chủ',
            targetUrl: '/',
            location: 'HEADER',
            icon: 'Home',
            order: 1,
            openInNewTab: false,
            isActive: true,
            children: [],
          },
          {
            id: 'm-2',
            title: 'Sản phẩm & Thực đơn',
            targetUrl: '/products',
            location: 'HEADER',
            icon: 'ShoppingBag',
            order: 2,
            openInNewTab: false,
            isActive: true,
            children: [],
          },
          {
            id: 'm-3',
            title: 'Khuyến mãi hot 🔥',
            targetUrl: '/products?onSale=true',
            location: 'HEADER',
            icon: 'Flame',
            order: 3,
            openInNewTab: false,
            isActive: true,
            children: [],
          },
          {
            id: 'm-4',
            title: 'Về TechBite',
            targetUrl: '/about',
            location: 'FOOTER_COL1',
            order: 1,
            openInNewTab: false,
            isActive: true,
          },
          {
            id: 'm-5',
            title: 'Chính sách bảo mật',
            targetUrl: '/policy/privacy',
            location: 'FOOTER_COL2',
            order: 1,
            openInNewTab: false,
            isActive: true,
          },
        ],
      },
      {
        key: 'seo',
        value: {
          metaTitle: 'TechBite - Sàn Thương Mại Điện Tử Công Nghệ & Đồ Ăn Hàng Đầu',
          metaDescription: 'Mua sắm các thiết bị công nghệ chính hãng, ẩm thực nhanh cao cấp với giá ưu đãi tốt nhất và giao hàng hỏa tốc trong 30 phút tại TechBite Vietnam.',
          metaKeywords: 'TechBite, E-commerce, Công nghệ, Đồ ăn, FastFood, Điện thoại, Khuyến mãi',
          canonicalUrl: 'https://techbite.vn',
          metaRobots: 'index, follow',
          ogTitle: 'TechBite - Trải Nghiệm Mua Sắm Đỉnh Cao',
          ogDescription: 'Khám phá hàng ngàn ưu đãi công nghệ và đồ ăn hấp dẫn mỗi ngày.',
          ogImageUrl: '/images/techbite-og-banner.jpg',
          ogType: 'website',
          twitterCard: 'summary_large_image',
          twitterSite: '@techbite_vn',
          facebookUrl: 'https://facebook.com/techbite.vietnam',
          zaloUrl: 'https://zalo.me/techbite',
          instagramUrl: 'https://instagram.com/techbite_official',
          tiktokUrl: 'https://tiktok.com/@techbite.store',
          youtubeUrl: 'https://youtube.com/@techbite_vietnam',
          googleSiteVerification: 'google-site-verification-token-sample',
          googleAnalyticsId: 'G-TECHBITE999',
          customHeadScript: '',
          customBodyScript: '',
        },
      },
      {
        key: 'email',
        value: {
          mailDriver: 'smtp',
          smtpHost: 'smtp.ethereal.email',
          smtpPort: 587,
          smtpEncryption: 'tls',
          smtpUser: 'techbite.mailer@ethereal.email',
          smtpPassword: '',
          fromName: 'TechBite Platform',
          fromEmail: 'noreply@techbite.vn',
          replyToEmail: 'support@techbite.vn',
          adminAlertEmail: 'admin@techbite.vn',
          enableOrderAlertAdmin: true,
          enableWelcomeMail: true,
        },
      },
      {
        key: 'payment',
        value: {
          bankName: 'MB Bank (Ngân hàng TMCP Quân Đội)',
          bankAccountNo: '9999888899',
          bankAccountHolder: 'CTY TNHH TECHBITE VIETNAM',
          vietQrTemplate: 'compact',
          enableCod: true,
          paymentNote: 'Vui lòng kiểm tra lại đúng Mã Đơn Hàng trong nội dung chuyển khoản để hệ thống xác nhận tự động trong 30 giây.',
        },
      },
      {
        key: 'shipping',
        value: {
          defaultShippingFee: 30000,
          freeShippingThreshold: 500000,
          estimatedDeliveryTime: '24 - 48 giờ đối với nội thành, 2 - 4 ngày đối với toàn quốc',
        },
      },
    ],
  });
  console.log('✅ Đã tạo 6 system settings mẫu (general, menus, seo, email, payment, shipping)');

  // ─── ROLE GROUPS & STAFFS ──────────────────────────────────────────────────
  const superAdminRole = await prisma.roleGroup.upsert({
    where: { slug: 'super-admin' },
    create: {
      name: 'Super Admin',
      slug: 'super-admin',
      description: 'Toàn quyền quản trị hệ thống. Không thể chỉnh sửa.',
      isSystem: true,
      permissions: [
        'product.view',
        'product.manage',
        'category.manage',
        'order.view',
        'order.update_status',
        'payment.confirm',
        'report.export',
        'customer.view',
        'banner.manage',
      ],
    },
    update: {
      isSystem: true,
      permissions: [
        'product.view',
        'product.manage',
        'category.manage',
        'order.view',
        'order.update_status',
        'payment.confirm',
        'report.export',
        'customer.view',
        'banner.manage',
      ],
    },
  });

  const storeManagerRole = await prisma.roleGroup.upsert({
    where: { slug: 'cua-hang-truong' },
    create: {
      name: 'Cửa hàng trưởng',
      slug: 'cua-hang-truong',
      description: 'Quản lý sản phẩm, đơn hàng và xem báo cáo khách hàng.',
      isSystem: false,
      permissions: [
        'product.view',
        'product.manage',
        'category.manage',
        'order.view',
        'order.update_status',
        'payment.confirm',
        'report.export',
        'customer.view',
      ],
    },
    update: {},
  });

  const warehouseRole = await prisma.roleGroup.upsert({
    where: { slug: 'nhan-vien-kho' },
    create: {
      name: 'Nhân viên kho',
      slug: 'nhan-vien-kho',
      description: 'Chỉ quản lý tồn kho và cập nhật trạng thái đơn hàng.',
      isSystem: false,
      permissions: ['product.view', 'order.view', 'order.update_status'],
    },
    update: {},
  });

  const cskhRole = await prisma.roleGroup.upsert({
    where: { slug: 'cskh-marketing' },
    create: {
      name: 'CSKH & Marketing',
      slug: 'cskh-marketing',
      description: 'Quản lý đơn hàng, thông tin khách hàng và banner quảng cáo.',
      isSystem: false,
      permissions: ['order.view', 'customer.view', 'banner.manage'],
    },
    update: {},
  });
  console.log('✅ Đã tạo 4 nhóm quyền mẫu (Super Admin, Cửa hàng trưởng, Nhân viên kho, CSKH)');

  const staffPassword = await bcrypt.hash('Password123', 12);
  const adminPassword = await bcrypt.hash('Admin123@', 12);

  // Admin Account
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@techbite.com' },
    create: {
      email: 'admin@techbite.com',
      password: adminPassword,
      fullName: 'Hoàng Nam Dev',
      phone: '0901234567',
      role: Role.ADMIN,
      roleGroupId: superAdminRole.id,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop',
      isActive: true,
      notes: 'Senior Fullstack Engineer & Lead Tech Writer tại TechBite.',
    },
    update: {
      roleGroupId: superAdminRole.id,
      fullName: 'Hoàng Nam Dev',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop',
      notes: 'Senior Fullstack Engineer & Lead Tech Writer tại TechBite.',
    },
  });

  // Staff 1
  const staffUser1 = await prisma.user.upsert({
    where: { email: 'staff.01@techbite.com' },
    create: {
      email: 'staff.01@techbite.com',
      password: staffPassword,
      fullName: 'Minh Thư Nutrition',
      phone: '0908765432',
      role: Role.STAFF,
      roleGroupId: storeManagerRole.id,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
      isActive: true,
      notes: 'Chuyên gia dinh dưỡng và biên tập viên chuyên mục Mẹo Sinh Tồn.',
    },
    update: {
      roleGroupId: storeManagerRole.id,
      fullName: 'Minh Thư Nutrition',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
      notes: 'Chuyên gia dinh dưỡng và biên tập viên chuyên mục Mẹo Sinh Tồn.',
    },
  });

  // Staff 2 (Blocked)
  await prisma.user.upsert({
    where: { email: 'staff.02@techbite.com' },
    create: {
      email: 'staff.02@techbite.com',
      password: staffPassword,
      fullName: 'Lê Văn C',
      phone: '0912345678',
      role: Role.STAFF,
      roleGroupId: warehouseRole.id,
      isActive: false,
      notes: 'Tài khoản tạm khóa do chuyển công tác.',
    },
    update: {
      roleGroupId: warehouseRole.id,
      isActive: false,
    },
  });

  // Staff 3 (With custom permissions)
  const staffUser3 = await prisma.user.upsert({
    where: { email: 'staff.03@techbite.com' },
    create: {
      email: 'staff.03@techbite.com',
      password: staffPassword,
      fullName: 'Tuấn Anh Food Review',
      phone: '0987654321',
      role: Role.STAFF,
      roleGroupId: cskhRole.id,
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop',
      customPermissions: ['product.view'],
      isActive: true,
      notes: 'Food Reviewer & Tech Snacker đam mê khám phá các món ăn đêm.',
    },
    update: {
      roleGroupId: cskhRole.id,
      fullName: 'Tuấn Anh Food Review',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop',
      customPermissions: ['product.view'],
    },
  });
  console.log('✅ Đã tạo 4 tài khoản quản trị & nhân viên mẫu');

  // ─── BLOG MODULE SEEDING ──────────────────────────────────────────────────
  const blogCatCoder = await prisma.postCategory.create({
    data: {
      name: 'Góc Coder Thức Khuya',
      slug: 'goc-coder-thuc-khuya',
      description: 'Bí quyết nạp năng lượng, giữ tỉnh táo 100% khi thức đêm làm việc từ TechBite.',
      icon: '💻',
      orderIndex: 1,
      isActive: true,
    },
  });

  const blogCatReview = await prisma.postCategory.create({
    data: {
      name: 'Review Đồ Ăn Vặt',
      slug: 'review-do-an-vat',
      description: 'Đánh giá chân thực các món ăn vặt ngon, sạch, tiện lợi không dính tay lên phím.',
      icon: '🍿',
      orderIndex: 2,
      isActive: true,
    },
  });

  const blogCatDrinks = await prisma.postCategory.create({
    data: {
      name: 'Nước Tăng Lực & Cà Phê',
      slug: 'nuoc-tang-luc-ca-phe',
      description: 'Phân tích các dòng đồ uống tỉnh táo không đường, không gây mệt mỏi sau cữ dùng.',
      icon: '⚡',
      orderIndex: 3,
      isActive: true,
    },
  });

  const blogCatTips = await prisma.postCategory.create({
    data: {
      name: 'Mẹo Năng Lượng Đỉnh Cao',
      slug: 'meo-nang-luong',
      description: 'Cẩm nang dinh dưỡng khoa học giúp duy trì nhịp độ làm việc bền bỉ 12 tiếng.',
      icon: '🔥',
      orderIndex: 4,
      isActive: true,
    },
  });
  console.log('✅ Đã tạo 4 Blog Categories');

  // Tags
  const tagDeadline = await prisma.tag.create({ data: { name: 'chay-deadline', slug: 'chay-deadline' } });
  const tagCoder = await prisma.tag.create({ data: { name: 'coder-thuc-khuya', slug: 'coder-thuc-khuya' } });
  const tagAnVat = await prisma.tag.create({ data: { name: 'an-vat-it', slug: 'an-vat-it' } });
  const tagEnergy = await prisma.tag.create({ data: { name: 'energy-drinks', slug: 'energy-drinks' } });
  const tagKhoGa = await prisma.tag.create({ data: { name: 'kho-ga', slug: 'kho-ga' } });
  const tagHealth = await prisma.tag.create({ data: { name: 'suc-khoe-lap-trinh', slug: 'suc-khoe-lap-trinh' } });
  const tagHat = await prisma.tag.create({ data: { name: 'hat-dinh-duong', slug: 'hat-dinh-duong' } });

  // Lấy danh sách sản phẩm để liên kết Cross-selling
  const dbProducts = await prisma.product.findMany();
  const khoGaProduct = dbProducts.find((p) => p.slug === 'kho-ga-la-chanh-xe-cay') || dbProducts[0];
  const celsiusProduct = dbProducts.find((p) => p.slug === 'nuoc-tang-luc-celsius-dua-hau') || dbProducts[1];
  const maccaProduct = dbProducts.find((p) => p.slug === 'hat-macca-rang-muoi-uc') || dbProducts[2];

  // Post 1: Hero Post
  const post1 = await prisma.post.create({
    data: {
      title: "Top 7 Món Ăn Vặt 'Cứu Cánh' Đêm Chạy Deadline Cho Anh Em Lập Trình Viên",
      slug: 'top-7-mon-an-vat-cuu-canh-dem-chay-deadline',
      summary: 'Tổng hợp các món ăn nhanh vừa tiện lợi, vừa giàu protein giúp giữ tỉnh táo 100% suốt đêm trắng fix bug mà không sợ nặng bụng hay buồn ngủ.',
      thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=675&fit=crop',
      status: PostStatus.PUBLISHED,
      views: 1845,
      readTimeMinutes: 6,
      authorId: adminUser.id,
      categoryId: blogCatCoder.id,
      publishedAt: new Date('2026-08-25T14:30:00.000Z'),
      metaTitle: "Top 7 Món Ăn Vặt Cứu Cánh Đêm Chạy Deadline Cho Lập Trình Viên | TechBite",
      metaDescription: "Tổng hợp các món ăn nhanh tiện lợi, giàu đạm và không đường giúp lập trình viên giữ tỉnh táo 100% khi chạy deadline xuyên đêm.",
      canonicalUrl: 'https://techbite.vn/blog/top-7-mon-an-vat-cuu-canh-dem-chay-deadline',
      ogImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=675&fit=crop',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Trong những đêm trắng chạy nước rút cho kịp hạn chót release tính năng hay giải quyết các sự cố production nghiêm trọng, năng lượng và sự tỉnh táo là hai tài sản quý giá nhất của một kỹ sư phần mềm. Tuy nhiên, việc liên tục nạp các loại đồ uống nhiều đường hay thức ăn nhanh nhiều dầu mỡ thường dẫn đến cảm giác uể oải, nặng bụng và hội chứng "sugar crash" chỉ sau vài giờ ngắn ngủi.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '1. Cơn ác mộng buồn ngủ lúc 2h sáng' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Đồng hồ điểm 02:00 AM, bug vẫn chưa fix xong mà hai mí mắt đã bắt đầu dính chặt vào nhau. Lúc này, phản xạ tự nhiên của đa số anh em là pha một ly cà phê đậm đặc hoặc mở một lon nước ngọt có ga. Nhưng bạn có biết rằng lượng đường fructose tinh luyện cao sẽ khiến đường huyết tăng vọt rồi tụt dốc không phanh, khiến não bộ rơi vào trạng thái mệt mỏi gấp bội?',
              },
            ],
          },
          {
            type: 'blockquote',
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', marks: [{ type: 'bold' }], text: 'Bí quyết của các Senior Dev: ' },
                  { type: 'text', text: 'Ưu tiên thức ăn giàu protein và chất béo lành mạnh, kết hợp các hoạt chất tự nhiên giúp giải phóng năng lượng từ từ trong suốt 4-6 tiếng liên tục.' },
                ],
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Tiêu chí chọn món ăn vặt cho dân lập trình' }],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Không dính tay lên bàn phím: ' }, { type: 'text', text: 'Món ăn phải khô ráo để không làm bẩn bàn phím cơ và trackpad.' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Hàm lượng đường thấp: ' }, { type: 'text', text: 'Hạn chế tối đa hiện tượng buồn ngủ sau ăn (Food Coma).' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Kích thích giác quan nhẹ nhàng: ' }, { type: 'text', text: 'Vị cay nồng của ớt hoặc hương thơm của lá chanh giúp kích thích các nơ-ron thần kinh tỉnh táo tức thì.' }] }],
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '2. Top 7 món ăn vặt cứu cánh đỉnh cao' }],
          },
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Khô Gà Lá Chanh Xé Cay: Vị cay kích thích thần kinh' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Khô gà lá chanh là món ăn quốc dân của giới IT mỗi mùa release. Từng thớ thịt gà ức giàu đạm được sấy giòn rụm kết hợp với ớt hiểm sấy khô và lá chanh tươi tạo nên vị cay the bùng nổ, đánh thức mọi giác quan ngay từ miếng đầu tiên.' }],
          },
          {
            type: 'image',
            attrs: {
              src: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=1000&h=560&fit=crop',
              alt: 'Khô gà lá chanh xé cay giòn rụm TechBite',
              caption: 'Khô gà xé cay giòn rụm - Người bạn đồng hành không thể thiếu lúc 2h sáng',
            },
          },
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Nước Tăng Lực Không Đường Celsius: Tập trung không crash' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Khác với các dòng nước tăng lực truyền thống chứa tới 30-40g đường mỗi lon, Celsius sử dụng chiết xuất trà xanh (EGCG), gừng và guarana tự nhiên kết hợp 7 loại vitamin nhóm B giúp đốt mỡ sinh nhiệt và duy trì độ tập trung sắc bén mà không gây cảm giác tim đập thình thịch.' }],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '3. Lời khuyên để tránh nặng bụng khi thức đêm' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Bên cạnh việc chọn đúng món ăn, hãy luôn để sẵn một bình nước lọc 1 lít bên cạnh bàn làm việc. Cứ mỗi 45 phút code liên tục, hãy đứng dậy vươn vai, uống một ngụm nước và nhìn xa 20 giây (quy tắc 20-20-20) để đôi mắt và cơ thể luôn ở trạng thái tốt nhất.' }],
          },
        ],
      },
    },
  });

  // Post 2
  const post2 = await prisma.post.create({
    data: {
      title: 'So Sánh Nước Tăng Lực Không Đường: Celsius vs Monster Đâu Là Chân Ái?',
      slug: 'so-sanh-nuoc-tang-luc-khong-duong-celsius-vs-monster',
      summary: 'Đánh giá chi tiết hàm lượng caffeine, vitamin B và cảm giác tim đập sau 4 tiếng chiến code liên tục.',
      thumbnail: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=338&fit=crop',
      status: PostStatus.PUBLISHED,
      views: 920,
      readTimeMinutes: 4,
      authorId: staffUser1.id,
      categoryId: blogCatDrinks.id,
      publishedAt: new Date('2026-08-24T09:15:00.000Z'),
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Khi đối mặt với deadline cấp bách, một lon nước tăng lực không đường là lựa chọn phổ biến. Nhưng giữa Celsius và Monster Ultra, đâu mới là lựa chọn tối ưu cho lập trình viên?' }] },
          { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '1. So sánh hàm lượng caffeine và thành phần' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Celsius chứa 200mg caffeine chiết xuất từ trà xanh và hạt guarana, trong khi Monster Ultra chứa 150mg caffeine tổng hợp. Cả hai đều có 0g đường và bổ sung các vitamin nhóm B.' }] },
        ],
      },
    },
  });

  // Post 3
  const post3 = await prisma.post.create({
    data: {
      title: 'Đánh Giá Khô Gà Lá Chanh Xé Cay TechBite: Cay Nồng Kích Thích Não Bộ',
      slug: 'danh-gia-kho-ga-la-chanh-xe-cay-techbite',
      summary: 'Vị cay the kích thích vị giác cùng độ giòn rụm giúp bạn xua tan cơn buồn ngủ 2h sáng chỉ sau 3 miếng đầu tiên.',
      thumbnail: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&h=338&fit=crop',
      status: PostStatus.PUBLISHED,
      views: 1450,
      readTimeMinutes: 5,
      authorId: staffUser3.id,
      categoryId: blogCatReview.id,
      publishedAt: new Date('2026-08-23T16:45:00.000Z'),
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Được đóng gói hũ nhôm kín khí, Khô Gà Lá Chanh TechBite giữ trọn độ giòn và vị cay the nồng đượm của ớt sừng.' }] },
        ],
      },
    },
  });

  // Post 4
  const post4 = await prisma.post.create({
    data: {
      title: 'Bí Quyết Giữ Tỉnh Táo 12 Tiếng Không Cần Nạp Quá Nhiều Đường',
      slug: 'bi-quyet-giu-tinh-tao-12-tieng-khong-can-duong',
      summary: 'Cách phân bổ hạt dinh dưỡng macca, óc chó xen kẽ các cữ uống nước giúp não bộ hoạt động bền bỉ.',
      thumbnail: 'https://images.unsplash.com/photo-1567892737950-30c4db39a622?w=600&h=338&fit=crop',
      status: PostStatus.PUBLISHED,
      views: 2130,
      readTimeMinutes: 7,
      authorId: adminUser.id,
      categoryId: blogCatTips.id,
      publishedAt: new Date('2026-08-22T08:30:00.000Z'),
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Chiến lược giữ tỉnh táo bền bỉ dựa trên việc duy trì đường huyết ổn định kết hợp chất béo lành mạnh từ các loại hạt cao cấp.' }] },
        ],
      },
    },
  });

  // Post 5
  const post5 = await prisma.post.create({
    data: {
      title: 'Top 5 Loại Hạt Dinh Dưỡng Giúp Tăng Khả Năng Tập Trung Khi Lập Trình',
      slug: 'top-5-loai-hat-dinh-duong-tang-tap-trung',
      summary: 'Khám phá lợi ích của Omega-3 và Magie có trong Macca, Hạnh nhân Úc và Hạt điều sấy nguyên vị.',
      thumbnail: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=338&fit=crop',
      status: PostStatus.PUBLISHED,
      views: 870,
      readTimeMinutes: 5,
      authorId: staffUser1.id,
      categoryId: blogCatTips.id,
      publishedAt: new Date('2026-08-20T11:00:00.000Z'),
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Hạt Macca và Hạnh nhân chứa hàm lượng chất chống oxy hóa cao, bảo vệ tế bào thần kinh trước áp lực công việc dài ngày.' }] },
        ],
      },
    },
  });

  // Post Tags Mapping
  await prisma.postTag.createMany({
    data: [
      { postId: post1.id, tagId: tagDeadline.id },
      { postId: post1.id, tagId: tagCoder.id },
      { postId: post1.id, tagId: tagAnVat.id },
      { postId: post2.id, tagId: tagEnergy.id },
      { postId: post3.id, tagId: tagKhoGa.id },
      { postId: post4.id, tagId: tagHealth.id },
      { postId: post5.id, tagId: tagHat.id },
    ],
  });

  // Post Products Cross-selling
  if (khoGaProduct && celsiusProduct) {
    await prisma.postProduct.createMany({
      data: [
        { postId: post1.id, productId: khoGaProduct.id, displayOrder: 1 },
        { postId: post1.id, productId: celsiusProduct.id, displayOrder: 2 },
        { postId: post2.id, productId: celsiusProduct.id, displayOrder: 1 },
        { postId: post3.id, productId: khoGaProduct.id, displayOrder: 1 },
        ...(maccaProduct ? [{ postId: post4.id, productId: maccaProduct.id, displayOrder: 1 }, { postId: post5.id, productId: maccaProduct.id, displayOrder: 1 }] : []),
      ],
    });
  }

  console.log('✅ Đã tạo 5 Blog Posts mẫu kèm Tags và Cross-selling Products');

  console.log(`✅ Đã tạo ${products.count} products`);
  console.log('');
  console.log('🎉 Seeding hoàn tất!');
  console.log(`   Banners (Home)        : ${bannersHome.count}`);
  console.log(`   Banners (Product List): ${bannersProductList.count}`);
  console.log(`   Categories            : 5`);
  console.log(`   Products              : ${products.count}`);
  console.log(`   Vouchers              : 2`);
  console.log(`   System Settings       : 6`);
  console.log(`   Role Groups           : 4`);
  console.log(`   Staff Accounts        : 4`);
}

main()
  .catch((e) => {
    console.error('❌ Seed thất bại:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
