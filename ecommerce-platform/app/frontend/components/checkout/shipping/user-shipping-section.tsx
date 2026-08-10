"use client";

import React from "react";
import { ShippingAddressForm, ShippingMethodType } from "../../../types/checkout";
import { UserAddress } from "../../../types/address.types";
import { ContactInfoForm } from "./contact-info-form";
import { ShippingAddressForm as AddressForm } from "./shipping-address-form";
import { CheckoutAddressSelector } from "./checkout-address-selector";
import { ShippingMethodSelector } from "./shipping-method-selector";
import { OrderNoteInput } from "./order-note-input";
import { CheckoutTermsCheckbox } from "./checkout-terms-checkbox";

interface UserShippingSectionProps {
  formData: ShippingAddressForm;
  shippingMethod: ShippingMethodType;
  orderNote: string;
  onChangeField: (field: keyof ShippingAddressForm, value: string) => void;
  onShippingMethodChange: (method: ShippingMethodType) => void;
  onOrderNoteChange: (note: string) => void;
  termsAgreed: boolean;
  onTermsAgreedChange: (agreed: boolean) => void;
  termsError?: string;
  errors?: Record<string, string>;
  standardFee: number;
  expressFee: number;

  savedAddresses?: UserAddress[];
  selectedAddressId?: number | "NEW";
  onSelectAddress?: (id: number | "NEW") => void;
  isAddressesLoading?: boolean;
  saveNewAddress?: boolean;
  onSaveNewAddressChange?: (checked: boolean) => void;
}

export const UserShippingSection: React.FC<UserShippingSectionProps> = ({
  formData,
  shippingMethod,
  orderNote,
  onChangeField,
  onShippingMethodChange,
  onOrderNoteChange,
  termsAgreed,
  onTermsAgreedChange,
  termsError,
  errors = {},
  standardFee,
  expressFee,

  savedAddresses = [],
  selectedAddressId = "NEW",
  onSelectAddress,
  isAddressesLoading = false,
  saveNewAddress = false,
  onSaveNewAddressChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Shipping Address Card */}
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-extrabold text-lg">
            📍
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900">
              Thông tin giao hàng
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Vui lòng kiểm tra kỹ thông tin người nhận đơn hàng
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {onSelectAddress && (
            <CheckoutAddressSelector
              savedAddresses={savedAddresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={onSelectAddress}
              isLoading={isAddressesLoading}
              saveNewAddress={saveNewAddress}
              onSaveNewAddressChange={onSaveNewAddressChange || (() => {})}
            />
          )}

          <ContactInfoForm
            fullName={formData.fullName}
            email={formData.email}
            phone={formData.phone}
            onChange={onChangeField}
            errors={errors}
          />

          <AddressForm
            provinceCode={formData.provinceCode}
            districtCode={formData.districtCode}
            wardCode={formData.wardCode}
            detailAddress={formData.detailAddress}
            onProvinceChange={(code, name) => {
              onChangeField("provinceCode", code);
              onChangeField("provinceName", name);
            }}
            onDistrictChange={(code, name) => {
              onChangeField("districtCode", code);
              onChangeField("districtName", name);
            }}
            onWardChange={(code, name) => {
              onChangeField("wardCode", code);
              onChangeField("wardName", name);
            }}
            onDetailAddressChange={(val) => onChangeField("detailAddress", val)}
            errors={errors}
          />
        </div>
      </section>

      {/* Shipping Method, Note & Terms Card */}
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 font-extrabold text-lg">
            📦
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            Phương thức vận chuyển
          </h3>
        </div>

        <ShippingMethodSelector
          selectedMethod={shippingMethod}
          onChange={onShippingMethodChange}
          standardFee={standardFee}
          expressFee={expressFee}
        />

        <div className="mt-6 pt-4 border-t border-gray-100 space-y-4">
          <OrderNoteInput value={orderNote} onChange={onOrderNoteChange} />
          
          <div className="pt-2 border-t border-gray-100">
            <CheckoutTermsCheckbox
              checked={termsAgreed}
              onChange={onTermsAgreedChange}
              error={termsError}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
