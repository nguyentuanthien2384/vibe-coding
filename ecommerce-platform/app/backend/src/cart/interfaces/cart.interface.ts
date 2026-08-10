export interface CartItemResponse {
  id: number;
  productId: number;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  originalPrice: number | null;
  quantity: number;
  stock: number;
  isAvailable: boolean;
  itemTotal: number;
}

export interface CartResponse {
  cartId: number;
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  items: CartItemResponse[];
}
