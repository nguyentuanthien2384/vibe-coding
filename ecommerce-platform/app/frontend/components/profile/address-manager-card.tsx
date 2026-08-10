"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CreateAddressInput, UserAddress } from "../../types/address.types";
import {
  getAddressesApi,
  createAddressApi,
  updateAddressApi,
  setDefaultAddressApi,
  deleteAddressApi,
} from "../../lib/addresses";
import { AddressEditModal } from "./address-edit-modal";
import { showToast } from "../ui/toast";

export const AddressManagerCard: React.FC = () => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAddressesApi();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể tải sổ địa chỉ";
      setError(msg);
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: UserAddress) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleSaveAddress = async (input: CreateAddressInput) => {
    if (editingAddress) {
      await updateAddressApi(editingAddress.id, input);
      showToast({ message: "Cập nhật địa chỉ giao hàng thành công!", type: "success" });
    } else {
      await createAddressApi(input);
      showToast({ message: "Thêm địa chỉ giao hàng mới thành công!", type: "success" });
    }
    await fetchAddresses();
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddressApi(id);
      showToast({ message: "Đã thiết lập làm địa chỉ mặc định!", type: "success" });
      await fetchAddresses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể đổi địa chỉ mặc định";
      showToast({ message: msg, type: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này khỏi sổ địa chỉ?")) return;

    try {
      await deleteAddressApi(id);
      showToast({ message: "Đã xóa địa chỉ khỏi sổ địa chỉ", type: "info" });
      await fetchAddresses();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Xóa địa chỉ thất bại";
      showToast({ message: msg, type: "error" });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-fadeIn space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>Sổ địa chỉ giao hàng</span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
              {addresses.length} địa chỉ
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Quản lý danh sách địa chỉ nhận hàng để thanh toán cực nhanh ⚡
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl font-extrabold text-white bg-slate-900 hover:bg-slate-800 transition-all text-xs md:text-sm shadow-md flex items-center gap-2 cursor-pointer"
        >
          <span className="text-lg leading-none">+</span>
          <span>Thêm địa chỉ mới</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-5 w-48 bg-gray-200 rounded-md"></div>
                <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-4 w-3/4 bg-gray-200 rounded-md"></div>
              <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error View */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center space-y-2">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchAddresses}
            className="text-xs font-bold text-red-700 hover:underline cursor-pointer"
          >
            Thử tải lại
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && addresses.length === 0 && (
        <div className="text-center py-12 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center text-2xl">
            📍
          </div>
          <h3 className="text-base font-bold text-slate-800">Chưa có địa chỉ giao hàng nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Thêm ngay địa chỉ nhà riêng hoặc công ty của bạn để nhận hàng thuận tiện và tiết kiệm thời gian hơn khi thanh toán.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-2 px-5 py-2.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all text-xs shadow-md cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>+ Tạo địa chỉ đầu tiên</span>
          </button>
        </div>
      )}

      {/* Address List */}
      {!isLoading && !error && addresses.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border transition-all relative ${
                addr.isDefault
                  ? "bg-orange-50/30 border-orange-200 shadow-sm"
                  : "bg-white border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-gray-100/80">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900 text-base">
                    {addr.recipientName}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold bg-gray-100 px-2.5 py-0.5 rounded-md">
                    📞 {addr.phone}
                  </span>
                  {addr.isDefault && (
                    <span className="text-xs font-extrabold text-orange-600 bg-orange-100 border border-orange-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span>★</span> Địa chỉ mặc định
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-all border border-gray-200 hover:border-orange-200 cursor-pointer"
                    >
                      Thiết lập mặc định
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEditModal(addr)}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              <div className="pt-3 space-y-1 text-sm text-slate-600">
                <p className="font-medium text-slate-800">
                  {addr.detailAddress}
                </p>
                <p className="text-xs text-slate-500">
                  {addr.wardName}, {addr.districtName}, {addr.provinceName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      <AddressEditModal
        isOpen={isModalOpen}
        initialAddress={editingAddress}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveAddress}
      />
    </div>
  );
};
