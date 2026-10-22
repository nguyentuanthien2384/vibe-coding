import { PrismaClient, BannerType, Role, PostStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export interface SeedResult {
  status: 'success' | 'skipped';
  message: string;
  bannersCount: number;
  categoriesCount: number;
  productsCount: number;
  vouchersCount: number;
  settingsCount: number;
  blogPostsCount: number;
  adminEmail: string;
}

export async function seedDatabase(
  prisma: PrismaClient,
  force = false,
): Promise<SeedResult> {
  const existingProducts = await prisma.product.count();
  if (existingProducts > 0 && !force) {
    return {
      status: 'skipped',
      message: `Cơ sở dữ liệu đã có ${existingProducts} sản phẩm. Bỏ qua seeding. (Dùng force=true để nạp lại)`,
      bannersCount: await prisma.banner.count(),
      categoriesCount: await prisma.category.count(),
      productsCount: existingProducts,
      vouchersCount: await prisma.voucher.count(),
      settingsCount: await prisma.systemSetting.count(),
      blogPostsCount: await prisma.post.count(),
      adminEmail: 'admin@techbite.com',
    };
  }

  // ─── 1. CLEAN UP CŨ (Đảm bảo tính Idempotent) ──────────────────────────────
  await prisma.postProduct.deleteMany().catch(() => {});
  await prisma.postTag.deleteMany().catch(() => {});
  await prisma.post.deleteMany().catch(() => {});
  await prisma.postCategory.deleteMany().catch(() => {});
  await prisma.tag.deleteMany().catch(() => {});
  await prisma.cartItem.deleteMany().catch(() => {});
  await prisma.orderItem.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});
  await prisma.banner.deleteMany().catch(() => {});
  await prisma.voucher.deleteMany().catch(() => {});
  await prisma.systemSetting.deleteMany().catch(() => {});

  // ─── 2. BANNERS (Home Page & Product List) ─────────────────────────────────
  const bannersHome = await prisma.banner.createMany({
    data: [
      {
        title: 'Nạp Năng Lượng — Code Phê Hơn',
        subtitle: '🔥 HOT DEAL • 22h - 2h sáng | Combo Thức Khuya giảm giá 20%',
        imageUrl:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1400&h=500',
        linkUrl: '/categories/combo-deadline',
        type: BannerType.HERO_BANNER,
        position: 1,
        isActive: true,
      },
      {
        title: 'Đồ Ăn Vặt Giờ Vàng',
        subtitle: 'Flash Sale mỗi tối 8h — giảm đến 30% toàn bộ snack',
        imageUrl:
          'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=1400&h=500',
        linkUrl: '/categories/do-an-vat',
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
      {
        title: 'Flash Sale Snack — Chỉ Hôm Nay!',
        subtitle: '⚡ Giảm 30% tất cả Đồ Ăn Vặt • Áp dụng đến 23:59 hôm nay',
        imageUrl:
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200&h=300',
        linkUrl: '/categories/do-an-vat',
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
        linkUrl: '/categories/combo-deadline',
        type: BannerType.PROMOTION_BANNER,
        position: 12,
        isActive: true,
      },
    ],
  });

  // ─── 3. CATEGORIES ─────────────────────────────────────────────────────────
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

  // ─── 4. PRODUCTS ───────────────────────────────────────────────────────────
  const products = await prisma.product.createMany({
    data: [
      // --- Burger & Combo ---
      {
        name: 'Burger Bò Phô Mai Hai Tầng Sốt BBQ Đặc Biệt',
        slug: 'burger-bo-pho-mai-hai-tang-sot-bbq',
        description:
          'Trải nghiệm bùng nổ vị giác với 2 lớp bò Úc tươi xay nướng than hoa mọng nước, phô mai Cheddar tan chảy béo ngậy, kẹp trong vỏ bánh mì bơ Pháp mềm thơm, quyện cùng nước sốt BBQ công thức độc quyền đậm đà.',
        price: 119000,
        salePrice: 89000,
        stock: 45,
        imageUrl:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catCombo.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Combo Gà Rán Sốt Cay Hàn Quốc + Pepsi',
        slug: 'combo-ga-ran-sot-cay-han-quoc-pepsi',
        description:
          'Gà rán giòn rụm phủ sốt cay ngọt chuẩn vị Hàn Quốc, kèm 1 ly Pepsi mát lạnh giúp giải đắng ngắt khi fixer bug thâm đêm.',
        price: 105000,
        salePrice: 89000,
        stock: 35,
        imageUrl:
          'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catCombo.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Combo Năng Lượng Coder (3 món)',
        slug: 'combo-nang-luong-coder-3-mon',
        description:
          'Bộ ba cứu cánh đêm muộn: 1 Cà phê đen phin đậm đặc + 1 Khô gà lá chanh 100g + 1 Snack mực nướng Hàn Quốc.',
        price: 120000,
        salePrice: 89000,
        stock: 25,
        imageUrl:
          'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catCombo.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Combo Bug Killer (5 món)',
        slug: 'combo-bug-killer-5-mon',
        description:
          'Combo giải cứu deadline đỉnh cao: Trà sữa oolong nướng + 2 gói snack + 1 lon nước tăng lực Celsius + 1 hộp mochi trà xanh.',
        price: 180000,
        salePrice: 149000,
        stock: 15,
        imageUrl:
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catCombo.id,
        isFeatured: true,
        isActive: true,
      },

      // --- Đồ Ăn Vặt ---
      {
        name: 'Khô Gà Lá Chanh Xé Cay Premium',
        slug: 'kho-ga-la-chanh-xe-cay',
        description:
          'Khô gà xé sợi tẩm ướp ớt sừng và lá chanh tươi rang sấy giòn rụm. Hương vị đậm đà cay nồng vừa phải, ăn hoài không chán.',
        price: 55000,
        salePrice: 45000,
        stock: 50,
        imageUrl:
          'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catDoAnVat.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Khoai Tây Chiên Lắc Phô Mai Bơ Tỏi',
        slug: 'khoai-tay-chien-lac-pho-mai-bo-toi',
        description:
          'Khoai tây cắt lát giòn tan lắc cùng bột phô mai bơ tỏi thơm ngậy béo bùi, vàng ươm hấp dẫn.',
        price: 45000,
        salePrice: 35000,
        stock: 60,
        imageUrl:
          'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catDoAnVat.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Bánh Mỳ Nướng Bơ Tỏi Xốt Kem Phô Mai',
        slug: 'banh-my-nuong-bo-toi-xot-kem-pho-mai',
        description:
          'Bánh mỳ nướng bơ tỏi giòn rụm bên ngoài, béo ngậy mềm mịn với nhân xốt kem phô mai chảy béo ngậy bên trong.',
        price: 49000,
        salePrice: 39000,
        stock: 30,
        imageUrl:
          'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catDoAnVat.id,
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Snack Vị Mực Nướng Hàn Quốc',
        slug: 'snack-vi-muc-nuong-han-quoc',
        description:
          'Snack mực nướng tẩm vị sa tế đậm đà nhập khẩu Hàn Quốc, vừa giòn ngọt vừa thơm mùi biển.',
        price: 38000,
        salePrice: null,
        stock: 80,
        imageUrl:
          'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catDoAnVat.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Hạt Macca Rang Muối Úc',
        slug: 'hat-macca-rang-muoi-uc',
        description:
          'Hạt macca nhập khẩu Úc rang muối sấy giòn, giàu Omega-3 giúp nạp năng lượng nhanh cho não bộ khi làm việc ban đêm.',
        price: 75000,
        salePrice: 65000,
        stock: 30,
        imageUrl:
          'https://images.unsplash.com/photo-1567892737950-30c4db39a622?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catDoAnVat.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Bánh Mochi Kem Trà Xanh Matcha',
        slug: 'banh-mochi-kem-tra-xanh',
        description:
          'Bánh mochi dẻo mịn với lớp vỏ nếp mềm dẻo và nhân kem trà xanh Matcha nguyên chất thanh mát dịu ngọt.',
        price: 35000,
        salePrice: 28000,
        stock: 0,
        imageUrl:
          'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catDoAnVat.id,
        isFeatured: false,
        isActive: true,
      },

      // --- Nước Uống ---
      {
        name: 'Nước Tăng Lực Celsius Dưa Hấu 355ml',
        slug: 'nuoc-tang-luc-celsius-dua-hau',
        description:
          'Celsius dưa hấu mát lạnh chứa 200mg caffeine tự nhiên & vitamin B giúp duy trì tỉnh táo suốt 8 tiếng code không lo mệt mỏi.',
        price: 32000,
        salePrice: 25000,
        stock: 100,
        imageUrl:
          'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catNuocUong.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Cà Phê Đen Đá Phin Đậm Đà',
        slug: 'ca-phe-den-da',
        description:
          'Cà phê Robusta Đắk Lắk nguyên chất pha phin đậm đà, vị đắng dịu hậu vị ngọt sâu, đánh tan cơn buồn ngủ.',
        price: 30000,
        salePrice: 25000,
        stock: 200,
        imageUrl:
          'https://images.unsplash.com/photo-1611564494260-6f21b80af7ea?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catNuocUong.id,
        isFeatured: false,
        isActive: true,
      },

      // --- Trà Sữa ---
      {
        name: 'Trà Sữa Oolong Nướng Full Topping',
        slug: 'tra-sua-oolong-nuong-full-topping',
        description:
          'Đậm đà vị trà oolong nướng thơm sực, hòa cùng vị béo thơm của sữa tươi và đầy ắp trân châu đường đen, thạch dừa, pudding sô-cô-la.',
        price: 45000,
        salePrice: 35000,
        stock: 40,
        imageUrl:
          'https://images.unsplash.com/photo-1558857563-b37102e99e00?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catTraSua.id,
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Trà Sữa Đào Cam Sả Size L',
        slug: 'tra-sua-dao-cam-sa-size-l',
        description:
          'Trà tươi vị đào thơm ngát kết hợp cam tươi dầm sả đập dập, vị chua ngọt thanh mát và giải nhiệt sảng khoái.',
        price: 52000,
        salePrice: 45000,
        stock: 60,
        imageUrl:
          'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catTraSua.id,
        isFeatured: true,
        isActive: true,
      },

      // --- Trái Cây Tô ---
      {
        name: 'Trái Cây Tô Sữa Chua Hy Lạp Mix',
        slug: 'trai-cay-to-sua-chua-mix',
        description:
          'Tô trái cây nhiệt đới tươi xanh (dưa hấu, kiwi, nho ngón tay, xoài chín, dâu tây) phủ sữa chua Hy Lạp béo mịn mát lạnh.',
        price: 55000,
        salePrice: 45000,
        stock: 15,
        imageUrl:
          'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&q=80&w=600&h=600',
        categoryId: catTraiCay.id,
        isFeatured: true,
        isActive: true,
      },
    ],
  });

  // ─── 5. VOUCHERS ───────────────────────────────────────────────────────────
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

  // ─── 6. SYSTEM SETTINGS ────────────────────────────────────────────────────
  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'general',
        value: {
          storeName: 'TechBite - Đồ Ăn & Nước Uống Cho Coder',
          storeEmail: 'contact@techbite.vn',
          storePhone: '1900 6868',
          hotline: '0988 123 456',
          storeAddress: 'Tầng 12, Tòa nhà Innovation Tower, Cầu Giấy, Hà Nội',
          copyrightText: '© 2026 TechBite E-Commerce Platform. Tất cả quyền được bảo lưu.',
          logoUrl: '/images/logo-techbite.png',
          faviconUrl: '/favicon.ico',
          workingHours: '08:00 - 22:00 (Thứ 2 - Chủ Nhật)',
          taxCode: '0109988776',
          maintenanceMode: false,
          maintenanceMessage:
            'Hệ thống đang bảo trì nâng cấp định kỳ. Vui lòng quay lại sau ít phút!',
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
          },
          {
            id: 'm-2',
            title: 'Thực đơn',
            targetUrl: '/products',
            location: 'HEADER',
            icon: 'ShoppingBag',
            order: 2,
            openInNewTab: false,
            isActive: true,
          },
          {
            id: 'm-3',
            title: 'Combo Deadline 💻',
            targetUrl: '/categories/combo-deadline',
            location: 'HEADER',
            icon: 'Laptop',
            order: 3,
            openInNewTab: false,
            isActive: true,
          },
          {
            id: 'm-4',
            title: 'Khuyến mãi hot 🔥',
            targetUrl: '/products?sort=featured',
            location: 'HEADER',
            icon: 'Flame',
            order: 4,
            openInNewTab: false,
            isActive: true,
          },
          {
            id: 'm-5',
            title: 'Blog ✍️',
            targetUrl: '/blog',
            location: 'HEADER',
            icon: 'BookOpen',
            order: 5,
            openInNewTab: false,
            isActive: true,
          },
        ],
      },
      {
        key: 'seo',
        value: {
          metaTitle: 'TechBite - Sàn Thương Mại Điện Tử & Nạp Năng Lượng Lập Trình Viên',
          metaDescription:
            'Combo Thức Khuya giảm giá 20% — Chỉ dành cho anh em chạy deadline. Giao nhanh 15 phút, giải cứu mọi deadline.',
          metaKeywords:
            'TechBite, E-commerce, Đồ ăn vặt, Lập trình viên, FastFood, Combo deadline',
          canonicalUrl: 'https://techbite.vn',
          metaRobots: 'index, follow',
          ogTitle: 'TechBite - Nạp Năng Lượng Code Phê Hơn',
          ogDescription: 'Combo Thức Khuya giảm giá 20% — Chỉ dành cho anh em chạy deadline.',
          ogImageUrl:
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1400&h=500',
          ogType: 'website',
          twitterCard: 'summary_large_image',
        },
      },
      {
        key: 'shipping',
        value: {
          defaultShippingFee: 15000,
          freeShippingThreshold: 99000,
          estimatedDeliveryTime: '15 - 30 phút giao hỏa tốc tận bàn làm việc',
        },
      },
      {
        key: 'payment',
        value: {
          bankName: 'MB Bank',
          bankAccountNo: '9999888899',
          bankAccountHolder: 'CTY TNHH TECHBITE VIETNAM',
          vietQrTemplate: 'compact',
          enableCod: true,
        },
      },
    ],
  });

  // ─── 7. ROLES & ADMIN ACCOUNTS ─────────────────────────────────────────────
  const superAdminRole = await prisma.roleGroup.upsert({
    where: { slug: 'super-admin' },
    create: {
      name: 'Super Admin',
      slug: 'super-admin',
      description: 'Toàn quyền quản trị hệ thống.',
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
    update: { isSystem: true },
  });

  const storeManagerRole = await prisma.roleGroup.upsert({
    where: { slug: 'cua-hang-truong' },
    create: {
      name: 'Cửa hàng trưởng',
      slug: 'cua-hang-truong',
      description: 'Quản lý sản phẩm và đơn hàng.',
      isSystem: false,
      permissions: [
        'product.view',
        'product.manage',
        'category.manage',
        'order.view',
        'order.update_status',
        'payment.confirm',
      ],
    },
    update: {},
  });

  const rawAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || 'admin@techbite.com';
  const rawAdminPass = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminPasswordHash = await bcrypt.hash(rawAdminPass, 12);
  const staffPasswordHash = await bcrypt.hash('Password123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: rawAdminEmail },
    create: {
      email: rawAdminEmail,
      password: adminPasswordHash,
      fullName: process.env.ADMIN_FULL_NAME || 'System Administrator',
      phone: '0901234567',
      role: Role.ADMIN,
      roleGroupId: superAdminRole.id,
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop',
      isActive: true,
      notes: 'Lead Administrator & Tech Writer.',
    },
    update: {
      password: adminPasswordHash,
      role: Role.ADMIN,
      roleGroupId: superAdminRole.id,
      isActive: true,
    },
  });

  const staffUser1 = await prisma.user.upsert({
    where: { email: 'staff.01@techbite.com' },
    create: {
      email: 'staff.01@techbite.com',
      password: staffPasswordHash,
      fullName: 'Minh Thư Nutrition',
      phone: '0908765432',
      role: Role.STAFF,
      roleGroupId: storeManagerRole.id,
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
      isActive: true,
      notes: 'Chuyên gia dinh dưỡng và biên tập viên chuyên mục Mẹo Sinh Tồn.',
    },
    update: {
      roleGroupId: storeManagerRole.id,
      isActive: true,
    },
  });

  // ─── 8. BLOG POSTS & TAGS ──────────────────────────────────────────────────
  const blogCatCoder = await prisma.postCategory.create({
    data: {
      name: 'Góc Coder Thức Khuya',
      slug: 'goc-coder-thuc-khuya',
      description: 'Bí quyết nạp năng lượng, giữ tỉnh táo 100% khi thức đêm làm việc.',
      icon: '💻',
      orderIndex: 1,
      isActive: true,
    },
  });

  const blogCatDrinks = await prisma.postCategory.create({
    data: {
      name: 'Nước Tăng Lực & Cà Phê',
      slug: 'nuoc-tang-luc-ca-phe',
      description: 'Phân tích các dòng đồ uống tỉnh táo không đường.',
      icon: '⚡',
      orderIndex: 2,
      isActive: true,
    },
  });

  const tagDeadline = await prisma.tag.create({
    data: { name: 'chay-deadline', slug: 'chay-deadline' },
  });
  const tagCoder = await prisma.tag.create({
    data: { name: 'coder-thuc-khuya', slug: 'coder-thuc-khuya' },
  });

  const dbProducts = await prisma.product.findMany();
  const khoGaProduct = dbProducts.find((p) => p.slug === 'kho-ga-la-chanh-xe-cay') || dbProducts[0];
  const celsiusProduct = dbProducts.find((p) => p.slug === 'nuoc-tang-luc-celsius-dua-hau') || dbProducts[1];

  const post1 = await prisma.post.create({
    data: {
      title: "Top 7 Món Ăn Vặt 'Cứu Cánh' Đêm Chạy Deadline Cho Anh Em Lập Trình Viên",
      slug: 'top-7-mon-an-vat-cuu-canh-dem-chay-deadline',
      summary:
        'Tổng hợp các món ăn nhanh vừa tiện lợi, vừa giàu protein giúp giữ tỉnh táo 100% suốt đêm trắng fix bug mà không sợ nặng bụng hay buồn ngủ.',
      thumbnail:
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=675&fit=crop',
      status: PostStatus.PUBLISHED,
      views: 1845,
      readTimeMinutes: 6,
      authorId: adminUser.id,
      categoryId: blogCatCoder.id,
      publishedAt: new Date('2026-08-25T14:30:00.000Z'),
      metaTitle:
        'Top 7 Món Ăn Vặt Cứu Cánh Đêm Chạy Deadline Cho Lập Trình Viên | TechBite',
      metaDescription:
        'Tổng hợp các món ăn nhanh tiện lợi, giàu đạm và không đường giúp lập trình viên giữ tỉnh táo 100% khi chạy deadline xuyên đêm.',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Trong những đêm trắng chạy nước rút cho kịp hạn chót release tính năng hay giải quyết các sự cố production nghiêm trọng, năng lượng và sự tỉnh táo là hai tài sản quý giá nhất của một kỹ sư phần mềm.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '1. Khô Gà Lá Chanh Xé Cay: Vị cay kích thích não bộ' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Từng thớ thịt gà ức giàu đạm được sấy giòn rụm kết hợp với ớt hiểm sấy khô và lá chanh tươi tạo nên vị cay the bùng nổ, đánh thức mọi giác quan ngay từ miếng đầu tiên.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '2. Nước Tăng Lực Celsius Dưa Hấu' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Celsius chứa 200mg caffeine chiết xuất từ trà xanh và hạt guarana, 0g đường và 7 loại vitamin B giúp duy trì độ tập trung sắc bén suốt 8 tiếng mà không sợ crash đường huyết.',
              },
            ],
          },
        ],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Bí Quyết Giữ Tỉnh Táo 12 Tiếng Không Cần Nạp Quá Nhiều Đường',
      slug: 'bi-quyet-giu-tinh-tao-12-tieng-khong-can-duong',
      summary:
        'Cách phân bổ hạt dinh dưỡng macca, óc chó xen kẽ các cữ uống nước giúp não bộ hoạt động bền bỉ.',
      thumbnail:
        'https://images.unsplash.com/photo-1567892737950-30c4db39a622?w=600&h=338&fit=crop',
      status: PostStatus.PUBLISHED,
      views: 920,
      readTimeMinutes: 5,
      authorId: staffUser1.id,
      categoryId: blogCatDrinks.id,
      publishedAt: new Date('2026-08-24T09:15:00.000Z'),
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Chiến lược giữ tỉnh táo bền bỉ dựa trên việc duy trì đường huyết ổn định kết hợp chất béo lành mạnh từ các loại hạt cao cấp và nước tăng lực tự nhiên.',
              },
            ],
          },
        ],
      },
    },
  });

  await prisma.postTag.createMany({
    data: [
      { postId: post1.id, tagId: tagDeadline.id },
      { postId: post1.id, tagId: tagCoder.id },
      { postId: post2.id, tagId: tagDeadline.id },
    ],
  });

  if (khoGaProduct && celsiusProduct) {
    await prisma.postProduct.createMany({
      data: [
        { postId: post1.id, productId: khoGaProduct.id, displayOrder: 1 },
        { postId: post1.id, productId: celsiusProduct.id, displayOrder: 2 },
      ],
    });
  }

  return {
    status: 'success',
    message: 'Nạp cơ sở dữ liệu mẫu thành công!',
    bannersCount: bannersHome.count,
    categoriesCount: 5,
    productsCount: products.count,
    vouchersCount: 2,
    settingsCount: 5,
    blogPostsCount: 2,
    adminEmail: rawAdminEmail,
  };
}
