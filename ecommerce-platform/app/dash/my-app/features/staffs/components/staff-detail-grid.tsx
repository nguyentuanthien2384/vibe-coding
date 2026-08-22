import React from 'react';

interface StaffDetailGridProps {
  children: React.ReactNode;
}

export default function StaffDetailGrid({ children }: StaffDetailGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Card takes 1 column, Role Permissions takes 2 columns on large screens */}
      <div className="lg:col-span-1">
        {React.Children.toArray(children)[0]}
      </div>
      <div className="lg:col-span-2">
        {React.Children.toArray(children)[1]}
      </div>
    </div>
  );
}
