"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileSidebar, ProfileTab } from './profile-sidebar';
import { ProfileInfoCard } from './profile-info-card';
import { ChangePasswordCard } from './change-password-card';
import { OrderHistoryList } from './order-history-list';
import { AddressManagerCard } from './address-manager-card';
import { MyNotificationsCard } from './my-notifications-card';
import { OrderSummaryItem, OrderStatusCounts } from '../../types/auth.types';
import { QRPaymentInfo } from '../../types/checkout';
import { showToast } from '../ui/toast';
import { useAuthStore } from '../../store/use-auth-store';
import { useCartStore } from '../../store/use-cart-store';
import { logoutApi, getMeApi } from '../../lib/auth';
import { getMyOrdersApi, getOrderDetailApi } from '../../lib/orders';
import { QRPaymentModal } from '../checkout/modals/qr-payment-modal';
import { confirmDemoPaymentApi } from '../../lib/checkout';

export const ProfileContainer: React.FC = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [isLoading, setIsLoading] = useState(!user);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<OrderSummaryItem[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusCounts, setStatusCounts] = useState<OrderStatusCounts | undefined>(undefined);
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // QR Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{
    orderCode: string;
    qrInfo: QRPaymentInfo;
  } | null>(null);

  const fetchUserOrders = useCallback(
    async (page = currentPage, status = selectedStatus, search = searchQuery) => {
      try {
        setIsOrdersLoading(true);
        setOrdersError(null);
        const res = await getMyOrdersApi(page, 10, status, search);
        setOrders(res.items || []);
        if (res.meta) {
          setPaginationMeta(res.meta);
          setCurrentPage(res.meta.page);
        }
        if (res.statusCounts) {
          setStatusCounts(res.statusCounts);
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : 'Không thể tải lịch sử đơn hàng của bạn';
        setOrdersError(errorMsg);
      } finally {
        setIsOrdersLoading(false);
      }
    },
    [currentPage, selectedStatus, searchQuery]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadUserProfile() {
      try {
        setFetchError(null);
        if (!user) {
          setIsLoading(true);
        }
        const currentUserData = await getMeApi();
        if (isMounted) {
          setUser(currentUserData);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMsg = err instanceof Error ? err.message : 'Không thể tải thông tin hồ sơ';
          setFetchError(errorMsg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUserProfile();

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  // Load orders khi user sẵn sàng
  useEffect(() => {
    if (user) {
      fetchUserOrders(1, selectedStatus, searchQuery);
    }
  }, [user]);

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setCurrentPage(1);
    fetchUserOrders(1, newStatus, searchQuery);
  };

  const handleSearchChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    setCurrentPage(1);
    fetchUserOrders(1, selectedStatus, newQuery);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchUserOrders(newPage, selectedStatus, searchQuery);
  };

  const handleOpenQrPayment = async (orderCode: string) => {
    try {
      const detail = await getOrderDetailApi(orderCode);
      if (detail && detail.qrInfo) {
        setQrModalData({
          orderCode: detail.orderCode,
          qrInfo: detail.qrInfo,
        });
        setIsQrModalOpen(true);
      } else {
        showToast({
          message: 'Đơn hàng này không yêu cầu mã chuyển khoản VietQR',
          type: 'info',
        });
      }
    } catch {
      showToast({
        message: 'Không thể lấy thông tin chuyển khoản VietQR',
        type: 'error',
      });
    }
  };

  const handleLogout = async () => {
    await logoutApi();
    logout();
    await useCartStore.getState().fetchCart();
    showToast({
      message: 'Đã đăng xuất thành công! Hẹn gặp lại bạn tại TechBite ⚡',
      type: 'info',
    });
    router.push('/login');
  };

  // 1. TRẠNG THÁI LOADING (Skeleton UI)
  if (isLoading && !user) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start animate-pulse">
        {/* Left Sidebar Skeleton */}
        <aside className="md:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col items-center pb-6 border-b border-gray-100">
            <div className="w-20 h-20 rounded-full bg-gray-200 mb-4"></div>
            <div className="h-5 w-32 bg-gray-200 rounded-md mb-2"></div>
            <div className="h-4 w-40 bg-gray-200 rounded-md"></div>
          </div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
            <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
            <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
          </div>
        </aside>

        {/* Right Content Skeleton */}
        <div className="md:col-span-3 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="h-7 w-48 bg-gray-200 rounded-md"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-16 bg-gray-100 rounded-xl"></div>
            <div className="h-16 bg-gray-100 rounded-xl"></div>
            <div className="h-16 bg-gray-100 rounded-xl"></div>
            <div className="h-16 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // 2. TRẠNG THÁI ERROR (Khi không thể lấy thông tin user)
  if (fetchError && !user) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center space-y-4 my-8">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Phiên làm việc hết hạn</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">{fetchError}</p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all text-sm shadow-md cursor-pointer"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // 3. TRẠNG THÁI SUCCESS (Render giao diện chuẩn)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      {/* Left Sidebar */}
      <aside className="lg:col-span-3 md:col-span-4 w-full min-w-0">
        <ProfileSidebar
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />
      </aside>

      {/* Right Content Area */}
      <div className="lg:col-span-9 md:col-span-8 space-y-8 min-w-0">
        {activeTab === 'info' && (
          <>
            <ProfileInfoCard user={user} onUpdateProfile={(updatedUser) => setUser(updatedUser)} />
            <ChangePasswordCard />
            <OrderHistoryList
              orders={orders.slice(0, 5)}
              isLoading={isOrdersLoading}
              error={ordersError}
              onRefresh={() => fetchUserOrders(1, selectedStatus, searchQuery)}
              onViewAll={() => setActiveTab('orders')}
              title="Theo dõi đơn hàng gần đây"
              showViewAllButton={orders.length > 5}
              onOpenQrPayment={handleOpenQrPayment}
            />
          </>
        )}

        {activeTab === 'orders' && (
          <OrderHistoryList
            orders={orders}
            isLoading={isOrdersLoading}
            error={ordersError}
            onRefresh={() => fetchUserOrders(currentPage, selectedStatus, searchQuery)}
            title="Quản lý & Theo dõi đơn hàng"
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            statusCounts={statusCounts}
            onOpenQrPayment={handleOpenQrPayment}
            pagination={{
              page: paginationMeta.page,
              limit: paginationMeta.limit,
              total: paginationMeta.total,
              totalPages: paginationMeta.totalPages,
              onPageChange: handlePageChange,
            }}
          />
        )}

        {activeTab === 'addresses' && (
          <AddressManagerCard />
        )}

        {activeTab === 'favorites' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 animate-fadeIn space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900">Món ăn yêu thích</h2>
            <p className="text-sm text-slate-500">Danh sách các món ăn vặt & thức uống bạn đã thả tim ⚡</p>
          </div>
        )}

        {activeTab === 'notifications' && (
          <MyNotificationsCard />
        )}

        {/* VietQR Payment Modal */}
        {qrModalData && (
          <QRPaymentModal
            isOpen={isQrModalOpen}
            orderCode={qrModalData.orderCode}
            qrInfo={qrModalData.qrInfo}
            onClose={() => setIsQrModalOpen(false)}
            onPaymentSuccess={() => {
              setIsQrModalOpen(false);
              showToast({
                message: 'Thanh toán VietQR thành công!',
                type: 'success',
              });
              fetchUserOrders(currentPage, selectedStatus, searchQuery);
            }}
            onConfirmDemoPayment={() => confirmDemoPaymentApi(qrModalData.orderCode)}
          />
        )}
      </div>
    </div>
  );
};
