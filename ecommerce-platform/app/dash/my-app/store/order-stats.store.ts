import { create } from 'zustand';
import { ordersApi } from '../lib/orders-api';

interface OrderStatsStore {
  pendingCount: number;
  isLoading: boolean;
  fetchPendingCount: () => Promise<void>;
  setPendingCount: (count: number) => void;
}

export const useOrderStatsStore = create<OrderStatsStore>()((set) => ({
  pendingCount: 0,
  isLoading: false,
  fetchPendingCount: async () => {
    try {
      set({ isLoading: true });
      const res = await ordersApi.getList({ limit: 1 });
      if (res && res.summaryStats) {
        set({
          pendingCount: res.summaryStats.pendingCount || 0,
          isLoading: false,
        });
      }
    } catch {
      // Bỏ qua lỗi nếu chưa đăng nhập hoặc token hết hạn
      set({ isLoading: false });
    }
  },
  setPendingCount: (count: number) => set({ pendingCount: count }),
}));
