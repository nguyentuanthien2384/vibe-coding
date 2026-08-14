import { notFound } from 'next/navigation';
import { StorefrontShell } from '@/components/layout/storefront-shell';

type PolicyTopic = 'shipping' | 'return';

interface PolicyContent {
  title: string;
  summary: string;
  points: string[];
}

const POLICIES: Record<PolicyTopic, PolicyContent> = {
  shipping: {
    title: 'Chính sách giao hàng',
    summary: 'TechBite chuẩn bị đơn hàng ngay sau khi xác nhận để bạn nhận được năng lượng đúng lúc.',
    points: [
      'Thời gian giao dự kiến được hiển thị khi bạn xác nhận đơn hàng.',
      'Đơn hàng có thể được theo dõi trực tiếp trong Trang cá nhân.',
      'Nếu cần thay đổi thông tin nhận hàng, hãy liên hệ hỗ trợ sớm nhất có thể.',
    ],
  },
  return: {
    title: 'Chính sách đổi trả và hoàn tiền',
    summary: 'Chúng tôi tiếp nhận phản hồi về đơn hàng để xử lý nhanh chóng và minh bạch.',
    points: [
      'Vui lòng liên hệ hỗ trợ kèm mã đơn hàng và hình ảnh liên quan nếu có.',
      'TechBite sẽ kiểm tra thông tin và thông báo phương án xử lý phù hợp.',
      'Các yêu cầu hợp lệ được hỗ trợ theo tình trạng thực tế của đơn hàng.',
    ],
  },
};

interface PolicyPageProps {
  params: Promise<{ topic: string }>;
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { topic } = await params;
  if (topic !== 'shipping' && topic !== 'return') notFound();

  const policy = POLICIES[topic];
  return (
    <StorefrontShell>
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-600">TechBite care</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{policy.title}</h1>
          <p className="mt-3 text-slate-600">{policy.summary}</p>
          <ul className="mt-7 space-y-3 text-sm leading-6 text-slate-700">
            {policy.points.map((point) => (
              <li className="rounded-xl bg-gray-50 px-5 py-4" key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </main>
    </StorefrontShell>
  );
}
