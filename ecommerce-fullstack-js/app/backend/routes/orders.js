const express = require("express")
const router = express.Router()
const Orders = require("../controllers/Orders")
const { orderLimiter } = require("../middlewares/rateLimiter")

// Tạo đơn hàng COD (Rate limited)
router.post("/orders", orderLimiter, Orders.createOrder)

// Khởi tạo Stripe PaymentIntent (Rate limited)
router.post("/orders/create-payment-intent", orderLimiter, Orders.createPaymentIntent)

// Lấy lịch sử đơn hàng
router.get("/orders/my", Orders.getMyOrders)

// Lấy chi tiết một đơn hàng theo ID
router.get("/orders/:id", Orders.getOrderById)

module.exports = router
