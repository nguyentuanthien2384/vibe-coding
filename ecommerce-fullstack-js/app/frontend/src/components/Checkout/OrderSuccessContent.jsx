import React from 'react'
import { Container, Row, Col, Button } from 'reactstrap'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const OrderSuccessContent = ({
  orderId = 'ORD-8942-VN',
  totalAmount = 2140000,
  paymentMethod = 'COD',
  customerName = 'Quý khách',
  customerEmail = '',
  shippingAddress = '',
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  return (
    <section className="order__success-section py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg="8" md="10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-white rounded shadow-sm p-4 p-md-5 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mb-4"
              >
                <i className="ri-checkbox-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
              </motion.div>

              <h2 className="fw-bold mb-2 text-dark">Đặt hàng thành công!</h2>
              <p className="text-muted mb-4">
                Cảm ơn <strong>{customerName}</strong> đã tin tưởng và mua sắm tại cửa hàng chúng tôi.
                {customerEmail && (
                  <> Thông tin xác nhận đơn hàng đã được gửi tới <strong>{customerEmail}</strong>.</>
                )}
              </p>

              {/* Order Details Card */}
              <div className="bg-light rounded p-4 text-start mb-4 border">
                <div className="row g-3">
                  <div className="col-sm-6">
                    <span className="text-muted d-block small">Mã đơn hàng:</span>
                    <strong className="font-monospace text-primary fs-5">{orderId}</strong>
                  </div>

                  <div className="col-sm-6">
                    <span className="text-muted d-block small">Phương thức thanh toán:</span>
                    <span className={`badge ${paymentMethod === 'COD' ? 'bg-success' : 'bg-primary'} fs-6 mt-1`}>
                      {paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Đã thanh toán (Stripe Card)'}
                    </span>
                  </div>

                  {shippingAddress && (
                    <div className="col-12">
                      <span className="text-muted d-block small">Địa chỉ giao hàng:</span>
                      <strong className="text-dark">{shippingAddress}</strong>
                    </div>
                  )}

                  <div className="col-12 pt-2 border-top d-flex justify-content-between align-items-center">
                    <span className="fw-semibold text-dark">Tổng số tiền:</span>
                    <strong className="text-danger fs-4">{formatCurrency(totalAmount)}</strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                <Link to="/shop">
                  <Button color="primary" size="lg" className="px-4 w-100">
                    <i className="ri-shopping-bag-line me-2"></i>
                    Tiếp tục mua sắm
                  </Button>
                </Link>
                <Link to="/">
                  <Button color="outline-secondary" size="lg" className="px-4 w-100">
                    <i className="ri-home-line me-2"></i>
                    Về trang chủ
                  </Button>
                </Link>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default OrderSuccessContent
