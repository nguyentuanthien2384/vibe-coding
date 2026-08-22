import { notFound } from 'next/navigation';
import { StorefrontShell } from '@/components/layout/storefront-shell';
import { getPublicSettings } from '@/lib/settings';

type SupportPageKey = 'faq' | 'contact';

interface SupportPageProps {
  params: Promise<{ page: string }>;
}

export default async function SupportPage({ params }: SupportPageProps) {
  const [{ page }, { general, seo }] = await Promise.all([
    params,
    getPublicSettings(),
  ]);

  if (page !== 'faq' && page !== 'contact') notFound();

  const storeName = general.storeName || 'TechBite';
  const storeEmail = general.storeEmail || 'support@techbite.vn';
  const hotline = general.hotline || general.storePhone || '1900 6868';
  const storeAddress = general.storeAddress || 'Tầng 12, Tòa nhà Innovation Tower, Cầu Giấy, Hà Nội';
  const workingHours = general.workingHours || '08:00–22:00 hằng ngày';
  const taxCode = general.taxCode;

  // Social Links từ SEO Settings
  const socialChannels = [
    { name: 'Facebook', url: seo.facebookUrl, icon: '📘', desc: 'Trang fanpage chính thức cập nhật ưu đãi mỗi ngày' },
    { name: 'Zalo Official', url: seo.zaloUrl, icon: '💬', desc: 'Kênh chat hỗ trợ trực tuyến và giải đáp đơn hàng' },
    { name: 'Instagram', url: seo.instagramUrl, icon: '📸', desc: 'Hình ảnh món ăn & hậu trường độc quyền' },
    { name: 'TikTok', url: seo.tiktokUrl, icon: '🎵', desc: 'Video review combo ẩm thực và mẹo chạy deadline' },
    { name: 'YouTube', url: seo.youtubeUrl, icon: '▶️', desc: 'Kênh video giới thiệu sản phẩm công nghệ & món ngon' },
  ].filter((s) => !!s.url);

  return (
    <StorefrontShell>
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-600">
            {page === 'contact' ? 'Thông tin & Mạng xã hội' : 'Hỗ trợ khách hàng'}
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {page === 'contact' ? `Liên hệ ${storeName}` : 'Câu hỏi thường gặp (FAQ)'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            {page === 'contact'
              ? `Đội ngũ ${storeName} luôn sẵn sàng hỗ trợ các đơn hàng, giải đáp thắc mắc và tiếp nhận phản hồi của bạn.`
              : `Các thông tin cần thiết để bạn mua sắm và theo dõi đơn hàng tại ${storeName}.`}
          </p>

          {page === 'contact' ? (
            <div className="mt-8 space-y-8">
              {/* Thông tin liên hệ cơ bản */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-orange-50/60 border border-orange-100 p-5 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                    <span>📞</span> Hotline tư vấn & Đặt món
                  </p>
                  <a href={`tel:${hotline}`} className="text-xl font-extrabold text-slate-900 hover:text-orange-600 block transition-colors">
                    {hotline}
                  </a>
                  <p className="text-xs text-slate-500">Phục vụ {workingHours}</p>
                </div>

                <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-5 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                    <span>✉️</span> Hòm thư điện tử (Email)
                  </p>
                  <a href={`mailto:${storeEmail}`} className="text-base font-bold text-slate-900 hover:text-blue-600 block transition-colors truncate">
                    {storeEmail}
                  </a>
                  <p className="text-xs text-slate-500">Phản hồi trong vòng 15–30 phút</p>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-2 sm:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span>📍</span> Địa chỉ trụ sở & Cửa hàng
                  </p>
                  <p className="text-sm font-semibold text-slate-900">{storeAddress}</p>
                  {taxCode && (
                    <p className="text-xs text-slate-500 font-mono">
                      Mã số thuế doanh nghiệp: {taxCode}
                    </p>
                  )}
                </div>
              </div>

              {/* Kênh Mạng xã hội */}
              {socialChannels.length > 0 && (
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h2 className="text-lg font-bold text-slate-900">
                    Kết nối với chúng tôi qua Mạng xã hội
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {socialChannels.map((channel) => (
                      <a
                        key={channel.name}
                        href={channel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all group bg-white"
                      >
                        <span className="text-2xl shrink-0 p-2 rounded-xl bg-slate-50 group-hover:bg-orange-50 transition-colors">
                          {channel.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-1">
                            <span>{channel.name}</span>
                            <span className="text-xs text-slate-400 group-hover:translate-x-0.5 transition-transform">↗</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {channel.desc}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              <section className="rounded-2xl bg-gray-50 p-5">
                <h2 className="font-bold text-slate-900">Khi nào đơn hàng được xác nhận?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Đơn hàng được xác nhận ngay sau khi bạn hoàn tất thanh toán VietQR chuyển khoản hoặc chọn phương thức COD.
                </p>
              </section>
              <section className="rounded-2xl bg-gray-50 p-5">
                <h2 className="font-bold text-slate-900">Tôi theo dõi đơn hàng ở đâu?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Đăng nhập, mở Trang cá nhân và chọn đơn hàng cần theo dõi để xem trạng thái mới nhất.
                </p>
              </section>
              <section className="rounded-2xl bg-gray-50 p-5">
                <h2 className="font-bold text-slate-900">Tôi cần hỗ trợ khẩn cấp?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Liên hệ ngay Hotline <strong className="text-orange-600">{hotline}</strong> hoặc gửi thư đến <strong className="text-slate-900">{storeEmail}</strong> để được hỗ trợ nhanh nhất.
                </p>
              </section>
            </div>
          )}
        </div>
      </main>
    </StorefrontShell>
  );
}
