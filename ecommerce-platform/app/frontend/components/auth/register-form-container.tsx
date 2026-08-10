"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from './register-form';
import { AuthFooterLink } from './auth-footer-link';
import { RegisterDto } from '../../types/auth.types';
import { showToast } from '../ui/toast';
import { registerApi } from '../../lib/auth';
import { useAuthStore } from '../../store/use-auth-store';

export const RegisterFormContainer: React.FC = () => {
  const router = useRouter();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const [formData, setFormData] = useState<RegisterDto>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{
    fullName?: { message: string };
    email?: { message: string };
    phone?: { message: string };
    password?: { message: string };
    confirmPassword?: { message: string };
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = { message: 'Họ và tên phải có tối thiểu 2 ký tự' };
    }

    if (!formData.email) {
      newErrors.email = { message: 'Vui lòng nhập địa chỉ Email' };
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = { message: 'Địa chỉ Email không đúng định dạng' };
    }

    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (formData.phone && formData.phone.trim() !== '' && !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = { message: 'Số điện thoại không hợp lệ (VD: 0912345678)' };
    }

    if (!formData.password) {
      newErrors.password = { message: 'Vui lòng nhập mật khẩu' };
    } else if (formData.password.length < 6) {
      newErrors.password = { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' };
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = { message: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số' };
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = { message: 'Vui lòng xác nhận mật khẩu' };
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = { message: 'Mật khẩu xác nhận không trùng khớp' };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterField = (name: keyof RegisterDto) => {
    return {
      name,
      value: formData[name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [name]: e.target.value }));
        if (errors[name]) {
          setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
        if (serverError) setServerError(null);
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await registerApi({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone ? formData.phone.trim() : undefined,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      // Tự động đăng nhập: Cookie HttpOnly đã được Next.js API Route set tự động.
      // Không lưu bất kỳ thông tin User nào vào LocalStorage/Store.
      setAuthenticated(true);

      showToast({
        message: 'Đăng ký và tự động đăng nhập thành công! ⚡',
        type: 'success',
      });

      setIsSubmitting(false);

      // Chuyển hướng về trang chủ
      router.push('/');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại!';
      setServerError(errorMsg);
      showToast({
        message: `Đăng ký thất bại: ${errorMsg}`,
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <RegisterForm
        register={handleRegisterField as any}
        errors={errors as any}
        isSubmitting={isSubmitting}
        serverError={serverError}
        onSubmit={handleSubmit}
      />
      <AuthFooterLink
        promptText="Đã có tài khoản?"
        linkText="Đăng nhập ngay"
        href="/login"
      />
    </>
  );
};
