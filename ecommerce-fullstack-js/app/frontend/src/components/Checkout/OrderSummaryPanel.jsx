import React from 'react'
import { Button, Spinner } from 'reactstrap'

const OrderSummaryPanel = ({
  items = [],
  subtotal = 0,
  shippingFee = 30000,
  totalAmount = 0,
  paymentMethod = 'COD',
  isLoading = false,
  onSubmit,
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  return (
    <div className="order__summary-panel bg-white rounded shadow-sm p-4 sticky-top" style={{ top: '90px' }}>
      <h4 className="fw-bold pb-3 mb-3 border-bottom d-flex align-items-center justify-content-between">
        <span>Đơn hàng của bạn</span>
        <span className="badge bg-primary rounded-pill fs-6">{items.length} món</span>
      </h4>

      {/* Items list */}
      <div className="order__items-list mb-3" style={{ maxHeight: '320px', overflowY: 'auto' }}>
        {items.length === 0 ? (
          <p className="text-muted text-center py-3">Chưa có sản phẩm nào trong giỏ hàng</p>
        ) : (
          items.map((item, index) => {
            const parsedPrice =
              typeof item.price === 'number'
                ? item.price
                : Number(String(item.price || '0').replace(/[^0-9]/g, '')) || 0
            const itemTotal = parsedPrice * (item.cartQuantity || 1)

            return (
              <div key={item.id || item._id || index} className="d-flex align-items-center justify-content-between gap-3 mb-3 pb-2 border-bottom border-light">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={item.image || 'https://via.placeholder.com/60'}
                    alt={item.product}
                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                    className="border"
                  />
                  <div>
                    <h6 className="mb-0 fw-semibold text-truncate" style={{ maxWidth: '140px' }} title={item.product}>
                      {item.product}
                    </h6>
                    <small className="text-muted">
                      Số lượng: <span className="fw-bold text-dark">{item.cartQuantity || 1}</span>
                    </small>
                  </div>
                </div>

                <div className="text-end">
                  <span className="fw-semibold text-danger">
                    {itemTotal > 0 ? formatCurrency(itemTotal) : item.price}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Price breakdown */}
      <div className="order__price-details border-top pt-3">
        <div className="d-flex justify-content-between mb-2 text-muted">
          <span>Tạm tính:</span>
          <span className="fw-semibold text-dark">{formatCurrency(subtotal)}</span>
        </div>

        <div className="d-flex justify-content-between mb-2 text-muted">
          <span>Phí vận chuyển:</span>
          <span className="fw-semibold text-dark">{formatCurrency(shippingFee)}</span>
        </div>

        <div className="d-flex justify-content-between mb-3 pt-2 border-top fs-5 fw-bold text-dark">
          <span>Tổng thanh toán:</span>
          <span className="text-danger fs-4">{formatCurrency(totalAmount)}</span>
        </div>

        {/* Submit button */}
        <Button
          color="primary"
          className="w-100 py-3 fw-semibold fs-5 rounded d-flex align-items-center justify-content-center gap-2"
          disabled={isLoading || items.length === 0}
          onClick={onSubmit}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" />
              <span>Đang xử lý đơn hàng...</span>
            </>
          ) : (
            <>
              <i className={paymentMethod === 'COD' ? 'ri-shopping-bag-3-line' : 'ri-bank-card-line'}></i>
              <span>
                {paymentMethod === 'COD' ? 'Xác nhận đặt hàng (COD)' : 'Thanh toán qua Stripe'}
              </span>
            </>
          )}
        </Button>

        <div className="text-center mt-3">
          <small className="text-muted d-flex align-items-center justify-content-center gap-1">
            <i className="ri-shield-check-fill text-success"></i>
            Đảm bảo hoàn tiền trong 7 ngày nếu lỗi sản phẩm
          </small>
        </div>
      </div>
    </div>
  )
}

export default OrderSummaryPanel
