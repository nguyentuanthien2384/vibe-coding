import { Settings, ShieldCheck, Sparkles } from 'lucide-react';

const SettingsHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/80 flex items-center justify-center text-[#4880FF]">
          <Settings className="w-6 h-6 animate-spin-slow" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Thiết lập hệ thống
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#4880FF] border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-medium">
              Enterprise v1.0
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Quản lý thông tin cửa hàng, thông số thanh toán VietQR, phí giao hàng, danh sách banner và menu website TechBite.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start md:self-auto">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-4 h-4" />
          Đồng bộ Realtime
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800">
          <Sparkles className="w-4 h-4" />
          Clean UI
        </div>
      </div>
    </div>
  );
};

export default SettingsHeader;
