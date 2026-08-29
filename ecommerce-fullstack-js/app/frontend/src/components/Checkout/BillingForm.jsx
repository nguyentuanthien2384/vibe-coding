import React from 'react'
import { Form, FormGroup, Label, Input } from 'reactstrap'

const BillingForm = ({ formData, onChange, errors = {} }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    onChange(name, value)
  }

  return (
    <div className="billing__form bg-white rounded shadow-sm p-4">
      <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
        <i className="ri-user-location-line text-primary"></i>
        Thông tin giao hàng
      </h4>

      <Form>
        <FormGroup className="mb-3">
          <Label for="customerName" className="form-label fw-semibold">
            Họ và tên <span className="text-danger">*</span>
          </Label>
          <Input
            type="text"
            id="customerName"
            name="customerName"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={formData.customerName || ''}
            onChange={handleChange}
            invalid={!!errors.customerName}
          />
          {errors.customerName && (
            <div className="invalid-feedback d-block">{errors.customerName}</div>
          )}
        </FormGroup>

        <div className="row">
          <div className="col-md-6 mb-3">
            <FormGroup>
              <Label for="customerEmail" className="form-label fw-semibold">
                Email <span className="text-danger">*</span>
              </Label>
              <Input
                type="email"
                id="customerEmail"
                name="customerEmail"
                placeholder="example@gmail.com"
                value={formData.customerEmail || ''}
                onChange={handleChange}
                invalid={!!errors.customerEmail}
              />
              {errors.customerEmail && (
                <div className="invalid-feedback d-block">{errors.customerEmail}</div>
              )}
            </FormGroup>
          </div>

          <div className="col-md-6 mb-3">
            <FormGroup>
              <Label for="customerPhone" className="form-label fw-semibold">
                Số điện thoại <span className="text-danger">*</span>
              </Label>
              <Input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                placeholder="0901 234 567"
                value={formData.customerPhone || ''}
                onChange={handleChange}
                invalid={!!errors.customerPhone}
              />
              {errors.customerPhone && (
                <div className="invalid-feedback d-block">{errors.customerPhone}</div>
              )}
            </FormGroup>
          </div>
        </div>

        <FormGroup className="mb-3">
          <Label for="street" className="form-label fw-semibold">
            Địa chỉ nhận hàng <span className="text-danger">*</span>
          </Label>
          <Input
            type="text"
            id="street"
            name="street"
            placeholder="Số nhà, tên đường, phường/xã"
            value={formData.street || ''}
            onChange={handleChange}
            invalid={!!errors.street}
          />
          {errors.street && (
            <div className="invalid-feedback d-block">{errors.street}</div>
          )}
        </FormGroup>

        <FormGroup className="mb-3">
          <Label for="city" className="form-label fw-semibold">
            Tỉnh / Thành phố <span className="text-danger">*</span>
          </Label>
          <Input
            type="text"
            id="city"
            name="city"
            placeholder="Ví dụ: Hồ Chí Minh, Hà Nội, Đà Nẵng..."
            value={formData.city || ''}
            onChange={handleChange}
            invalid={!!errors.city}
          />
          {errors.city && (
            <div className="invalid-feedback d-block">{errors.city}</div>
          )}
        </FormGroup>
      </Form>
    </div>
  )
}

export default BillingForm
