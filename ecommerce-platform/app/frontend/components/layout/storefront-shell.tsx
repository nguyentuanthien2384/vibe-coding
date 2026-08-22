// components/layout/storefront-shell.tsx
import type { ReactNode } from 'react';
import { CartDrawer } from '../cart/cart-drawer';
import { Toast } from '../ui/toast';
import { Footer } from './footer';
import { Header } from './header';
import { MaintenanceBanner } from './maintenance-banner';
import { FloatingContactWidget } from './floating-contact-widget';
import { getPublicSettings } from '../../lib/settings';

interface StorefrontShellProps {
  children: ReactNode;
}

/** Shared chrome for catalogue and product-detail pages. */
export async function StorefrontShell({ children }: StorefrontShellProps) {
  const { general, menus, seo } = await getPublicSettings();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-16 font-sans text-slate-900 antialiased md:pb-0">
      {general.maintenanceMode && (
        <MaintenanceBanner message={general.maintenanceMessage} />
      )}
      <Header generalSettings={general} menus={menus} />
      <div className="flex-1">{children}</div>
      <Footer generalSettings={general} menus={menus} seo={seo} />
      <FloatingContactWidget generalSettings={general} seo={seo} />
      <CartDrawer />
      <Toast />
    </div>
  );
}
