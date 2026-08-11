import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from 'lucide-react';

const stats = [
  {
    id: 'revenue',
    label: 'Doanh thu tháng',
    value: '₫ 148,500,000',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'bg-orange-50 text-orange-600',
  },
  {
    id: 'orders',
    label: 'Đơn hàng mới',
    value: '1,284',
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingCart,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'products',
    label: 'Sản phẩm',
    value: '3,621',
    change: '-2.1%',
    trend: 'down',
    icon: Package,
    color: 'bg-green-50 text-green-600',
  },
  {
    id: 'customers',
    label: 'Khách hàng',
    value: '28,940',
    change: '+5.4%',
    trend: 'up',
    icon: Users,
    color: 'bg-purple-50 text-purple-600',
  },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan</h1>
        <p className="text-sm text-slate-500 mt-1">Chào mừng trở lại! Đây là tình hình hôm nay.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`flex items-center gap-1 text-xs font-semibold ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800 truncate">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Placeholder content areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 h-64 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">Biểu đồ doanh thu</p>
            <p className="text-xs mt-1">Sẽ được tích hợp trong sprint tiếp theo</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 h-64 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">Đơn hàng gần đây</p>
            <p className="text-xs mt-1">Sẽ được tích hợp trong sprint tiếp theo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
