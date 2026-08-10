"use client";

import React from "react";
import { UserAddress } from "../../../types/address.types";

interface CheckoutAddressSelectorProps {
  savedAddresses: UserAddress[];
  selectedAddressId: number | "NEW";
  onSelectAddress: (addressId: number | "NEW") => void;
  isLoading: boolean;
  saveNewAddress: boolean;
  onSaveNewAddressChange: (checked: boolean) => void;
}

export const CheckoutAddressSelector: React.FC<CheckoutAddressSelectorProps> = ({
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  isLoading,
  saveNewAddress,
  onSaveNewAddressChange,
}) => {
  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl animate-pulse space-y-2 mb-6">
        <div className="h-4 w-40 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
      </div>
    );
  }

  if (savedAddresses.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-extrabold text-slate-800">
          Địa chỉ giao nhận
        </label>
        <span className="text-xs text-orange-600 font-bold bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
          Đã lưu {savedAddresses.length} địa chỉ
        </span>
      </div>

      {/* Grid of Saved Addresses */}
      <div className="grid grid-cols-1 gap-2.5">
        {savedAddresses.map((addr) => {
          const isSelected = selectedAddressId === addr.id;
          return (
            <div
              key={addr.id}
              onClick={() => onSelectAddress(addr.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                isSelected
                  ? "bg-orange-50/40 border-orange-500 shadow-sm ring-1 ring-orange-500/30"
                  : "bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white"
              }`}
            >
              <input
                type="radio"
                name="selectedAddress"
                checked={isSelected}
                onChange={() => onSelectAddress(addr.id)}
                className="mt-1 w-4 h-4 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {addr.recipientName}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    • {addr.phone}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-extrabold text-orange-600 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-md">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1 truncate">
                  {addr.detailAddress}, {addr.wardName}, {addr.districtName}, {addr.provinceName}
                </p>
              </div>
            </div>
          );
        })}

        {/* Option for custom new address */}
        <div
          onClick={() => onSelectAddress("NEW")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 select-none ${
            selectedAddressId === "NEW"
              ? "bg-slate-900 text-white border-slate-900 shadow-md"
              : "bg-white border-dashed border-gray-300 hover:border-slate-400 text-slate-700"
          }`}
        >
          <input
            type="radio"
            name="selectedAddress"
            checked={selectedAddressId === "NEW"}
            onChange={() => onSelectAddress("NEW")}
            className="w-4 h-4 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
          />
          <div className="flex items-center gap-2 font-bold text-sm">
            <span>+</span>
            <span>Tự nhập địa chỉ mới tùy chỉnh</span>
          </div>
        </div>
      </div>

      {/* Checkbox option to save address if entering a new address */}
      {selectedAddressId === "NEW" && (
        <div className="pt-2 pl-1 animate-fadeIn">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={saveNewAddress}
              onChange={(e) => onSaveNewAddressChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-700">
              Lưu địa chỉ này vào sổ địa chỉ để sử dụng cho lần mua sau
            </span>
          </label>
        </div>
      )}
    </div>
  );
};
