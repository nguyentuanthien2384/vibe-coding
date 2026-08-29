const mongoose = require("mongoose")

const OrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { _id: false }
)

const OrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "Vui lòng nhập họ và tên khách hàng"],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, "Vui lòng nhập email khách hàng"],
      lowercase: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
      trim: true,
    },
    shippingAddress: {
      street: {
        type: String,
        required: [true, "Vui lòng nhập địa chỉ giao hàng"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "Vui lòng nhập thành phố/tỉnh"],
        trim: true,
      },
      country: {
        type: String,
        default: "Vietnam",
      },
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [
        (val) => Array.isArray(val) && val.length > 0,
        "Đơn hàng phải có ít nhất 1 sản phẩm",
      ],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 30000,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "STRIPE"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID", "FAILED"],
      default: "UNPAID",
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
)

// Indexing để tối ưu hóa truy vấn
OrderSchema.index({ customerEmail: 1 })
OrderSchema.index({ userId: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ stripePaymentIntentId: 1 }, { sparse: true })
OrderSchema.index({ createdAt: -1 })

module.exports = mongoose.model("Order", OrderSchema)
