import { ProductItem, CategoryOption } from '../types/product.types';

export const MOCK_CATEGORIES: CategoryOption[] = [
  { id: 1, name: 'Thiết bị điện tử', slug: 'thiet-bi-dien-tu' },
  { id: 2, name: 'Điện thoại & Tablet', slug: 'dien-thoai-tablet' },
  { id: 3, name: 'Phụ kiện công nghệ', slug: 'phu-kien-cong-nghe' },
  { id: 4, name: 'Đồ gia dụng thông minh', slug: 'do-gia-dung-thong-minh' },
];

export const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: 1,
    name: 'Apple Watch Series 4 GPS 44mm',
    slug: 'apple-watch-series-4-gps-44mm',
    price: 6900000,
    salePrice: 5900000,
    stock: 63,
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop&q=80',
    categoryId: 1,
    categoryName: 'Thiết bị điện tử',
    isFeatured: true,
    status: 'ACTIVE',
    isActive: true,
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
    id: 2,
    name: 'Microsoft Headphones Noise Cancelling',
    slug: 'microsoft-headphones-noise-cancelling',
    price: 1900000,
    salePrice: null,
    stock: 13,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
    categoryId: 3,
    categoryName: 'Phụ kiện công nghệ',
    isFeatured: false,
    status: 'ACTIVE',
    isActive: true,
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
    id: 3,
    name: 'Samsung Galaxy A50 64GB',
    slug: 'samsung-galaxy-a50-64gb',
    price: 4000000,
    salePrice: 3500000,
    stock: 67,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80',
    categoryId: 2,
    categoryName: 'Điện thoại & Tablet',
    isFeatured: true,
    status: 'ACTIVE',
    isActive: true,
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
    id: 4,
    name: 'Canon EOS DSLR Camera 4K',
    slug: 'canon-eos-dslr-camera-4k',
    price: 4200000,
    salePrice: null,
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&auto=format&fit=crop&q=80',
    categoryId: 1,
    categoryName: 'Thiết bị điện tử',
    isFeatured: false,
    status: 'INACTIVE',
    isActive: false,
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
    id: 5,
    name: 'Loa Bluetooth JBL Flip 6 Waterproof',
    slug: 'loa-bluetooth-jbl-flip-6-waterproof',
    price: 1300000,
    salePrice: 1100000,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=80',
    categoryId: 3,
    categoryName: 'Phụ kiện công nghệ',
    isFeatured: true,
    status: 'ACTIVE',
    isActive: true,
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
