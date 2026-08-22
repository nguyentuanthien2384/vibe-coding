// prisma/seed.ts
// Seed data cho module Home Page: Banner, Category, Product
// Chạy: npm run db:seed

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient, BannerType, Role } from '@prisma/client';
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
  await prisma.user.upsert({
    where: { email: 'admin@techbite.com' },
    create: {
      email: 'admin@techbite.com',
      password: adminPassword,
      fullName: 'Nguyễn Văn A',
      phone: '0901234567',
      role: Role.ADMIN,
      roleGroupId: superAdminRole.id,
      isActive: true,
      notes: 'Quản trị viên sáng lập hệ thống TechBite.',
    },
    update: {
      roleGroupId: superAdminRole.id,
    },
  });

  // Staff 1
  await prisma.user.upsert({
    where: { email: 'staff.01@techbite.com' },
    create: {
      email: 'staff.01@techbite.com',
      password: staffPassword,
      fullName: 'Trần Thị B',
      phone: '0908765432',
      role: Role.STAFF,
      roleGroupId: storeManagerRole.id,
      isActive: true,
      notes: 'Quản lý bán lẻ và đơn hàng ca sáng.',
    },
    update: {
      roleGroupId: storeManagerRole.id,
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
  await prisma.user.upsert({
    where: { email: 'staff.03@techbite.com' },
    create: {
      email: 'staff.03@techbite.com',
      password: staffPassword,
      fullName: 'Phạm Minh D',
      phone: '0987654321',
      role: Role.STAFF,
      roleGroupId: cskhRole.id,
      customPermissions: ['product.view'],
      isActive: true,
      notes: 'CSKH và quản lý nội dung banner khuyến mãi.',
    },
    update: {
      roleGroupId: cskhRole.id,
      customPermissions: ['product.view'],
    },
  });
  console.log('✅ Đã tạo 4 tài khoản quản trị & nhân viên mẫu');

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
