'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  orders: 'Đơn hàng',
  products: 'Sản phẩm',
  categories: 'Danh mục',
  customers: 'Khách hàng',
  staffs: 'Nhân sự & Phân quyền',
  staff: 'Nhân viên',
  settings: 'Cài đặt',
  profile: 'Hồ sơ cá nhân',
  search: 'Tìm kiếm',
};

const BreadcrumbNav = () => {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((seg, i) => ({
    label: BREADCRUMB_LABELS[seg] ?? seg,
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-4">
      <Link href="/dashboard" className="text-slate-400 hover:text-orange-500 transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          {crumb.isLast ? (
            <span className="text-slate-700 font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-slate-400 hover:text-orange-500 transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
};

export default BreadcrumbNav;
