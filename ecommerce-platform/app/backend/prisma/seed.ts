// prisma/seed.ts
// Seed data cho module Home Page: Banner, Category, Product
// Chạy: npm run db:seed

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient, BannerType } from '@prisma/client';
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

  console.log(`✅ Đã tạo ${products.count} products`);
  console.log('');
  console.log('🎉 Seeding hoàn tất!');
  console.log(`   Banners (Home)        : ${bannersHome.count}`);
  console.log(`   Banners (Product List): ${bannersProductList.count}`);
  console.log(`   Categories            : 5`);
  console.log(`   Products              : ${products.count}`);
  console.log(`   Vouchers              : 2`);
}

main()
  .catch((e) => {
    console.error('❌ Seed thất bại:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
