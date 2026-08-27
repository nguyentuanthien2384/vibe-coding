import {
  BlogPostListItem,
  BlogPostDetail,
  PostCategorySummary,
  PostProductItem,
  TOCItem,
} from '@/types/blog';
import { TipTapDoc } from '@/types/tiptap';

export const MOCK_CATEGORIES: PostCategorySummary[] = [
  { id: 1, name: 'Tất Cả Bài Viết', slug: 'tat-ca', postCount: 24 },
  { id: 2, name: 'Góc Coder Thức Khuya', slug: 'goc-coder-thuc-khuya', icon: '💻', postCount: 12 },
  { id: 3, name: 'Review Đồ Ăn Vặt', slug: 'review-do-an-vat', icon: '🍿', postCount: 8 },
  { id: 4, name: 'Nước Tăng Lực & Cà Phê', slug: 'nuoc-tang-luc-ca-phe', icon: '⚡', postCount: 6 },
  { id: 5, name: 'Mẹo Năng Lượng Đỉnh Cao', slug: 'meo-nang-luong', icon: '🔥', postCount: 4 },
];

export const MOCK_HERO_POST: BlogPostListItem = {
  id: 101,
  title: "Top 7 Món Ăn Vặt 'Cứu Cánh' Đêm Chạy Deadline Cho Anh Em Lập Trình Viên",
  slug: 'top-7-mon-an-vat-cuu-canh-dem-chay-deadline',
  summary: 'Tổng hợp các món ăn nhanh vừa tiện lợi, vừa giàu protein giúp giữ tỉnh táo 100% suốt đêm trắng fix bug mà không sợ nặng bụng hay buồn ngủ.',
  thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=675&fit=crop',
  status: 'PUBLISHED',
  views: 1845,
  readTimeMinutes: 6,
  publishedAt: '2026-08-25T14:30:00.000Z',
  author: {
    id: 1,
    fullName: 'Hoàng Nam Dev',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop',
    role: 'Lead Tech Writer',
    bio: 'Senior Fullstack Engineer & Tech Writer tại TechBite. Đam mê chia sẻ bí quyết sinh tồn cho anh em dev qua từng dòng code và tách cà phê.',
  },
  category: { id: 2, name: 'Góc Coder Thức Khuya', slug: 'goc-coder-thuc-khuya', icon: '💻' },
  tags: [
    { id: 1, name: 'chay-deadline', slug: 'chay-deadline' },
    { id: 2, name: 'coder-thuc-khuya', slug: 'coder-thuc-khuya' },
    { id: 3, name: 'an-vat-it', slug: 'an-vat-it' },
    { id: 4, name: 'nang-luong-lap-trinh', slug: 'nang-luong-lap-trinh' },
  ],
};

export const MOCK_SECONDARY_POSTS: BlogPostListItem[] = [
  {
    id: 102,
    title: 'So Sánh Nước Tăng Lực Không Đường: Celsius vs Monster Đâu Là Chân Ái?',
    slug: 'so-sanh-nuoc-tang-luc-khong-duong-celsius-vs-monster',
    summary: 'Đánh giá chi tiết hàm lượng caffeine, vitamin B và cảm giác tim đập sau 4 tiếng chiến code liên tục.',
    thumbnail: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=338&fit=crop',
    status: 'PUBLISHED',
    views: 920,
    readTimeMinutes: 4,
    publishedAt: '2026-08-24T09:15:00.000Z',
    author: { id: 2, fullName: 'Minh Thư', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop', role: 'Nutrition Editor' },
    category: { id: 4, name: 'Nước Tăng Lực & Cà Phê', slug: 'nuoc-tang-luc-ca-phe', icon: '⚡' },
    tags: [{ id: 5, name: 'energy-drinks', slug: 'energy-drinks' }],
  },
  {
    id: 103,
    title: 'Đánh Giá Khô Gà Lá Chanh Xé Cay TechBite: Cay Nồng Kích Thích Não Bộ',
    slug: 'danh-gia-kho-ga-la-chanh-xe-cay-techbite',
    summary: 'Vị cay the kích thích vị giác cùng độ giòn rụm giúp bạn xua tan cơn buồn ngủ 2h sáng chỉ sau 3 miếng đầu tiên.',
    thumbnail: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&h=338&fit=crop',
    status: 'PUBLISHED',
    views: 1450,
    readTimeMinutes: 5,
    publishedAt: '2026-08-23T16:45:00.000Z',
    author: { id: 3, fullName: 'Tuấn Anh', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop', role: 'Food Reviewer' },
    category: { id: 3, name: 'Review Đồ Ăn Vặt', slug: 'review-do-an-vat', icon: '🍿' },
    tags: [{ id: 6, name: 'kho-ga', slug: 'kho-ga' }],
  },
];

export const MOCK_BLOG_POSTS: BlogPostListItem[] = [
  ...MOCK_SECONDARY_POSTS,
  {
    id: 104,
    title: 'Bí Quyết Giữ Tỉnh Táo 12 Tiếng Không Cần Nạp Quá Nhiều Đường',
    slug: 'bi-quyet-giu-tinh-tao-12-tieng-khong-can-duong',
    summary: 'Cách phân bổ hạt dinh dưỡng macca, óc chó xen kẽ các cữ uống nước giúp não bộ hoạt động bền bỉ.',
    thumbnail: 'https://images.unsplash.com/photo-1567892737950-30c4db39a622?w=600&h=338&fit=crop',
    status: 'PUBLISHED',
    views: 2130,
    readTimeMinutes: 7,
    publishedAt: '2026-08-22T08:30:00.000Z',
    author: { id: 1, fullName: 'Hoàng Nam Dev', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop', role: 'Lead Tech Writer' },
    category: { id: 5, name: 'Mẹo Năng Lượng Đỉnh Cao', slug: 'meo-nang-luong', icon: '🔥' },
    tags: [{ id: 7, name: 'suc-khoe-lap-trinh', slug: 'suc-khoe-lap-trinh' }],
  },
  {
    id: 105,
    title: 'Top 5 Loại Hạt Dinh Dưỡng Giúp Tăng Khả Năng Tập Trung Khi Lập Trình',
    slug: 'top-5-loai-hat-dinh-duong-tang-tap-trung',
    summary: 'Khám phá lợi ích của Omega-3 và Magie có trong Macca, Hạnh nhân Úc và Hạt điều sấy nguyên vị.',
    thumbnail: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=338&fit=crop',
    status: 'PUBLISHED',
    views: 870,
    readTimeMinutes: 5,
    publishedAt: '2026-08-20T11:00:00.000Z',
    author: { id: 2, fullName: 'Minh Thư', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop', role: 'Nutrition Editor' },
    category: { id: 5, name: 'Mẹo Năng Lượng Đỉnh Cao', slug: 'meo-nang-luong', icon: '🔥' },
    tags: [{ id: 8, name: 'hat-dinh-duong', slug: 'hat-dinh-duong' }],
  },
  {
    id: 106,
    title: "Trà Sữa Oolong Nướng Có Phải Là 'Liều Thuốc Tinh Thần' Sau Khi Deploy Lỗi?",
    slug: 'tra-sua-oolong-nuong-lieu-thuoc-tinh-than',
    summary: 'Một ngụm đậm đà hương trà nướng thơm lừng kết hợp trân châu hoàng kim làm dịu ngay căng thẳng.',
    thumbnail: 'https://images.unsplash.com/photo-1558857563-b37102e99e00?w=600&h=338&fit=crop',
    status: 'PUBLISHED',
    views: 1780,
    readTimeMinutes: 4,
    publishedAt: '2026-08-18T15:20:00.000Z',
    author: { id: 3, fullName: 'Tuấn Anh', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop', role: 'Food Reviewer' },
    category: { id: 3, name: 'Review Đồ Ăn Vặt', slug: 'review-do-an-vat', icon: '🍿' },
    tags: [{ id: 9, name: 'tra-sua', slug: 'tra-sua' }],
  },
  {
    id: 107,
    title: 'Combo Deadline TechBite: Món Ăn Bán Chạy Nhất Tháng Có Gì Đặc Biệt?',
    slug: 'combo-deadline-techbite-co-gi-dac-biet',
    summary: 'Bóc hộp combo 3 món gồm Khô Gà, Trà Sữa Oolong và Snack Mực Nướng đang làm mưa làm gió trong cộng đồng IT.',
    thumbnail: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&h=338&fit=crop',
    status: 'PUBLISHED',
    views: 3420,
    readTimeMinutes: 6,
    publishedAt: '2026-08-15T10:00:00.000Z',
    author: { id: 1, fullName: 'Hoàng Nam Dev', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop', role: 'Lead Tech Writer' },
    category: { id: 2, name: 'Góc Coder Thức Khuya', slug: 'goc-coder-thuc-khuya', icon: '💻' },
    tags: [{ id: 10, name: 'combo-hot', slug: 'combo-hot' }],
  },
];

export const MOCK_POST_PRODUCTS: PostProductItem[] = [
  {
    id: 1,
    postId: 101,
    productId: 1,
    displayOrder: 1,
    product: {
      id: 1,
      name: 'Khô Gà Lá Chanh Xé Cay 200g',
      slug: 'kho-ga-la-chanh-xe-cay',
      imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=300&h=300&fit=crop',
      price: 55000,
      salePrice: 45000,
      stock: 25,
      isActive: true,
    },
  },
  {
    id: 2,
    postId: 101,
    productId: 2,
    displayOrder: 2,
    product: {
      id: 2,
      name: 'Nước Tăng Lực Celsius Dưa Hấu Zero Sugar',
      slug: 'nuoc-tang-luc-celsius-dua-hau',
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&h=300&fit=crop',
      price: 28000,
      salePrice: null,
      stock: 15,
      isActive: true,
    },
  },
];

export const MOCK_TOC_ITEMS: TOCItem[] = [
  { id: '1-con-ac-mong-buon-ngu-luc-2h-sang', text: '1. Cơn ác mộng buồn ngủ lúc 2h sáng', level: 2 },
  { id: 'tieu-chi-chon-mon-an-vat-cho-dan-lap-trinh', text: 'Tiêu chí chọn món ăn vặt cho dân lập trình', level: 3 },
  { id: '2-top-7-mon-an-vat-cuu-canh-dinh-cao', text: '2. Top 7 món ăn vặt cứu cánh đỉnh cao', level: 2 },
  { id: 'kho-ga-la-chanh-xe-cay-vi-cay-kich-thich-than-kinh', text: 'Khô Gà Lá Chanh Xé Cay: Vị cay kích thích thần kinh', level: 3 },
  { id: 'nuoc-tang-luc-khong-duong-celsius-tap-trung-khong-crash', text: 'Nước Tăng Lực Không Đường Celsius: Tập trung không crash', level: 3 },
  { id: 'hat-dinh-duong-macca-va-hanh-nhan-nang-luong-ben-bi', text: 'Hạt dinh dưỡng Macca & Hạnh nhân: Năng lượng bền bỉ', level: 3 },
  { id: '3-loi-khuyen-de-tranh-nang-bung-khi-thuc-dem', text: '3. Lời khuyên để tránh nặng bụng khi thức đêm', level: 2 },
];

export const MOCK_TIPTAP_CONTENT: TipTapDoc = {
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
      content: [
        {
          type: 'text',
          text: '1. Cơn ác mộng buồn ngủ lúc 2h sáng',
        },
      ],
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
            {
              type: 'text',
              marks: [{ type: 'bold' }],
              text: 'Bí quyết của các Senior Dev:',
            },
            {
              type: 'text',
              text: ' Ưu tiên thức ăn giàu protein và chất béo lành mạnh, kết hợp các hoạt chất tự nhiên giúp giải phóng năng lượng từ từ trong suốt 4-6 tiếng liên tục.',
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [
        {
          type: 'text',
          text: 'Tiêu chí chọn món ăn vặt cho dân lập trình',
        },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  marks: [{ type: 'bold' }],
                  text: 'Không dính tay lên bàn phím: ',
                },
                {
                  type: 'text',
                  text: 'Món ăn phải khô ráo hoặc dễ gắp để không làm bẩn bàn phím cơ và trackpad.',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  marks: [{ type: 'bold' }],
                  text: 'Hàm lượng đường thấp (Low Sugar/Zero Sugar): ',
                },
                {
                  type: 'text',
                  text: 'Hạn chế tối đa hiện tượng buồn ngủ sau ăn (Food Coma).',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  marks: [{ type: 'bold' }],
                  text: 'Kích thích giác quan nhẹ nhàng: ',
                },
                {
                  type: 'text',
                  text: 'Vị cay nồng của ớt hoặc hương thơm của lá chanh giúp kích thích các nơ-ron thần kinh tỉnh táo tức thì.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [
        {
          type: 'text',
          text: '2. Top 7 món ăn vặt cứu cánh đỉnh cao',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [
        {
          type: 'text',
          text: 'Khô Gà Lá Chanh Xé Cay: Vị cay kích thích thần kinh',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Khô gà lá chanh là món ăn quốc dân của giới IT mỗi mùa release. Từng thớ thịt gà ức giàu đạm được sấy giòn rụm kết hợp với ớt hiểm sấy khô và lá chanh tươi tạo nên vị cay the bùng nổ, đánh thức mọi giác quan ngay từ miếng đầu tiên.',
        },
      ],
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
      content: [
        {
          type: 'text',
          text: 'Nước Tăng Lực Không Đường Celsius: Tập trung không crash',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Khác với các dòng nước tăng lực truyền thống chứa tới 30-40g đường mỗi lon, Celsius sử dụng chiết xuất trà xanh (EGCG), gừng và guarana tự nhiên kết hợp 7 loại vitamin nhóm B giúp đốt mỡ sinh nhiệt và duy trì độ tập trung sắc bén mà không gây cảm giác tim đập thình thịch.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [
        {
          type: 'text',
          text: 'Hạt dinh dưỡng Macca & Hạnh nhân: Năng lượng bền bỉ',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Hạt dinh dưỡng chứa nhiều axit béo Omega-3 và Magie giúp bảo vệ tế bào não bộ trước áp lực công việc cao độ. Bạn chỉ cần nhâm nhi một nắm nhỏ (khoảng 30g) là đã đủ calo hoạt động cho cả ca làm việc đêm.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [
        {
          type: 'text',
          text: '3. Lời khuyên để tránh nặng bụng khi thức đêm',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Bên cạnh việc chọn đúng món ăn, hãy luôn để sẵn một bình nước lọc 1 lít bên cạnh bàn làm việc. Cứ mỗi 45 phút code liên tục, hãy đứng dậy vươn vai, uống một ngụm nước và nhìn xa 20 giây (quy tắc 20-20-20) để đôi mắt và cơ thể luôn ở trạng thái tốt nhất.',
        },
      ],
    },
  ],
};

export const MOCK_BLOG_DETAIL: BlogPostDetail = {
  ...MOCK_HERO_POST,
  content: MOCK_TIPTAP_CONTENT,
  metaTitle: "Top 7 Món Ăn Vặt Cứu Cánh Đêm Chạy Deadline Cho Lập Trình Viên | TechBite",
  metaDescription: "Tổng hợp các món ăn nhanh tiện lợi, giàu đạm và không đường giúp lập trình viên giữ tỉnh táo 100% khi chạy deadline xuyên đêm.",
  canonicalUrl: 'https://techbite.vn/blog/top-7-mon-an-vat-cuu-canh-dem-chay-deadline',
  ogImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=675&fit=crop',
  products: MOCK_POST_PRODUCTS,
  relatedPosts: MOCK_BLOG_POSTS.slice(0, 3),
};

export function getPostBySlug(slug: string): BlogPostDetail {
  const found = MOCK_BLOG_POSTS.find((p) => p.slug === slug);
  if (found) {
    return {
      ...found,
      content: MOCK_TIPTAP_CONTENT,
      metaTitle: `${found.title} | TechBite Blog`,
      metaDescription: found.summary,
      canonicalUrl: `https://techbite.vn/blog/${found.slug}`,
      ogImage: found.thumbnail,
      products: MOCK_POST_PRODUCTS,
      relatedPosts: MOCK_BLOG_POSTS.filter((p) => p.id !== found.id).slice(0, 3),
    };
  }
  return MOCK_BLOG_DETAIL;
}
