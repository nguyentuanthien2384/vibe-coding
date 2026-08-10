"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from './login-form';
import { AuthFooterLink } from './auth-footer-link';
import { LoginDto } from '../../types/auth.types';
import { showToast } from '../ui/toast';
import { loginApi } from '../../lib/auth';
import { useAuthStore } from '../../store/use-auth-store';
import { useCartStore } from '../../store/use-cart-store';

export const LoginFormContainer: React.FC = () => {
  const router = useRouter();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ email?: { message: string }; password?: { message: string } }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: { email?: { message: string }; password?: { message: string } } = {};
    if (!formData.email) {
      newErrors.email = { message: 'Vui lòng nhập địa chỉ Email' };
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = { message: 'Địa chỉ Email không đúng định dạng' };
    }

    if (!formData.password) {
      newErrors.password = { message: 'Vui lòng nhập mật khẩu' };
    } else if (formData.password.length < 6) {
      newErrors.password = { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterField = (name: keyof LoginDto) => {
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
    } as any;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await loginApi({
        email: formData.email.trim(),
        password: formData.password,
      });

      // Cookie HttpOnly được Next.js API Route set tự động
      setAuthenticated(true);
      // Tự động gộp giỏ hàng vãng lai vào giỏ hàng tài khoản khi Đăng Nhập thành công
      await useCartStore.getState().mergeGuestCart();


      showToast({
        message: 'Đăng nhập thành công! Chào mừng bạn quay trở lại TechBite ⚡',
        type: 'success',
      });

      setIsSubmitting(false);

      // Điều hướng về Trang chủ
      router.push('/');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại!';
      setServerError(errorMsg);
      showToast({
        message: `Đăng nhập thất bại: ${errorMsg}`,
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <LoginForm
        register={handleRegisterField}
        errors={errors as any}
        isSubmitting={isSubmitting}
        serverError={serverError}
        onSubmit={handleSubmit}
      />
      <AuthFooterLink
        promptText="Chưa có tài khoản?"
        linkText="Đăng ký ngay"
        href="/register"
      />
    </>
  );
};
