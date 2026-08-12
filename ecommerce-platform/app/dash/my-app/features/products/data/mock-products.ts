import { ProductItem, CategoryOption } from '../types/product.types';

export const MOCK_CATEGORIES: CategoryOption[] = [
  { id: 'cat-001', name: 'Thiết bị điện tử', slug: 'thiet-bi-dien-tu' },
  { id: 'cat-002', name: 'Điện thoại & Tablet', slug: 'dien-thoai-tablet' },
  { id: 'cat-003', name: 'Phụ kiện công nghệ', slug: 'phu-kien-cong-nghe' },
  { id: 'cat-004', name: 'Đồ gia dụng thông minh', slug: 'do-gia-dung-thong-minh' },
];

export const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-001',
    name: 'Apple Watch Series 4 GPS 44mm',
    slug: 'apple-watch-series-4-gps-44mm',
    price: 690,
    salePrice: 590,
    stock: 63,
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop&q=80',
    categoryId: 'cat-001',
    categoryName: 'Thiết bị điện tử',
    isFeatured: true,
    status: 'ACTIVE',
    shortDescription: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Đồng hồ thông minh Apple Watch Series 4 đo nhịp tim và theo dõi sức khỏe.' }],
        },
      ],
    },
    longDescription: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Apple Watch Series 4 được thiết kế lại hoàn toàn với màn hình hiển thị lớn hơn, viền mỏng hơn và tính năng phát hiện ngã thông minh.',
            },
          ],
        },
      ],
    },
    createdAt: '2026-08-01',
  },
  {
    id: 'prod-002',
    name: 'Microsoft Headphones Noise Cancelling',
    slug: 'microsoft-headphones-noise-cancelling',
    price: 190,
    salePrice: null,
    stock: 13,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
    categoryId: 'cat-003',
    categoryName: 'Phụ kiện công nghệ',
    isFeatured: false,
    status: 'ACTIVE',
    shortDescription: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Tai nghe chụp tai chống ồn chủ động cao cấp từ Microsoft.' }],
        },
      ],
    },
    longDescription: null,
    createdAt: '2026-08-03',
  },
  {
    id: 'prod-003',
    name: 'Samsung Galaxy A50 64GB',
    slug: 'samsung-galaxy-a50-64gb',
    price: 400,
    salePrice: 350,
    stock: 67,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80',
    categoryId: 'cat-002',
    categoryName: 'Điện thoại & Tablet',
    isFeatured: true,
    status: 'ACTIVE',
    shortDescription: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Màn hình Super AMOLED 6.4 inch sắc nét, cụm 3 camera đỉnh cao.' }],
        },
      ],
    },
    longDescription: null,
    createdAt: '2026-08-05',
  },
  {
    id: 'prod-004',
    name: 'Canon EOS DSLR Camera 4K',
    slug: 'canon-eos-dslr-camera-4k',
    price: 420,
    salePrice: null,
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&auto=format&fit=crop&q=80',
    categoryId: 'cat-001',
    categoryName: 'Thiết bị điện tử',
    isFeatured: false,
    status: 'INACTIVE',
    shortDescription: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Máy ảnh DSLR chuyên nghiệp chụp hình và quay video 4K siêu nét.' }],
        },
      ],
    },
    longDescription: null,
    createdAt: '2026-08-07',
  },
  {
    id: 'prod-005',
    name: 'Loa Bluetooth JBL Flip 6 Waterproof',
    slug: 'loa-bluetooth-jbl-flip-6-waterproof',
    price: 130,
    salePrice: 110,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=80',
    categoryId: 'cat-003',
    categoryName: 'Phụ kiện công nghệ',
    isFeatured: true,
    status: 'ACTIVE',
    shortDescription: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Loa không dây kháng nước IP67 âm bass mạnh mẽ.' }],
        },
      ],
    },
    longDescription: null,
    createdAt: '2026-08-09',
  },
];
