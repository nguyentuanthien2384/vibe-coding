import React from 'react';
import { AuthCardWrapper } from '../../../components/auth/auth-card-wrapper';
import { LoginFormContainer } from '../../../components/auth/login-form-container';

export const metadata = {
  title: 'Đăng nhập tài khoản - TechBite',
  description: 'Nhập email và mật khẩu của bạn để tiếp tục mua hàng tại TechBite.',
};

export default async function LoginPage() {
  return (
    <AuthCardWrapper
      title="Đăng nhập tài khoản"
      subtitle="Nhập email và mật khẩu để tiếp tục mua hàng tại TechBite"
    >
      <LoginFormContainer />
    </AuthCardWrapper>
  );
}
