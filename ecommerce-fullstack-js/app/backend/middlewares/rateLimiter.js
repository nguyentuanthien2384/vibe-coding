const rateLimit = require("express-rate-limit")

// Rate limiter chống spam tạo đơn hàng: 10 requests / 1 phút / IP
const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    status: 429,
    message: "Bạn đã gửi quá nhiều yêu cầu tạo đơn hàng. Vui lòng thử lại sau 1 phút.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = { orderLimiter }
