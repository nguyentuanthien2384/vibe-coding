import type { ReactNode } from 'react';
import { CartDrawer } from '../cart/cart-drawer';
import { Toast } from '../ui/toast';
import { Footer } from './footer';
import { Header } from './header';

interface StorefrontShellProps {
  children: ReactNode;
}

/** Shared chrome for catalogue and product-detail pages. */
export function StorefrontShell({ children }: StorefrontShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-16 font-sans text-slate-900 antialiased md:pb-0">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      <CartDrawer />
      <Toast />
    </div>
  );
}
