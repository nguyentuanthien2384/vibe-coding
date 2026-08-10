export class UserRegisteredEvent {
  userId: number;
  email: string;
  fullName: string;
  registeredAt: Date;

  constructor(partial: Partial<UserRegisteredEvent>) {
    Object.assign(this, partial);
  }
}

export interface OrderItemPayload {
  productName: string;
  quantity: number;
  price: number;
  itemTotal: number;
}

export class OrderConfirmedEvent {
  userId?: number;
  email: string;
  customerName: string;
  orderCode: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  items: OrderItemPayload[];
  createdAt: Date;

  constructor(partial: Partial<OrderConfirmedEvent>) {
    Object.assign(this, partial);
  }
}

export class PasswordChangedEvent {
  userId: number;
  email: string;
  fullName: string;
  changedAt: Date;
  ipAddress?: string;

  constructor(partial: Partial<PasswordChangedEvent>) {
    Object.assign(this, partial);
  }
}

export class TokenCompromisedEvent {
  userId: number;
  email: string;
  fullName: string;
  detectedAt: Date;
  ipAddress?: string;

  constructor(partial: Partial<TokenCompromisedEvent>) {
    Object.assign(this, partial);
  }
}
