'use client';

import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '../../hooks/use-debounce';

const AdminSearchBar = () => {
  const [query, setQuery] = useState('');

  const debouncedQuery = useDebounce(query, 300);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  // When debounced value changes, trigger search
  // (using mock only per skill rules — real API in integrate-api phase)

  return (
    <div className="flex items-center bg-[#F1F4F9] border border-[#D5D5D5] rounded-full px-4 py-2 w-[400px] max-w-full">
      <Search className="w-4 h-4 text-[#202224] opacity-50 mr-2 flex-shrink-0" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search"
        className="bg-transparent border-none outline-none text-sm w-full text-[#202224] placeholder:text-[#202224] placeholder:opacity-50"
      />
    </div>
  );
};

export default AdminSearchBar;
