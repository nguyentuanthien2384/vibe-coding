/** Thông tin sản phẩm nằm trong Giỏ Hàng TechBite */
export interface CartItemData {
  id: string | number;         // ID duy nhất của dòng trong giỏ
  productId: string | number;  // ID sản phẩm gốc
  name: string;                // Tên sản phẩm
  slug?: string;               // Slug đường dẫn sản phẩm
  image: string;               // URL ảnh đại diện (Aspect Ratio 1:1)
  price: number;               // Giá hiện tại
  originalPrice?: number | null; // Giá gốc chưa giảm
  quantity: number;            // Số lượng hiện tại trong giỏ
  stock: number;               // Tồn kho khả dụng tối đa
  isAvailable?: boolean;       // Trạng thái khả dụng
  itemTotal?: number;          // Thành tiền của dòng
}

/** Tóm tắt giá trị thanh toán của Giỏ Hàng */
export interface CartSummaryData {
  subtotal: number;       // Tạm tính tổng tiền sản phẩm
  shippingFee: number;    // Phí giao hàng (0 = "Miễn phí")
  discount: number;       // Giá trị giảm giá
  total: number;          // Tổng tiền cuối cùng
}

// ----------------------------------------------------
// PROPS INTERFACES CHO CÁC DUMB COMPONENTS
// ----------------------------------------------------

/** Props cho Shared UI: QuantityCounter */
export interface QuantityCounterProps {
  quantity: number;
  maxStock: number;
  minQuantity?: number;
  onChange: (newQuantity: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

/** Props cho CartItem Component */
export interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (id: string | number, quantity: number) => void;
  onRemoveItem: (id: string | number) => void;
  isUpdating?: boolean;
}

/** Props cho CartItemList Component */
export interface CartItemListProps {
  items: CartItemData[];
  onUpdateQuantity: (id: string | number, quantity: number) => void;
  onRemoveItem: (id: string | number) => void;
  onContinueShopping: () => void;
  isLoading?: boolean;
  error?: string | null;
}

/** Props cho CartSummary Component */
export interface CartSummaryProps {
  summary: CartSummaryData;
  onCheckout: () => void;
  isSubmitting?: boolean;
  freeShippingThreshold?: number;
}

/** Props cho CartHeader Component */
export interface CartHeaderProps {
  totalCount: number;
  onClose: () => void;
  onClearCart?: () => void;
}

/** Props cho Shared UI: Backdrop */
export interface BackdropProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}
