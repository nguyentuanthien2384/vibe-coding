import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white">
                ⚡
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Tech<span className="text-orange-500">Bite</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Đồ ăn & thức uống tiếp năng lượng cho dân lập trình. Giao nhanh 15 phút, giải cứu mọi deadline.
            </p>
          </div>

          {/* Product Categories */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
              Danh mục thực đơn
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link href="/categories/do-an-vat" className="hover:text-orange-400 transition-colors">
                  🍟 Đồ ăn vặt đêm
                </Link>
              </li>
              <li>
                <Link href="/categories/nuoc-uong" className="hover:text-orange-400 transition-colors">
                  🧃 Nước tăng lực & Cà phê
                </Link>
              </li>
              <li>
                <Link href="/categories/combo-deadline" className="hover:text-orange-400 transition-colors">
                  💻 Combo Chạy Deadline
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-orange-400 transition-colors">
                  🔥 Ưu đãi Hot hôm nay
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
              Hỗ trợ khách hàng
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link href="/policy/shipping" className="hover:text-orange-400 transition-colors">
                  Chính sách giao hàng 15p
                </Link>
              </li>
              <li>
                <Link href="/policy/return" className="hover:text-orange-400 transition-colors">
                  Chính sách đổi trả & Hoàn tiền
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-orange-400 transition-colors">
                  Câu hỏi thường gặp (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-orange-400 transition-colors">
                  Liên hệ Hotline 24/7
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
              Kết nối với TechBite
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Nhập email để nhận mã giảm giá 20% cho đơn hàng đầu tiên:
            </p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="email"
                placeholder="email@cua-ban.com"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <button className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shrink-0 transition-colors">
                Gửi
              </button>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="w-8 h-8 rounded-full bg-slate-800 hover:bg-orange-600 hover:text-white flex items-center justify-center text-xs cursor-pointer transition-colors">
                FB
              </span>
              <span className="w-8 h-8 rounded-full bg-slate-800 hover:bg-orange-600 hover:text-white flex items-center justify-center text-xs cursor-pointer transition-colors">
                GH
              </span>
              <span className="w-8 h-8 rounded-full bg-slate-800 hover:bg-orange-600 hover:text-white flex items-center justify-center text-xs cursor-pointer transition-colors">
                LN
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2026 TechBite E-Commerce. All rights reserved. Designed for developers.</p>
        </div>
      </div>
    </footer>
  );
};
