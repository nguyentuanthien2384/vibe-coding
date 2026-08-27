import { ReactNode } from 'react';

interface BlogFormLayoutProps {
  leftColumn: ReactNode;
  rightColumn: ReactNode;
}

export default function BlogFormLayout({ leftColumn, rightColumn }: BlogFormLayoutProps) {
  return (
    <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
      {/* Left column - main content (8 cols) */}
      <div className="col-span-12 lg:col-span-8 space-y-6">{leftColumn}</div>

      {/* Right column - sidebar config (4 cols, sticky) */}
      <div className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-20">{rightColumn}</div>
    </div>
  );
}
