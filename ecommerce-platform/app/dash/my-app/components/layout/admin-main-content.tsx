import React from 'react';

export interface AdminMainContentProps {
  children: React.ReactNode;
  className?: string;
}

const AdminMainContent = ({ children, className = '' }: AdminMainContentProps) => {
  return (
    <main className={`flex-1 min-h-0 overflow-y-auto bg-[#F5F6FA] ${className}`}>
      <div className="px-8 py-6">
        {children}
      </div>
    </main>
  );
};

export default AdminMainContent;
