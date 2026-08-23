import { notFound } from 'next/navigation';
import { StorefrontShell } from '@/components/layout/storefront-shell';

type SupportPageKey = 'faq' | 'contact';

interface SupportPageContent {
  title: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
}

const SUPPORT_PAGES: Record<SupportPageKey, SupportPageContent> = {
  faq: {
    title: 'Câu hỏi thường gặp',
    intro: 'Các thông tin cần thiết để bạn mua sắm và theo dõi đơn hàng tại TechBite.',
    sections: [
      { heading: 'Khi nào đơn hàng được xác nhận?', body: 'Đơn hàng được xác nhận ngay sau khi bạn hoàn tất thanh toán hoặc chọn phương thức COD.' },
      { heading: 'Tôi theo dõi đơn hàng ở đâu?', body: 'Đăng nhập, mở Trang cá nhân và chọn đơn hàng cần theo dõi để xem trạng thái mới nhất.' },
      { heading: 'Tôi cần hỗ trợ gấp?', body: 'Liên hệ đội ngũ TechBite qua email support@techbite.vn để được hỗ trợ nhanh nhất.' },
    ],
  },
  contact: {
    title: 'Liên hệ TechBite',
    intro: 'Đội ngũ TechBite luôn sẵn sàng hỗ trợ các đơn hàng và phản hồi của bạn.',
    sections: [
      { heading: 'Email hỗ trợ', body: 'support@techbite.vn — phản hồi các yêu cầu về đơn hàng, giao hàng và tài khoản.' },
      { heading: 'Thời gian hỗ trợ', body: '08:00–22:00 hằng ngày, bao gồm cuối tuần và ngày lễ.' },
      { heading: 'Theo dõi đơn hàng', body: 'Bạn có thể kiểm tra chi tiết đơn hàng bất cứ lúc nào trong Trang cá nhân.' },
    ],
  },
};

interface SupportPageProps {
  params: Promise<{ page: string }>;
}

export default async function SupportPage({ params }: SupportPageProps) {
  const { page } = await params;
  if (page !== 'faq' && page !== 'contact') notFound();

  const content = SUPPORT_PAGES[page];
  return (
    <StorefrontShell>
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-600">Hỗ trợ khách hàng</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{content.title}</h1>
          <p className="mt-3 text-slate-600">{content.intro}</p>
          <div className="mt-8 space-y-5">
            {content.sections.map((section) => (
              <section className="rounded-xl bg-gray-50 p-5" key={section.heading}>
                <h2 className="font-bold text-slate-900">{section.heading}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
    </StorefrontShell>
  );
}
