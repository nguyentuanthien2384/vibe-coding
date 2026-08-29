import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Helmet from '../components/Helmet/Helmet'
import CommonSection from '../components/Ui/CommonSection'
import OrderSuccessContent from '../components/Checkout/OrderSuccessContent'

const OrderSuccess = () => {
  const location = useLocation()

  const state = location.state || {}
  const orderId = state.orderId || 'ORD-9824-VN'
  const totalAmount = state.totalAmount || 2140000
  const paymentMethod = state.paymentMethod || 'COD'
  const customerName = state.customerName || 'Nguyễn Văn A'
  const customerEmail = state.customerEmail || 'nguyenvana@gmail.com'
  const shippingAddress = state.shippingAddress || '123 Đường Lê Lợi, Hồ Chí Minh'

  useEffect(() => {
    window.scroll(0, 0)
  }, [])

  return (
    <Helmet title="Order Success">
      <CommonSection title="Hoàn tất đơn hàng" />
      <OrderSuccessContent
        orderId={orderId}
        totalAmount={totalAmount}
        paymentMethod={paymentMethod}
        customerName={customerName}
        customerEmail={customerEmail}
        shippingAddress={shippingAddress}
      />
    </Helmet>
  )
}

export default OrderSuccess
