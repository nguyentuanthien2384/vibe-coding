"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "../../store/use-cart-store";
import { useAuthStore } from "../../store/use-auth-store";
import {
  AppliedVoucherData,
  MiniCartItemData,
  PaymentMethodType,
  QRPaymentInfo,
  ShippingAddressForm,
  ShippingMethodType,
} from "../../types/checkout";
import { CheckoutLayoutGrid } from "./checkout-layout-grid";
import { UserShippingSection } from "./shipping/user-shipping-section";
import { OrderSummarySection } from "./summary/order-summary-section";
import { CODConfirmationModal } from "./modals/cod-confirmation-modal";
import { QRPaymentModal } from "./modals/qr-payment-modal";

import { UserAddress } from "../../types/address.types";
import { getAddressesApi, createAddressApi } from "../../lib/addresses";
import { confirmDemoPaymentApi, createOrderApi } from "../../lib/checkout";
import { showToast } from "../ui/toast";

export const CheckoutContainer: React.FC = () => {
  const router = useRouter();
  const cartStore = useCartStore();
  const authStore = useAuthStore();

  const [mounted, setMounted] = useState(false);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "NEW">("NEW");
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ShippingAddressForm>({
    fullName: "",
    email: "",
    phone: "",
    provinceCode: "79",
    provinceName: "TP. Hồ Chí Minh",
    districtCode: "760",
    districtName: "Quận 1",
    wardCode: "26734",
    wardName: "Phường Bến Nghé",
    detailAddress: "123 Đường Lê Lợi, Tòa nhà Bitexco Tower",
  });

  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethodType>("STANDARD");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodType>("QR_CODE");
  const [orderNote, setOrderNote] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Voucher State
  const [appliedVoucher, setAppliedVoucher] =
    useState<AppliedVoucherData | null>(null);

  // Errors & Modals
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletingCheckout, setIsCompletingCheckout] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "NONE" | "COD_CONFIRM" | "QR_PAYMENT"
  >("NONE");

  const [currentOrderCode, setCurrentOrderCode] = useState("");
  const [qrInfo, setQrInfo] = useState<QRPaymentInfo | null>(null);

  // Auto-fill form khi user thay đổi & Fetch sổ địa chỉ nếu đã đăng nhập
  useEffect(() => {
    setMounted(true);
    if (!cartStore.isFetched && !cartStore.isLoading) {
      cartStore.fetchCart();
    }
  }, [cartStore]);

  useEffect(() => {
    async function loadUserAddresses() {
      if (!authStore.user) return;
      try {
        setIsAddressesLoading(true);
        const addrs = await getAddressesApi();
        setSavedAddresses(addrs);

        if (addrs.length > 0) {
          // Ưu tiên chọn địa chỉ mặc định
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
          setFormData((prev) => ({
            ...prev,
            fullName: defaultAddr.recipientName,
            email: authStore.user?.email || prev.email,
            phone: defaultAddr.phone,
            provinceCode: defaultAddr.provinceCode,
            provinceName: defaultAddr.provinceName,
            districtCode: defaultAddr.districtCode,
            districtName: defaultAddr.districtName,
            wardCode: defaultAddr.wardCode,
            wardName: defaultAddr.wardName,
            detailAddress: defaultAddr.detailAddress,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            fullName: authStore.user?.fullName || prev.fullName,
            email: authStore.user?.email || prev.email,
            phone: authStore.user?.phone || prev.phone,
          }));
        }
      } catch {
        // Fallback nhẹ nếu không lấy được sổ địa chỉ
      } finally {
        setIsAddressesLoading(false);
      }
    }

    loadUserAddresses();
  }, [authStore.user]);

  const handleSelectAddress = (id: number | "NEW") => {
    setSelectedAddressId(id);
    if (id === "NEW") {
      setFormData((prev) => ({
        ...prev,
        fullName: authStore.user?.fullName || "",
        email: authStore.user?.email || "",
        phone: authStore.user?.phone || "",
      }));
    } else {
      const target = savedAddresses.find((a) => a.id === id);
      if (target) {
        setFormData((prev) => ({
          ...prev,
          fullName: target.recipientName,
          email: authStore.user?.email || prev.email,
          phone: target.phone,
          provinceCode: target.provinceCode,
          provinceName: target.provinceName,
          districtCode: target.districtCode,
          districtName: target.districtName,
          wardCode: target.wardCode,
          wardName: target.wardName,
          detailAddress: target.detailAddress,
        }));
      }
    }
  };

  // Redirect nếu giỏ hàng trống — chỉ sau khi đã fetch xong VÀ không còn loading
  useEffect(() => {
    if (
      mounted &&
      !isCompletingCheckout &&
      cartStore.isFetched &&
      !cartStore.isLoading &&
      cartStore.items.length === 0
    ) {
      showToast({
        message: "Giỏ hàng của bạn đang trống! Vui lòng chọn sản phẩm trước khi thanh toán.",
        type: "error",
      });
      router.replace("/");
    }
  }, [
    mounted,
    isCompletingCheckout,
    cartStore.isFetched,
    cartStore.isLoading,
    cartStore.items.length,
    router,
  ]);

  // Compute Items - strictly from cartStore without mock fallback
  const items: MiniCartItemData[] = cartStore.items.map((it) => ({
    id: String(it.id),
    productId: String(it.productId),
    name: it.name,
    image: it.image || "",
    price: it.price,
    originalPrice: it.originalPrice ?? undefined,
    quantity: it.quantity,
  }));

  // Shipping Fees
  const standardFee = 30000;
  const expressFee = 50000;
  const currentShippingFee =
    shippingMethod === "STANDARD" ? standardFee : expressFee;

  // Subtotal & Discount Calculation
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = appliedVoucher ? appliedVoucher.calculatedDiscount : 0;
  const total = Math.max(0, subtotal + currentShippingFee - discountAmount);

  const handleFieldChange = (
    field: keyof ShippingAddressForm,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = "Vui lòng nhập Họ và tên";
    if (!formData.phone.trim()) {
      errs.phone = "Vui lòng nhập Số điện thoại";
    } else if (!/^[0-9]{9,11}$/.test(formData.phone.trim())) {
      errs.phone = "Số điện thoại không hợp lệ (9-11 chữ số)";
    }
    if (!formData.email.trim()) {
      errs.email = "Vui lòng nhập Email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Email không hợp lệ";
    }
    if (!formData.detailAddress.trim()) {
      errs.detailAddress = "Vui lòng nhập địa chỉ giao hàng cụ thể";
    }
    if (!termsAgreed) {
      errs.terms = "Bạn cần đồng ý với điều khoản dịch vụ để tiếp tục";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      showToast({
        message: "Vui lòng kiểm tra và điền đầy đủ thông tin giao hàng!",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderRes = await createOrderApi({
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          provinceName: formData.provinceName,
          districtName: formData.districtName,
          wardName: formData.wardName,
          detailAddress: formData.detailAddress,
        },
        shippingMethod,
        paymentMethod,
        voucherCode: appliedVoucher?.voucherCode,
        orderNote: orderNote || undefined,
      });

      setCurrentOrderCode(orderRes.orderCode);

      // Nếu chọn nhập địa chỉ mới và chọn "Lưu vào sổ địa chỉ"
      if (selectedAddressId === "NEW" && saveNewAddress && authStore.user) {
        createAddressApi({
          recipientName: formData.fullName,
          phone: formData.phone,
          provinceCode: formData.provinceCode,
          provinceName: formData.provinceName,
          districtCode: formData.districtCode,
          districtName: formData.districtName,
          wardCode: formData.wardCode,
          wardName: formData.wardName,
          detailAddress: formData.detailAddress,
        }).catch(() => {});
      }

      if (orderRes.paymentMethod === "COD") {
        setActiveModal("COD_CONFIRM");
      } else {
        if (orderRes.qrInfo) {
          setQrInfo(orderRes.qrInfo);
        } else {
          const fallbackQrUrl = `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${orderRes.totalAmount}&addInfo=${orderRes.orderCode}&accountName=CONG%20TY%20TECHBITE`;
          setQrInfo({
            qrCodeUrl: fallbackQrUrl,
            bankName: "MBBank (Ngân hàng Quân Đội)",
            accountNo: "0987654321",
            accountName: "CÔNG TY TNHH TECHBITE ECOMMERCE",
            amount: orderRes.totalAmount,
            transferContent: orderRes.orderCode,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          });
        }
        setActiveModal("QR_PAYMENT");
      }
    } catch (err: any) {
      showToast({
        message: err.message || "Không thể khởi tạo đơn hàng. Vui lòng thử lại.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishSuccess = () => {
    setIsCompletingCheckout(true);
    setActiveModal("NONE");

    // Điều hướng trực tiếp tới trang Chi tiết đơn hàng vừa tạo
    window.location.replace(`/orders/${currentOrderCode}`);
  };

  return (
    <>
      <CheckoutLayoutGrid
        leftColumn={
          <UserShippingSection
            formData={formData}
            shippingMethod={shippingMethod}
            orderNote={orderNote}
            onChangeField={handleFieldChange}
            onShippingMethodChange={setShippingMethod}
            onOrderNoteChange={setOrderNote}
            termsAgreed={termsAgreed}
            onTermsAgreedChange={setTermsAgreed}
            termsError={errors.terms}
            errors={errors}
            standardFee={standardFee}
            expressFee={expressFee}
            savedAddresses={savedAddresses}
            selectedAddressId={selectedAddressId}
            onSelectAddress={handleSelectAddress}
            isAddressesLoading={isAddressesLoading}
            saveNewAddress={saveNewAddress}
            onSaveNewAddressChange={setSaveNewAddress}
          />
        }
        rightColumn={
          <OrderSummarySection
            items={items}
            subtotal={subtotal}
            shippingFee={currentShippingFee}
            discountAmount={discountAmount}
            total={total}
            appliedVoucher={appliedVoucher}
            onApplyVoucher={setAppliedVoucher}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            onSubmitOrder={handleSubmitOrder}
            isSubmitting={isSubmitting}
          />
        }
      />

      {/* Modals */}
      <CODConfirmationModal
        isOpen={activeModal === "COD_CONFIRM"}
        orderCode={currentOrderCode}
        totalAmount={total}
        onConfirm={handleFinishSuccess}
        onClose={() => setActiveModal("NONE")}
      />

      {qrInfo && (
        <QRPaymentModal
          isOpen={activeModal === "QR_PAYMENT"}
          orderCode={currentOrderCode}
          qrInfo={qrInfo}
          onClose={() => setActiveModal("NONE")}
          onPaymentSuccess={handleFinishSuccess}
          onConfirmDemoPayment={() => confirmDemoPaymentApi(currentOrderCode)}
        />
      )}
    </>
  );
};
