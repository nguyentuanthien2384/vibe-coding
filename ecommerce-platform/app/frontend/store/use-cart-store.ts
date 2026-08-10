import { create } from "zustand";
import { CartItemData, CartSummaryData } from "../types/cart";
import {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
  mergeCartApi,
  ApiCartResponse,
} from "../lib/cart";

interface CartStore {
  isOpen: boolean;
  isLoading: boolean;
  isFetched: boolean;
  error: string | null;
  items: CartItemData[];
  summary: CartSummaryData;
  toastMessage: string | null;
  isUpdatingId: string | number | null;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  fetchCart: () => Promise<void>;
  addItem: (
    product: {
      productId: string | number;
      name: string;
      image?: string;
      price?: number;
      originalPrice?: number | null;
      stock?: number;
      quantity?: number;
    }
  ) => Promise<void>;
  updateQuantity: (id: string | number, quantity: number) => Promise<void>;
  removeItem: (id: string | number) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
  clearToast: () => void;
  setToastMessage: (msg: string | null) => void;
  reorderOrder: (
    items: Array<{
      productId: string | number;
      quantity: number;
      productName?: string;
    }>
  ) => Promise<void>;
  getTotalItemsCount: () => number;
  getSubtotal: () => number;
}

/**
 * Helper chuyển đổi dữ liệu từ API Response sang UI State chuẩn
 */
function mapApiResponseToState(res: ApiCartResponse) {
  const items: CartItemData[] = (res.items || []).map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    slug: item.slug,
    image: item.imageUrl,
    price: item.price,
    originalPrice: item.originalPrice,
    quantity: item.quantity,
    stock: item.stock,
    isAvailable: item.isAvailable,
    itemTotal: item.itemTotal,
  }));

  const summary: CartSummaryData = {
    subtotal: res.subtotal,
    shippingFee: res.shippingFee,
    discount: res.discount,
    total: res.total,
  };

  return { items, summary };
}

export const useCartStore = create<CartStore>((set, get) => ({
  isOpen: false,
  isLoading: false,
  isFetched: false,
  error: null,
  items: [],
  summary: {
    subtotal: 0,
    shippingFee: 0,
    discount: 0,
    total: 0,
  },
  toastMessage: null,
  isUpdatingId: null,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  /**
   * 1. [Trạng thái Loading & Success & Error] Lấy thông tin Giỏ hàng từ API
   */
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getCartApi();
      const mapped = mapApiResponseToState(data);
      set({
        items: mapped.items,
        summary: mapped.summary,
        isLoading: false,
        isFetched: true,
      });
    } catch (err: any) {
      set({
        error: err.message || "Không thể tải giỏ hàng",
        isLoading: false,
        isFetched: true,
      });
    }
  },

  /**
   * 2. Thêm sản phẩm vào giỏ hàng qua API
   */
  addItem: async (product) => {
    const numericProductId = Number(product.productId);
    const qty = product.quantity || 1;
    set({ isLoading: true, error: null });

    try {
      const data = await addToCartApi(numericProductId, qty);
      const mapped = mapApiResponseToState(data);
      set({
        items: mapped.items,
        summary: mapped.summary,
        isLoading: false,
        toastMessage: `Đã thêm "${product.name}" vào giỏ hàng!`,
      });
    } catch (err: any) {
      const errorMsg = err.message || `Không thể thêm "${product.name}" vào giỏ`;
      set({
        error: errorMsg,
        isLoading: false,
        toastMessage: `Lỗi: ${errorMsg}`,
      });
    }
  },

  /**
   * 2.1 Mua lại toàn bộ sản phẩm từ 1 Đơn hàng
   */
  reorderOrder: async (orderItems) => {
    if (!orderItems || orderItems.length === 0) return;
    set({ isLoading: true, error: null });

    try {
      let lastData: ApiCartResponse | null = null;
      for (const item of orderItems) {
        const numericId = Number(item.productId);
        const qty = item.quantity || 1;
        lastData = await addToCartApi(numericId, qty);
      }
      if (lastData) {
        const mapped = mapApiResponseToState(lastData);
        set({
          items: mapped.items,
          summary: mapped.summary,
          isLoading: false,
          isOpen: true,
          toastMessage: `Đã nạp lại ${orderItems.length} sản phẩm vào giỏ hàng! ⚡`,
        });
      }
    } catch (err: any) {
      const errorMsg = err.message || "Không thể nạp lại giỏ hàng";
      set({
        error: errorMsg,
        isLoading: false,
        toastMessage: `Lỗi: ${errorMsg}`,
      });
    }
  },

  /**
   * 3. Cập nhật số lượng sản phẩm trong giỏ qua API
   */
  updateQuantity: async (id, quantity) => {
    const numericId = Number(id);
    set({ isUpdatingId: id, error: null });

    try {
      if (quantity <= 0) {
        return get().removeItem(id);
      }
      const data = await updateCartItemApi(numericId, quantity);
      const mapped = mapApiResponseToState(data);
      set({
        items: mapped.items,
        summary: mapped.summary,
        isUpdatingId: null,
      });
    } catch (err: any) {
      set({
        error: err.message || "Không thể cập nhật số lượng",
        isUpdatingId: null,
      });
    }
  },

  /**
   * 4. Xóa 1 sản phẩm khỏi giỏ hàng qua API
   */
  removeItem: async (id) => {
    const numericId = Number(id);
    set({ isUpdatingId: id, error: null });

    try {
      const data = await removeCartItemApi(numericId);
      const mapped = mapApiResponseToState(data);
      set({
        items: mapped.items,
        summary: mapped.summary,
        isUpdatingId: null,
      });
    } catch (err: any) {
      set({
        error: err.message || "Không thể xóa sản phẩm",
        isUpdatingId: null,
      });
    }
  },

  /**
   * 5. Dọn dẹp toàn bộ giỏ hàng
   */
  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await clearCartApi();
      const mapped = mapApiResponseToState(data);
      set({
        items: mapped.items,
        summary: mapped.summary,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || "Không thể dọn dẹp giỏ hàng",
        isLoading: false,
      });
    }
  },

  /**
   * 6. Đồng bộ giỏ hàng vãng lai khi người dùng vừa Đăng nhập thành công
   */
  mergeGuestCart: async () => {
    const currentItems = get().items;
    if (!currentItems || currentItems.length === 0) {
      return get().fetchCart();
    }

    set({ isLoading: true, error: null });
    try {
      const mergePayload = currentItems.map((item) => ({
        productId: Number(item.productId),
        quantity: item.quantity,
      }));

      const data = await mergeCartApi(mergePayload);
      const mapped = mapApiResponseToState(data);
      set({
        items: mapped.items,
        summary: mapped.summary,
        isLoading: false,
        isFetched: true,
      });
    } catch {
      // Fallback lấy giỏ hàng user nếu merge lỗi
      await get().fetchCart();
    }
  },

  clearToast: () => set({ toastMessage: null }),
  setToastMessage: (msg: string | null) => set({ toastMessage: msg }),

  getTotalItemsCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().summary.subtotal || get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));
