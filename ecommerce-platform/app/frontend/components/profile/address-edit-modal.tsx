"use client";

import React, { useState, useEffect } from "react";
import { CreateAddressInput, UserAddress } from "../../types/address.types";
import { showToast } from "../ui/toast";

// Locations map matching checkout location dataset
const PROVINCES = [
  { code: "79", name: "TP. Hồ Chí Minh" },
  { code: "01", name: "TP. Hà Nội" },
  { code: "48", name: "TP. Đà Nẵng" },
  { code: "31", name: "TP. Hải Phòng" },
  { code: "92", name: "TP. Cần Thơ" },
  { code: "74", name: "Bình Dương" },
  { code: "75", name: "Đồng Nai" },
];

const DISTRICTS_MAP: Record<string, Array<{ code: string; name: string }>> = {
  "79": [
    { code: "760", name: "Quận 1" },
    { code: "761", name: "Quận 3" },
    { code: "764", name: "Quận Gò Vấp" },
    { code: "765", name: "Quận Bình Thạnh" },
    { code: "769", name: "TP. Thủ Đức" },
    { code: "770", name: "Quận Tân Bình" },
  ],
  "01": [
    { code: "001", name: "Quận Ba Đình" },
    { code: "002", name: "Quận Hoàn Kiếm" },
    { code: "003", name: "Quận Tây Hồ" },
    { code: "005", name: "Quận Cầu Giấy" },
    { code: "006", name: "Quận Đống Đa" },
  ],
  "48": [
    { code: "490", name: "Quận Hải Châu" },
    { code: "491", name: "Quận Thanh Khê" },
    { code: "492", name: "Quận Sơn Trà" },
  ],
};

const WARDS_MAP: Record<string, Array<{ code: string; name: string }>> = {
  "760": [
    { code: "26734", name: "Phường Bến Nghé" },
    { code: "26737", name: "Phường Bến Thành" },
    { code: "26740", name: "Phường Phạm Ngũ Lão" },
    { code: "26743", name: "Phường Tân Định" },
  ],
  "761": [
    { code: "26746", name: "Phường Võ Thị Sáu" },
    { code: "26749", name: "Phường 1" },
    { code: "26752", name: "Phường 2" },
  ],
  "765": [
    { code: "26830", name: "Phường 1" },
    { code: "26833", name: "Phường 2" },
    { code: "26836", name: "Phường 25" },
  ],
  "001": [
    { code: "00001", name: "Phường Phúc Xá" },
    { code: "00004", name: "Phường Trúc Bạch" },
    { code: "00007", name: "Phường Vĩnh Phúc" },
  ],
};

interface AddressEditModalProps {
  isOpen: boolean;
  initialAddress?: UserAddress | null;
  onClose: () => void;
  onSubmit: (input: CreateAddressInput) => Promise<void>;
}

export const AddressEditModal: React.FC<AddressEditModalProps> = ({
  isOpen,
  initialAddress,
  onClose,
  onSubmit,
}) => {
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [provinceCode, setProvinceCode] = useState("79");
  const [provinceName, setProvinceName] = useState("TP. Hồ Chí Minh");
  const [districtCode, setDistrictCode] = useState("760");
  const [districtName, setDistrictName] = useState("Quận 1");
  const [wardCode, setWardCode] = useState("26734");
  const [wardName, setWardName] = useState("Phường Bến Nghé");
  const [detailAddress, setDetailAddress] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialAddress) {
      setRecipientName(initialAddress.recipientName);
      setPhone(initialAddress.phone);
      setProvinceCode(initialAddress.provinceCode);
      setProvinceName(initialAddress.provinceName);
      setDistrictCode(initialAddress.districtCode);
      setDistrictName(initialAddress.districtName);
      setWardCode(initialAddress.wardCode);
      setWardName(initialAddress.wardName);
      setDetailAddress(initialAddress.detailAddress);
      setIsDefault(initialAddress.isDefault);
    } else {
      setRecipientName("");
      setPhone("");
      setProvinceCode("79");
      setProvinceName("TP. Hồ Chí Minh");
      setDistrictCode("760");
      setDistrictName("Quận 1");
      setWardCode("26734");
      setWardName("Phường Bến Nghé");
      setDetailAddress("");
      setIsDefault(false);
    }
    setErrors({});
  }, [initialAddress, isOpen]);

  if (!isOpen) return null;

  const availableDistricts = DISTRICTS_MAP[provinceCode] || [
    { code: "default_d1", name: "Quận/Huyện trung tâm" },
    { code: "default_d2", name: "Quận/Huyện ngoại thành" },
  ];

  const availableWards = WARDS_MAP[districtCode] || [
    { code: "default_w1", name: "Phường/Xã 1" },
    { code: "default_w2", name: "Phường/Xã 2" },
  ];

  const handleProvChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = PROVINCES.find((p) => p.code === code);
    const name = selected ? selected.name : "";
    setProvinceCode(code);
    setProvinceName(name);

    const dists = DISTRICTS_MAP[code] || [
      { code: "default_d1", name: "Quận/Huyện trung tâm" },
    ];
    setDistrictCode(dists[0].code);
    setDistrictName(dists[0].name);

    const wrds = WARDS_MAP[dists[0].code] || [
      { code: "default_w1", name: "Phường/Xã 1" },
    ];
    setWardCode(wrds[0].code);
    setWardName(wrds[0].name);
  };

  const handleDistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = availableDistricts.find((d) => d.code === code);
    const name = selected ? selected.name : "";
    setDistrictCode(code);
    setDistrictName(name);

    const wrds = WARDS_MAP[code] || [
      { code: "default_w1", name: "Phường/Xã 1" },
    ];
    setWardCode(wrds[0].code);
    setWardName(wrds[0].name);
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = availableWards.find((w) => w.code === code);
    setWardCode(code);
    setWardName(selected ? selected.name : "");
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!recipientName.trim()) errs.recipientName = "Vui lòng nhập tên người nhận";
    if (!phone.trim()) {
      errs.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{9,11}$/.test(phone.trim())) {
      errs.phone = "Số điện thoại không hợp lệ (9-11 chữ số)";
    }
    if (!detailAddress.trim()) errs.detailAddress = "Vui lòng nhập địa chỉ chi tiết";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        provinceCode,
        provinceName,
        districtCode,
        districtName,
        wardCode,
        wardName,
        detailAddress: detailAddress.trim(),
        isDefault,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      showToast({ message: msg, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-8 space-y-6 border border-gray-100 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-extrabold text-xl">
              📍
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {initialAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ giao hàng mới"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Cập nhật thông tin giao nhận chính xác để nhận món nhanh nhất
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-slate-500 font-bold transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Họ và tên người nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className={`w-full rounded-xl border ${
                  errors.recipientName ? "border-red-500 bg-red-50/20" : "border-gray-300 bg-gray-50"
                } px-4 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all`}
              />
              {errors.recipientName && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.recipientName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Số điện thoại liên hệ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0901234567"
                className={`w-full rounded-xl border ${
                  errors.phone ? "border-red-500 bg-red-50/20" : "border-gray-300 bg-gray-50"
                } px-4 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tỉnh / Thành phố <span className="text-red-500">*</span>
              </label>
              <select
                value={provinceCode}
                onChange={handleProvChange}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              >
                {PROVINCES.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Quận / Huyện <span className="text-red-500">*</span>
              </label>
              <select
                value={districtCode}
                onChange={handleDistChange}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              >
                {availableDistricts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Phường / Xã <span className="text-red-500">*</span>
              </label>
              <select
                value={wardCode}
                onChange={handleWardChange}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              >
                {availableWards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Địa chỉ cụ thể (Số nhà, Tên đường) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="VD: 123 Đường Lê Lợi, Tòa nhà Bitexco"
              className={`w-full rounded-xl border ${
                errors.detailAddress ? "border-red-500 bg-red-50/20" : "border-gray-300 bg-gray-50"
              } px-4 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all`}
            />
            {errors.detailAddress && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.detailAddress}</p>
            )}
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 accent-orange-600"
              />
              <span className="text-sm font-semibold text-slate-800">
                Đặt làm địa chỉ giao hàng mặc định
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-gray-100 hover:bg-gray-200 transition-all text-sm cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 transition-all text-sm shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting && (
                <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              )}
              {initialAddress ? "Lưu thay đổi" : "Tạo địa chỉ mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
