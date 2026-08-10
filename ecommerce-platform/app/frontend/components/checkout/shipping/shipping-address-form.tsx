"use client";

import React from "react";
import { ShippingAddressFormProps } from "../../../types/checkout";

// Mock locations for smooth UX
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
    { code: "26746", name: "Phường Võ Thị Sáu" },
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

export const ShippingAddressForm: React.FC<ShippingAddressFormProps> = ({
  provinceCode,
  districtCode,
  wardCode,
  detailAddress,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  onDetailAddressChange,
  errors = {},
}) => {
  const availableDistricts = DISTRICTS_MAP[provinceCode] || [
    { code: "default_d1", name: "Quận/Huyện trung tâm" },
    { code: "default_d2", name: "Quận/Huyện ngoại thành" },
  ];

  const availableWards = WARDS_MAP[districtCode] || [
    { code: "default_w1", name: "Phường/Xã 1" },
    { code: "default_w2", name: "Phường/Xã 2" },
    { code: "default_w3", name: "Phường/Xã 3" },
  ];

  const handleProvChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = PROVINCES.find((p) => p.code === code);
    onProvinceChange(code, selected ? selected.name : "");
  };

  const handleDistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = availableDistricts.find((d) => d.code === code);
    onDistrictChange(code, selected ? selected.name : "");
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = availableWards.find((w) => w.code === code);
    onWardChange(code, selected ? selected.name : "");
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Tỉnh / Thành phố <span className="text-red-500">*</span>
          </label>
          <select
            value={provinceCode}
            onChange={handleProvChange}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
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
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
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
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
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
          onChange={(e) => onDetailAddressChange(e.target.value)}
          placeholder="Ví dụ: 123 Đường Lê Lợi, Tòa nhà Bitexco Tower"
          className={`w-full rounded-xl border ${
            errors.detailAddress ? "border-red-500 bg-red-50/20" : "border-gray-300 bg-gray-50"
          } px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all`}
        />
        {errors.detailAddress && (
          <p className="mt-1 text-xs text-red-500 font-medium">{errors.detailAddress}</p>
        )}
      </div>
    </div>
  );
};
