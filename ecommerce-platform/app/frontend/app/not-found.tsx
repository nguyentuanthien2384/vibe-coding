import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg shadow-orange-500/10 mb-6">
        ⚡
      </div>

      <span className="text-orange-600 text-sm font-extrabold tracking-widest uppercase mb-2">
        Error 404
      </span>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
        Không tìm thấy trang này
      </h1>

      <p className="text-slate-600 max-w-md text-sm sm:text-base leading-relaxed mb-8">
        Món ăn hoặc chuyên mục bạn đang tìm kiếm có thể đã đổi địa chỉ hoặc đang được cập nhật thực đơn mới.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md shadow-orange-600/20 transition-all hover:-translate-y-0.5"
        >
          Trang chủ TechBite
        </Link>
        <Link
          href="/products"
          className="px-6 py-3 rounded-xl bg-white border border-slate-300 hover:border-orange-500 text-slate-700 font-bold text-sm shadow-sm transition-all hover:-translate-y-0.5"
        >
          Xem Thực Đơn
        </Link>
        <Link
          href="/categories/combo-deadline"
          className="px-6 py-3 rounded-xl bg-amber-50 border border-amber-200 hover:border-amber-400 text-amber-900 font-bold text-sm shadow-sm transition-all hover:-translate-y-0.5"
        >
          Combo Deadline 💻
        </Link>
      </div>
    </div>
  );
}
