import React from 'react';
import { AuthCardWrapperProps } from '../../types/auth-ui.types';

export const AuthCardWrapper: React.FC<AuthCardWrapperProps> = ({
  title,
  subtitle,
  children,
  className = 'max-w-[440px]',
}) => {
  return (
    <div className={`w-full ${className} mx-auto bg-white rounded-2xl border border-gray-100 shadow-xl p-8 relative overflow-hidden animate-fadeIn`}>
      {/* Subtle background glow effects matching Stitch design */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        {/* Brand Icon & Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-4">
            <span className="text-orange-600 text-2xl font-bold">⚡</span>
          </div>
          <h1 className="font-extrabold text-2xl text-slate-900 text-center mb-2 tracking-tight">
            {title}
          </h1>
          <p className="text-sm font-medium text-slate-500 text-center">
            {subtitle}
          </p>
        </div>

        {/* Card Form Content */}
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};
