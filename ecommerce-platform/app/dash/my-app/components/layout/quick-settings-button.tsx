import { Settings } from 'lucide-react';
import Link from 'next/link';

export interface QuickSettingsButtonProps {
  isCollapsed?: boolean;
}

const QuickSettingsButton = ({ isCollapsed = false }: QuickSettingsButtonProps) => {
  return (
    <Link
      href="/settings"
      title={isCollapsed ? 'Settings' : undefined}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[#202224] opacity-70 hover:bg-[#F1F4F9] hover:opacity-100 transition-all duration-200 ${
        isCollapsed ? 'justify-center px-0 mx-auto w-10' : ''
      }`}
    >
      <Settings className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && <span className="text-sm font-semibold">Settings</span>}
    </Link>
  );
};

export default QuickSettingsButton;
