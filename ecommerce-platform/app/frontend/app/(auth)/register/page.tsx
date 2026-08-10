import React from 'react';
import { AuthCardWrapper } from '../../../components/auth/auth-card-wrapper';
import { RegisterFormContainer } from '../../../components/auth/register-form-container';

export const metadata = {
  title: 'Tạo tài khoản mới - TechBite',
  description: 'Đăng ký ngay để nhận ưu đãi thành viên và trải nghiệm mua sắm tiện lợi tại TechBite.',
};

export default async function RegisterPage() {
  return (
    <AuthCardWrapper
      title="Tạo tài khoản TechBite"
      subtitle="Đăng ký ngay để nhận ưu đãi thành viên và trải nghiệm mua sắm tiện lợi"
      className="max-w-[480px]"
    >
      <RegisterFormContainer />
    </AuthCardWrapper>
  );
}
