import React from 'react'

const PaymentMethodSelector = ({ selected = 'COD', onChange }) => {
  return (
    <div className="payment__selector bg-white rounded shadow-sm p-4 mt-4">
      <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <i className="ri-secure-payment-line text-primary"></i>
        Phương thức thanh toán
      </h4>

      <div className="d-flex flex-column gap-3">
        {/* Option 1: COD */}
        <label
          className={`payment__option border rounded p-3 d-flex align-items-center justify-content-between cursor-pointer transition-all ${
            selected === 'COD' ? 'border-primary bg-primary bg-opacity-10' : 'border-light-subtle'
          }`}
          style={{ cursor: 'pointer' }}
          onClick={() => onChange('COD')}
        >
          <div className="d-flex align-items-center gap-3">
            <input
              type="radio"
              name="paymentMethod"
              checked={selected === 'COD'}
              onChange={() => onChange('COD')}
              className="form-check-input mt-0"
            />
            <div>
              <div className="fw-semibold">Thanh toán khi nhận hàng (COD)</div>
              <small className="text-muted">Nhận hàng kiểm tra rồi mới thanh toán tiền mặt</small>
            </div>
          </div>
          <i className="ri-cash-line text-success fs-3"></i>
        </label>

        {/* Option 2: Stripe */}
        <label
          className={`payment__option border rounded p-3 d-flex align-items-center justify-content-between cursor-pointer transition-all ${
            selected === 'STRIPE' ? 'border-primary bg-primary bg-opacity-10' : 'border-light-subtle'
          }`}
          style={{ cursor: 'pointer' }}
          onClick={() => onChange('STRIPE')}
        >
          <div className="d-flex align-items-center gap-3">
            <input
              type="radio"
              name="paymentMethod"
              checked={selected === 'STRIPE'}
              onChange={() => onChange('STRIPE')}
              className="form-check-input mt-0"
            />
            <div>
              <div className="fw-semibold">Thẻ Quốc tế / Trực tuyến (Stripe)</div>
              <small className="text-muted">Hỗ trợ thẻ Visa, MasterCard, Apple Pay, Google Pay</small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <i className="ri-bank-card-line text-primary fs-3"></i>
          </div>
        </label>
      </div>
    </div>
  )
}

export default PaymentMethodSelector
