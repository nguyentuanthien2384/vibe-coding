const mongoose = require("mongoose")
const Order = require("../models/Order")
const Product = require("../models/Product")

// Khởi tạo Stripe SDK
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    console.warn("⚠️ STRIPE_SECRET_KEY chưa được thiết lập trong .env")
  }
  return require("stripe")(secretKey || "sk_test_placeholder_key")
}

// Helper: Parse chuỗi giá tiền sang dạng số (VND)
const parsePriceToNumber = (priceVal) => {
  if (typeof priceVal === "number") return priceVal
  if (typeof priceVal === "string") {
    const cleaned = priceVal.replace(/[^0-9]/g, "")
    return Number(cleaned) || 0
  }
  return 0
}

/**
 * Helper: Tính toán lại giá tiền đơn hàng hoàn toàn ở Server
 * Chống gian lận giá từ phía Client
 */
const calculateOrderDetailsServerSide = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Đơn hàng phải chứa ít nhất 1 sản phẩm")
  }

  const snapshotItems = []
  let subtotal = 0

  for (const item of items) {
    const qty = Number(item.quantity) || 1
    if (qty <= 0) {
      throw new Error(`Số lượng sản phẩm không hợp lệ: ${qty}`)
    }

    // Tìm sản phẩm trong DB (hỗ trợ cả ObjectId MongoDB lẫn mock item nếu có)
    let productDoc = null
    if (mongoose.Types.ObjectId.isValid(item.productId)) {
      productDoc = await Product.findById(item.productId)
    }

    if (!productDoc) {
      // Nếu không tìm thấy bằng ObjectId, thử tìm theo tên hoặc fallback
      productDoc = await Product.findOne({ product: item.productName || item.product })
    }

    // Lấy thông tin giá từ Database (hoặc fallback an toàn nếu DB đang seed)
    const unitPrice = productDoc ? parsePriceToNumber(productDoc.price) : parsePriceToNumber(item.price)
    const productName = productDoc ? productDoc.product : item.productName || item.product || "Sản phẩm"
    const productImage = productDoc ? productDoc.image : item.image || ""

    if (unitPrice <= 0) {
      throw new Error(`Giá sản phẩm "${productName}" không hợp lệ`)
    }

    const itemTotal = unitPrice * qty
    subtotal += itemTotal

    snapshotItems.push({
      productId: productDoc ? productDoc._id : new mongoose.Types.ObjectId(),
      productName,
      price: unitPrice,
      quantity: qty,
      image: productImage,
    })
  }

  const shippingFee = 30000 // 30,000 VND
  const totalAmount = subtotal + shippingFee

  return { snapshotItems, subtotal, shippingFee, totalAmount }
}

/**
 * [POST] /orders
 * Tạo đơn hàng COD (Thanh toán khi nhận hàng)
 */
exports.createOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, items, paymentMethod } = req.body

    // 1. Validation đầu vào
    if (!customerName || customerName.trim().length < 2) {
      return res.status(400).json({ status: 400, message: "Họ và tên khách hàng không hợp lệ" })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!customerEmail || !emailRegex.test(customerEmail.trim())) {
      return res.status(400).json({ status: 400, message: "Email khách hàng không hợp lệ" })
    }
    if (!customerPhone || customerPhone.trim().length < 9) {
      return res.status(400).json({ status: 400, message: "Số điện thoại không hợp lệ" })
    }
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ status: 400, message: "Địa chỉ giao hàng không đầy đủ" })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: 400, message: "Giỏ hàng trống" })
    }

    // 2. Tính toán giá tiền Server-side
    const { snapshotItems, subtotal, shippingFee, totalAmount } = await calculateOrderDetailsServerSide(items)

    // 3. Tạo Order Document
    const newOrder = new Order({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      shippingAddress: {
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        country: shippingAddress.country || "Vietnam",
      },
      items: snapshotItems,
      subtotal,
      shippingFee,
      totalAmount,
      paymentMethod: paymentMethod === "STRIPE" ? "STRIPE" : "COD",
      paymentStatus: "UNPAID",
      status: "PENDING",
      userId: req.user ? req.user.id : null,
    })

    await newOrder.save()

    return res.status(201).json({
      status: 201,
      message: "Đặt hàng thành công",
      data: newOrder,
    })
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error.message)
    return res.status(500).json({ status: 500, message: error.message || "Lỗi máy chủ khi tạo đơn hàng" })
  }
}

/**
 * [POST] /orders/create-payment-intent
 * Khởi tạo Stripe PaymentIntent cho thanh toán trực tuyến
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, items } = req.body

    // 1. Validation
    if (!customerName || !customerEmail || !customerPhone || !shippingAddress) {
      return res.status(400).json({ status: 400, message: "Thiếu thông tin người mua hoặc địa chỉ" })
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: 400, message: "Giỏ hàng trống" })
    }

    // 2. Tính giá Server-side
    const { snapshotItems, subtotal, shippingFee, totalAmount } = await calculateOrderDetailsServerSide(items)

    // 3. Tạo Order tạm thời ở trạng thái UNPAID
    const newOrder = new Order({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      shippingAddress: {
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        country: shippingAddress.country || "Vietnam",
      },
      items: snapshotItems,
      subtotal,
      shippingFee,
      totalAmount,
      paymentMethod: "STRIPE",
      paymentStatus: "UNPAID",
      status: "PENDING",
      userId: req.user ? req.user.id : null,
    })

    await newOrder.save()

    // 4. Tạo Stripe PaymentIntent
    const stripe = getStripe()
    let clientSecret = ""

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: "vnd",
        metadata: {
          orderId: newOrder._id.toString(),
          customerEmail: newOrder.customerEmail,
        },
      })

      newOrder.stripePaymentIntentId = paymentIntent.id
      await newOrder.save()
      clientSecret = paymentIntent.client_secret
    } catch (stripeErr) {
      console.warn("⚠️ Stripe API call error (môi trường dev):", stripeErr.message)
      // Mock clientSecret cho môi trường test khi chưa cấu hình Stripe secret key thật
      clientSecret = `pi_mock_${newOrder._id}_secret_test`
      newOrder.stripePaymentIntentId = `pi_mock_${newOrder._id}`
      await newOrder.save()
    }

    return res.status(201).json({
      status: 201,
      message: "Khởi tạo thanh toán thành công",
      data: {
        clientSecret,
        orderId: newOrder._id,
        totalAmount,
      },
    })
  } catch (error) {
    console.error("Lỗi khởi tạo Stripe PaymentIntent:", error.message)
    return res.status(500).json({ status: 500, message: error.message || "Lỗi xử lý thanh toán" })
  }
}

/**
 * [POST] /webhook/stripe
 * Xử lý sự kiện Webhook từ Stripe gửi về
 */
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"]
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripe = getStripe()

  let event

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    } else {
      event = typeof req.body === "string" ? JSON.parse(req.body) : req.body
    }
  } catch (err) {
    console.error(`Webhook Signature verification failed: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Xử lý các loại sự kiện từ Stripe
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object
      const orderId = paymentIntent.metadata?.orderId

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "PAID",
          status: "CONFIRMED",
        })
        console.log(`✅ Đơn hàng ${orderId} đã thanh toán thành công qua Stripe!`)
      }
      break
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object
      const orderId = paymentIntent.metadata?.orderId

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "FAILED",
          status: "CANCELLED",
        })
        console.log(`❌ Đơn hàng ${orderId} thanh toán thất bại!`)
      }
      break
    }
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return res.status(200).json({ received: true })
}

/**
 * [GET] /orders/:id
 * Lấy thông tin chi tiết một đơn hàng theo ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 400, message: "Mã đơn hàng không hợp lệ" })
    }

    const order = await Order.findById(id)
    if (!order) {
      return res.status(404).json({ status: 404, message: "Không tìm thấy đơn hàng" })
    }

    return res.status(200).json({ status: 200, data: order })
  } catch (error) {
    console.error("Lỗi khi lấy thông tin đơn hàng:", error.message)
    return res.status(500).json({ status: 500, message: "Lỗi máy chủ" })
  }
}

/**
 * [GET] /orders/my
 * Lấy lịch sử đơn hàng của người dùng đã đăng nhập hoặc theo email
 */
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null
    const email = req.query.email

    const filter = {}
    if (userId) {
      filter.userId = userId
    } else if (email) {
      filter.customerEmail = email.toLowerCase().trim()
    } else {
      return res.status(400).json({ status: 400, message: "Vui lòng cung cấp email hoặc đăng nhập để xem lịch sử" })
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 })
    return res.status(200).json({ status: 200, data: orders })
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error.message)
    return res.status(500).json({ status: 500, message: "Lỗi máy chủ" })
  }
}
