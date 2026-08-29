import React from 'react'
import { CardElement } from '@stripe/react-stripe-js'

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#0a1d37',
      fontFamily: '"Poppins", sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#dc3545',
      iconColor: '#dc3545',
    },
  },
}

const StripeCardInput = ({ visible = false }) => {
  if (!visible) return null

  return (
    <div className="stripe__card-input bg-white rounded shadow-sm p-4 mt-4 border border-primary">
      <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <i className="ri-bank-card-2-line text-primary"></i>
        Thông tin thẻ thanh toán
      </h5>

      <div className="p-3 border rounded bg-light mb-2">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      <small className="text-muted d-flex align-items-center gap-1">
        <i className="ri-shield-check-line text-success"></i>
        Giao dịch được bảo mật bởi Stripe 256-bit SSL Encryption
      </small>
    </div>
  )
}

export default StripeCardInput
