import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MaintenanceBanner } from "@/components/layout/maintenance-banner";
import { OrderDetailContainer } from "@/components/orders/order-detail-container";
import { getPublicSettings } from "@/lib/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}): Promise<Metadata> {
  const { orderCode } = await params;
  return {
    title: `Chi tiết đơn hàng ${orderCode} | TechBite Store`,
    description: `Xem chi tiết sản phẩm, tiến trình vận chuyển và thông tin thanh toán cho đơn hàng ${orderCode}`,
  };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderCode: string }>;
}) {
  const [{ orderCode }, { general, menus, seo }] = await Promise.all([
    params,
    getPublicSettings(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {general.maintenanceMode && (
        <MaintenanceBanner message={general.maintenanceMessage} />
      )}
      <Header generalSettings={general} menus={menus} />
      <main className="flex-1">
        <OrderDetailContainer orderCode={orderCode} />
      </main>
      <Footer generalSettings={general} menus={menus} seo={seo} />
    </div>
  );
}
