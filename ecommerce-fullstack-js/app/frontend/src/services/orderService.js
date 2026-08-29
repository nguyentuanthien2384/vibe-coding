import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

/**
 * [POST] /orders
 * Tạo đơn hàng mới theo phương thức COD
 */
export const createCODOrder = async (orderData) => {
  const response = await apiClient.post('/orders', orderData)
  return response.data
}

/**
 * [POST] /orders/create-payment-intent
 * Khởi tạo Stripe PaymentIntent cho đơn hàng thanh toán thẻ
 */
export const createPaymentIntent = async (orderData) => {
  const response = await apiClient.post('/orders/create-payment-intent', orderData)
  return response.data
}

/**
 * [GET] /orders/:id
 * Lấy thông tin chi tiết của một đơn hàng
 */
export const getOrderDetails = async (orderId) => {
  const response = await apiClient.get(`/orders/${orderId}`)
  return response.data
}

/**
 * [GET] /orders/my
 * Lấy lịch sử đơn hàng của khách hàng theo email
 */
export const getMyOrders = async (email) => {
  const response = await apiClient.get('/orders/my', {
    params: { email },
  })
  return response.data
}

const orderService = {
  createCODOrder,
  createPaymentIntent,
  getOrderDetails,
  getMyOrders,
}

export default orderService

