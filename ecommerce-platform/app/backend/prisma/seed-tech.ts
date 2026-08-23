import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

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

async function seedTechProducts() {
  console.log('Seeding Tech Products...');

  // 1. Categories
  const catTaiNghe = await prisma.category.upsert({
    where: { slug: 'tai-nghe-am-thanh' },
    update: {},
    create: {
      name: 'Tai Nghe & Âm Thanh',
      slug: 'tai-nghe-am-thanh',
      iconUrl: '🎧',
      position: 6,
      isActive: true,
    },
  });

  const catPhuKien = await prisma.category.upsert({
    where: { slug: 'phu-kien-cong-nghe' },
    update: {},
    create: {
      name: 'Phụ Kiện Công Nghệ',
      slug: 'phu-kien-cong-nghe',
      iconUrl: '⌨️',
      position: 7,
      isActive: true,
    },
  });

  const catMayTinhBang = await prisma.category.upsert({
    where: { slug: 'may-tinh-bang' },
    update: {},
    create: {
      name: 'Máy Tính Bảng',
      slug: 'may-tinh-bang',
      iconUrl: '📱',
      position: 8,
      isActive: true,
    },
  });

  // 2. Tech Products
  const techProducts = [
    {
      name: 'Tai Nghe Bluetooth Chống Ồn Sony WH-1000XM5',
      slug: 'tai-nghe-bluetooth-chong-on-sony-wh-1000xm5',
      description: 'Tai nghe chụp tai chống ồn chủ động hàng đầu thế giới với vi xử lý V1 và HD QN1, thời lượng pin 30 giờ.',
      price: 8490000,
      salePrice: 6990000,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600&h=600',
      categoryId: catTaiNghe.id,
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'Tai Nghe Không Dây Apple AirPods Pro 2 (USB-C)',
      slug: 'tai-nghe-khong-day-apple-airpods-pro-2',
      description: 'Tai nghe in-ear không dây True Wireless cao cấp của Apple với chip H2, chống ồn chủ động gấp 2 lần, Spatial Audio.',
      price: 6190000,
      salePrice: 5490000,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=600&h=600',
      categoryId: catTaiNghe.id,
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'Tai Nghe Gaming Kingston HyperX Cloud II Red',
      slug: 'tai-nghe-gaming-kingston-hyperx-cloud-ii',
      description: 'Tai nghe gaming huyền thoại với đệm mút hoạt tính êm ái, âm thanh vòm giả lập 7.1, mic khử ồn chuyên nghiệp.',
      price: 2190000,
      salePrice: 1890000,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600&h=600',
      categoryId: catTaiNghe.id,
      isFeatured: false,
      isActive: true,
    },
    {
      name: 'Bàn Phím Cơ Không Dây Keychron K2 Pro QMK/VIA',
      slug: 'ban-phim-co-khong-day-keychron-k2-pro',
      description: 'Bàn phím cơ layout 75% gọn gàng, switch hot-swap, keycap PBT OSA profile, kết nối Bluetooth 5.1 và Type-C.',
      price: 2490000,
      salePrice: 2190000,
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600&h=600',
      categoryId: catPhuKien.id,
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'Chuột Không Dây Logitech MX Master 3S',
      slug: 'chuot-khong-day-logitech-mx-master-3s',
      description: 'Chuột công thái học cao cấp cho lập trình viên và designer, nút cuộn siêu tốc MagSpeed, cảm biến 8000 DPI Quiet Clicks.',
      price: 2690000,
      salePrice: 2290000,
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600&h=600',
      categoryId: catPhuKien.id,
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'Máy Tính Bảng Apple iPad Air M2 11 inch 128GB Wi-Fi',
      slug: 'may-tinh-bang-apple-ipad-air-m2-11-inch',
      description: 'iPad Air 2024 trang bị chip Apple M2 mạnh mẽ vượt trội, màn hình Liquid Retina sắc nét, hỗ trợ Apple Pencil Pro.',
      price: 16990000,
      salePrice: 15490000,
      stock: 18,
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600&h=600',
      categoryId: catMayTinhBang.id,
      isFeatured: true,
      isActive: true,
    },
  ];

  for (const prod of techProducts) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        price: prod.price,
        salePrice: prod.salePrice,
        stock: prod.stock,
        imageUrl: prod.imageUrl,
        categoryId: prod.categoryId,
        description: prod.description,
      },
      create: prod,
    });
  }

  console.log('✅ Seeding tech products complete!');
  await prisma.$disconnect();
}

seedTechProducts().catch((e) => {
  console.error(e);
  process.exit(1);
});
