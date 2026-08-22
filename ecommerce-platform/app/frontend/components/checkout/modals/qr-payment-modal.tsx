"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Backdrop } from "../../ui/backdrop";
import { QRPaymentModalProps } from "../../../types/checkout";
import { getOrderStatusApi } from "../../../lib/checkout";
import { showToast } from "../../ui/toast";

export const QRPaymentModal: React.FC<QRPaymentModalProps> = ({
  isOpen,
  orderCode,
  qrInfo,
  onClose,
  onPaymentSuccess,
  onConfirmDemoPayment,
}) => {
  const [timeLeft, setTimeLeft] = useState(900); // 15 phút đếm ngược
  const [copiedContent, setCopiedContent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const checkPaymentStatus = async () => {
      try {
        const res = await getOrderStatusApi(orderCode);
        if (res.paymentStatus === 'PAID') {
          onPaymentSuccess();
        }
      } catch {
        // Silently ignore polling errors
      }
    };

    void checkPaymentStatus();
    const pollInterval = setInterval(() => {
      void checkPaymentStatus();
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, [isOpen, orderCode, onPaymentSuccess]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatPrice = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + "đ";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrInfo.qrCodeUrl) return;
    const downloadUrl = `/api/download-qr?url=${encodeURIComponent(
      qrInfo.qrCodeUrl
    )}&filename=VietQR-${orderCode}.png`;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `VietQR-${orderCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleConfirmPayment = async () => {
    setIsVerifying(true);
    try {
      await onConfirmDemoPayment();
      onPaymentSuccess();
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không thể xác nhận thanh toán. Vui lòng thử lại.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <Backdrop isOpen={isOpen} onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl z-10 border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">📱</span>
            <h3 className="text-lg font-extrabold text-slate-900">
              Thanh Toán Chuyển Khoản VietQR
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Countdown Timer */}
        <div className="my-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs md:text-sm">
          <span className="text-amber-800 font-semibold">
            ⏳ Mã QR hết hạn sau:
          </span>
          <span className="font-mono font-extrabold text-red-600 text-base md:text-lg bg-amber-100 px-2 py-0.5 rounded">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* VietQR Image Container */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center my-4">
          <div className="w-56 h-56 mx-auto relative bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
            {qrInfo.qrCodeUrl ? (
              <Image
                src={qrInfo.qrCodeUrl}
                alt="VietQR Code Payment"
                width={216}
                height={216}
                className="object-contain rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                <span className="text-3xl">🏁</span>
                <span>VietQR Auto-Generated</span>
              </div>
            )}
          </div>
          
          {/* Nút Tải mã QR Code */}
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <span>⬇️</span>
              <span>Tải mã QR Code</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-2 font-medium">
            Quét mã bằng App Ngân Hàng hoặc Ví MoMo/ZaloPay
          </p>
        </div>

        {/* Payment Account Details */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 text-sm mb-6">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Ngân hàng:</span>
            <span className="font-bold text-slate-900">{qrInfo.bankName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Số tài khoản:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900">
                {qrInfo.accountNo}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(qrInfo.accountNo)}
                className="text-xs text-orange-600 hover:underline font-semibold"
              >
                Sao chép
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Chủ tài khoản:</span>
            <span className="font-bold text-slate-900">{qrInfo.accountName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Số tiền:</span>
            <span className="font-extrabold text-red-600 text-base">
              {formatPrice(qrInfo.amount)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-slate-500">Nội dung CK:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-slate-900 bg-orange-100 text-orange-900 px-2 py-0.5 rounded">
                {qrInfo.transferContent}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(qrInfo.transferContent)}
                className="text-xs text-orange-600 hover:underline font-semibold"
              >
                {copiedContent ? "Đã chép!" : "Sao chép"}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => void handleConfirmPayment()}
            disabled={isVerifying}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md shadow-orange-600/20 transition-all text-base cursor-pointer flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Đang kiểm tra giao dịch...</span>
              </>
            ) : (
              <>
                <span>✅</span>
                <span>Tôi đã chuyển khoản xong</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm cursor-pointer"
          >
            Đổi phương thức thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};
