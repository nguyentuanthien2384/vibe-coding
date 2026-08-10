import React from 'react';
import Link from 'next/link';
import { AuthFooterLinkProps } from '../../types/auth-ui.types';

export const AuthFooterLink: React.FC<AuthFooterLinkProps> = ({
  promptText,
  linkText,
  href,
}) => {
  return (
    <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-slate-500">
      <span>{promptText}</span>
      <Link
        href={href}
        className="font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors ml-1.5"
      >
        {linkText}
      </Link>
    </div>
  );
};
