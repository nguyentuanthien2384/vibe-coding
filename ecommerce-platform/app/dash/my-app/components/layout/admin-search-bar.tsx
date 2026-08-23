'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { useGlobalSearch } from '@/features/search/hooks/use-global-search';
import { GlobalSearchModal } from '@/features/search/components/global-search-modal';

const AdminSearchBar = () => {
  const searchState = useGlobalSearch();

  return (
    <>
      <div
        onClick={searchState.openSearch}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            searchState.openSearch();
          }
        }}
        className="flex items-center justify-between bg-[#F1F4F9] border border-[#D5D5D5] hover:border-blue-400 hover:bg-slate-100 rounded-full px-4 py-2 w-[400px] max-w-full cursor-pointer transition-all duration-150 group shadow-xs select-none"
      >
        <div className="flex items-center min-w-0 flex-1">
          <Search className="w-4 h-4 text-[#202224] opacity-50 mr-2 flex-shrink-0 group-hover:text-blue-600 group-hover:opacity-100 transition-colors" />
          <span className="text-sm text-[#202224]/60 truncate">
            Tìm kiếm nhanh toàn hệ thống...
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1 ml-2 flex-shrink-0">
          <kbd className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md shadow-xs group-hover:border-blue-300">
            <span className="text-[10px]">Ctrl</span> K
          </kbd>
        </div>
      </div>

      <GlobalSearchModal searchState={searchState} />
    </>
  );
};

export default AdminSearchBar;
