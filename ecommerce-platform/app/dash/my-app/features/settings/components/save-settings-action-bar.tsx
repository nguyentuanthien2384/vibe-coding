'use client';

import { Save, RotateCcw, AlertCircle } from 'lucide-react';

interface SaveSettingsActionBarProps {
  isVisible: boolean;
  isSaving: boolean;
  onReset: () => void;
  onSave: () => void;
}

const SaveSettingsActionBar = ({
  isVisible,
  isSaving,
  onReset,
  onSave,
}: SaveSettingsActionBarProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in slide-in-from-bottom-6 duration-300">
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Bạn có thay đổi chưa lưu!</p>
            <p className="text-[11px] text-slate-400">
              Nhấn "Lưu thay đổi" để áp dụng các thiết lập mới ngoài hệ thống.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4880FF] hover:bg-[#3b6edc] text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi 💾'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveSettingsActionBar;
