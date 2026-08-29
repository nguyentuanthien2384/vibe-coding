import React, { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col } from 'reactstrap'
import { toast } from 'react-toastify'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js'

import Helmet from '../components/Helmet/Helmet'
import CommonSection from '../components/Ui/CommonSection'
import BillingForm from '../components/Checkout/BillingForm'
import PaymentMethodSelector from '../components/Checkout/PaymentMethodSelector'
import StripeCardInput from '../components/Checkout/StripeCardInput'
import OrderSummaryPanel from '../components/Checkout/OrderSummaryPanel'
import { clearCart } from '../store/CartSlice'
import '../styles/checkout.css'

// Khởi tạo Stripe Promise (dùng public key từ env hoặc test key fallback)
const stripePublicKey =
  process.env.REACT_APP_STRIPE_PUBLIC_KEY ||
  'pk_test_51MzMockStripeKeyForDevelopmentTesting0000000000000000000000000000000000000000000000000000000000000'
const stripePromise = loadStripe(stripePublicKey)

// Component con bên trong Stripe Elements
const CheckoutFormInner = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()

  const cartItems = useSelector((state) => state.cart.cartItems || [])

  // Guard: Giỏ hàng trống thì không cho vào checkout
  useEffect(() => {
    window.scroll(0, 0)
    if (cartItems.length === 0) {
      toast.warning('Giỏ hàng của bạn đang trống. Vui lòng chọn sản phẩm trước khi thanh toán!', {
        position: 'top-right',
      })
      navigate('/shop')
    }
  }, [cartItems.length, navigate])

  // Tính subtotal và totalAmount từ items thực tế
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const priceNum =
        typeof item.price === 'number'
          ? item.price
          : Number(String(item.price || '0').replace(/[^0-9]/g, '')) || 0
      return acc + priceNum * (item.cartQuantity || 1)
    }, 0)
  }, [cartItems])

  const shippingFee = 30000
  const totalAmount = subtotal + shippingFee

  // State form
  const [formData, setFormData] = useState({
    customerName: 'Nguyễn Văn A',
    customerEmail: 'nguyenvana@gmail.com',
    customerPhone: '0901234567',
    street: '123 Đường Lê Lợi',
    city: 'Hồ Chí Minh',
  })

  const [errors, setErrors] = useState({})
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    window.scroll(0, 0)
  }, [])

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Validate form trước khi submit
  const validateForm = () => {
    const newErrors = {}
    if (!formData.customerName || formData.customerName.trim().length < 2) {
      newErrors.customerName = 'Vui lòng nhập họ và tên (tối thiểu 2 ký tự)'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.customerEmail || !emailRegex.test(formData.customerEmail.trim())) {
      newErrors.customerEmail = 'Email không hợp lệ'
    }
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/
    if (!formData.customerPhone || !phoneRegex.test(formData.customerPhone.trim())) {
      newErrors.customerPhone = 'Số điện thoại không hợp lệ (10 chữ số)'
    }
    if (!formData.street || formData.street.trim().length < 3) {
      newErrors.street = 'Vui lòng nhập địa chỉ nhận hàng chi tiết'
    }
    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = 'Vui lòng nhập tỉnh/thành phố'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Xử lý submit đặt hàng
  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin giao hàng!', { position: 'top-right' })
      return
    }

    setIsLoading(true)

    try {
      if (paymentMethod === 'COD') {
        // Giả lập đặt hàng COD
        await new Promise((resolve) => setTimeout(resolve, 800))

        const orderId = `COD-${Date.now().toString().slice(-6)}`
        dispatch(clearCart())

        toast.success('Đặt hàng thành công!', { position: 'top-right' })
        navigate('/order-success', {
          state: {
            orderId,
            totalAmount,
            paymentMethod: 'COD',
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            shippingAddress: `${formData.street}, ${formData.city}`,
          },
        })
      } else {
        // Xử lý thanh toán Stripe
        if (!stripe || !elements) {
          toast.error('Cổng thanh toán Stripe chưa sẵn sàng!', { position: 'top-right' })
          setIsLoading(false)
          return
        }

        const cardElement = elements.getElement(CardElement)
        if (!cardElement) {
          toast.error('Vui lòng nhập thông tin thẻ!', { position: 'top-right' })
          setIsLoading(false)
          return
        }

        // Giả lập thanh toán Stripe thành công trong môi trường UI
        await new Promise((resolve) => setTimeout(resolve, 1200))
        const orderId = `STP-${Date.now().toString().slice(-6)}`
        dispatch(clearCart())

        toast.success('Thanh toán thẻ thành công!', { position: 'top-right' })
        navigate('/order-success', {
          state: {
            orderId,
            totalAmount,
            paymentMethod: 'STRIPE',
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            shippingAddress: `${formData.street}, ${formData.city}`,
          },
        })
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại!', { position: 'top-right' })
    } finally {
      setIsLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return null
  }

  return (
    <section className="checkout__section py-5">
      <Container>

        <Row className="g-4">
          {/* Cột trái: Billing Form & Payment Selector */}
          <Col lg="8" md="12" className="order-2 order-lg-1">
            <BillingForm
              formData={formData}
              onChange={handleFieldChange}
              errors={errors}
            />

            <PaymentMethodSelector
              selected={paymentMethod}
              onChange={(method) => setPaymentMethod(method)}
            />

            <StripeCardInput visible={paymentMethod === 'STRIPE'} />
          </Col>

          {/* Cột phải: Order Summary */}
          <Col lg="4" md="12" className="order-1 order-lg-2">
            <OrderSummaryPanel
              items={cartItems}
              subtotal={subtotal}
              shippingFee={shippingFee}
              totalAmount={totalAmount}
              paymentMethod={paymentMethod}
              isLoading={isLoading}
              onSubmit={handleSubmitOrder}
            />
          </Col>
        </Row>
      </Container>
    </section>
  )
}

const CheckOut = () => {
  return (
    <Helmet title="Checkout">
      <CommonSection title="Thanh toán đơn hàng" />
      <Elements stripe={stripePromise}>
        <CheckoutFormInner />
      </Elements>
    </Helmet>
  )
}

export default CheckOut