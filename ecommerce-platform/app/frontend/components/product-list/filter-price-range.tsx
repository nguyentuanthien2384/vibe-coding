'use client';

// components/product-list/filter-price-range.tsx
import { useEffect, useMemo, useState } from 'react';
import { FilterPriceRangeProps } from '@/types/product-list';

function formatCurrency(val?: number): string {
  if (val === undefined || isNaN(val)) return '';
  return new Intl.NumberFormat('vi-VN').format(val);
}

interface PricePreset {
  label: string;
  min?: number;
  max?: number;
}

/** Tạo danh sách preset khoảng giá linh hoạt dựa trên khoảng giá thực tế từ API */
function buildDynamicPresets(priceRange?: { min: number; max: number }): PricePreset[] {
  if (!priceRange || priceRange.max <= priceRange.min) {
    return [
      { label: 'Dưới 50.000đ', min: undefined, max: 50000 },
      { label: '50.000đ - 100.000đ', min: 50000, max: 100000 },
      { label: '100.000đ - 200.000đ', min: 100000, max: 200000 },
      { label: 'Trên 200.000đ', min: 200000, max: undefined },
    ];
  }

  const { min, max } = priceRange;
  const range = max - min;

  // Tính bước nhảy làm tròn theo 10.000đ
  let step = Math.round((range / 3) / 10000) * 10000;
  if (step < 10000) step = 10000;

  const t1 = Math.floor((min + step) / 10000) * 10000;
  const t2 = Math.floor((t1 + step) / 10000) * 10000;

  if (t2 >= max || t1 <= min) {
    const mid = Math.round(((min + max) / 2) / 5000) * 5000;
    return [
      { label: `Dưới ${formatCurrency(mid)}đ`, min: undefined, max: mid },
      { label: `Trên ${formatCurrency(mid)}đ`, min: mid, max: undefined },
    ];
  }

  return [
    { label: `Dưới ${formatCurrency(t1)}đ`, min: undefined, max: t1 },
    { label: `${formatCurrency(t1)}đ - ${formatCurrency(t2)}đ`, min: t1, max: t2 },
    { label: `Trên ${formatCurrency(t2)}đ`, min: t2, max: undefined },
  ];
}

const FilterPriceRange = ({
  minPrice,
  maxPrice,
  priceRange,
  onChange,
}: FilterPriceRangeProps) => {
  const [inputMin, setInputMin] = useState<string>(
    minPrice !== undefined ? String(minPrice) : '',
  );
  const [inputMax, setInputMax] = useState<string>(
    maxPrice !== undefined ? String(maxPrice) : '',
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presets = useMemo(() => buildDynamicPresets(priceRange), [priceRange]);

  // Sync internal input state when parent props update
  useEffect(() => {
    setInputMin(minPrice !== undefined ? String(minPrice) : '');
    setInputMax(maxPrice !== undefined ? String(maxPrice) : '');
    setErrorMsg(null);
  }, [minPrice, maxPrice]);

  const selectedIndex = presets.findIndex(
    (preset) => preset.min === minPrice && preset.max === maxPrice,
  );

  const isCustomActive =
    (minPrice !== undefined || maxPrice !== undefined) && selectedIndex === -1;

  const handlePresetSelect = (
    index: number,
    min: number | undefined,
    max: number | undefined,
  ) => {
    if (selectedIndex === index) {
      onChange(undefined, undefined);
    } else {
      onChange(min, max);
    }
  };

  const handleApplyCustomRange = () => {
    const cleanMin = inputMin.trim();
    const cleanMax = inputMax.trim();

    const minNum = cleanMin !== '' ? Number(cleanMin) : undefined;
    const maxNum = cleanMax !== '' ? Number(cleanMax) : undefined;

    if (minNum !== undefined && (isNaN(minNum) || minNum < 0)) {
      setErrorMsg('Giá tối thiểu phải là số dương');
      return;
    }

    if (maxNum !== undefined && (isNaN(maxNum) || maxNum < 0)) {
      setErrorMsg('Giá tối đa phải là số dương');
      return;
    }

    if (minNum !== undefined && maxNum !== undefined && minNum > maxNum) {
      setErrorMsg('Giá từ không được lớn hơn giá đến');
      return;
    }

    setErrorMsg(null);
    onChange(minNum, maxNum);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyCustomRange();
    }
  };

  const handleClearPrice = () => {
    setInputMin('');
    setInputMax('');
    setErrorMsg(null);
    onChange(undefined, undefined);
  };

  const minPlaceholder = priceRange?.min ? `${formatCurrency(priceRange.min)}đ` : 'Từ';
  const maxPlaceholder = priceRange?.max ? `${formatCurrency(priceRange.max)}đ` : 'Đến';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-slate-900 tracking-tight uppercase text-xs">
            Khoảng giá
          </h3>
          {priceRange && (priceRange.min > 0 || priceRange.max > 0) && (
            <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
              Thực tế: {formatCurrency(priceRange.min)}đ - {formatCurrency(priceRange.max)}đ
            </span>
          )}
        </div>
        {(minPrice !== undefined || maxPrice !== undefined) && (
          <button
            type="button"
            onClick={handleClearPrice}
            className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 cursor-pointer hover:underline"
          >
            Xóa giá
          </button>
        )}
      </div>

      {/* Dynamic Preset List */}
      <div className="space-y-2">
        {presets.map((preset, index) => {
          const isSelected = selectedIndex === index;
          return (
            <label
              key={index}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <input
                type="radio"
                name="price-preset"
                checked={isSelected}
                onChange={() =>
                  handlePresetSelect(index, preset.min, preset.max)
                }
                className="h-4 w-4 text-orange-600 border-slate-300 focus:ring-orange-500 accent-orange-600 cursor-pointer"
              />
              <span
                className={`text-sm transition-colors ${
                  isSelected
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-600 group-hover:text-slate-900 font-medium'
                }`}
              >
                {preset.label}
              </span>
            </label>
          );
        })}
      </div>

      {/* Custom Min-Max Input Fields */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <span className="text-xs font-semibold text-slate-500 block">
          Tự nhập khoảng giá (đ)
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={priceRange?.min ?? 0}
            max={priceRange?.max}
            step={5000}
            placeholder={minPlaceholder}
            value={inputMin}
            onChange={(e) => setInputMin(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full text-xs px-2.5 py-1.5 rounded-lg border ${
              errorMsg
                ? 'border-red-300 focus:ring-red-400'
                : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500'
            } bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 transition-all`}
          />
          <span className="text-slate-400 text-xs">-</span>
          <input
            type="number"
            min={priceRange?.min ?? 0}
            max={priceRange?.max}
            step={5000}
            placeholder={maxPlaceholder}
            value={inputMax}
            onChange={(e) => setInputMax(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full text-xs px-2.5 py-1.5 rounded-lg border ${
              errorMsg
                ? 'border-red-300 focus:ring-red-400'
                : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500'
            } bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 transition-all`}
          />
        </div>

        {errorMsg && (
          <p className="text-[11px] font-medium text-red-500 animate-fadeIn">
            {errorMsg}
          </p>
        )}

        <button
          type="button"
          onClick={handleApplyCustomRange}
          className="w-full mt-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-1.5 px-3 rounded-lg transition-colors cursor-pointer shadow-sm active:scale-[0.99]"
        >
          Áp dụng
        </button>
      </div>

      {/* Active Custom Badge Indicator */}
      {isCustomActive && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-md text-xs text-orange-700 font-medium">
          <span>
            {minPrice !== undefined && maxPrice !== undefined
              ? `${formatCurrency(minPrice)}đ - ${formatCurrency(maxPrice)}đ`
              : minPrice !== undefined
              ? `>= ${formatCurrency(minPrice)}đ`
              : `<= ${formatCurrency(maxPrice)}đ`}
          </span>
          <button
            onClick={handleClearPrice}
            className="hover:bg-orange-100 rounded p-0.5 transition-colors cursor-pointer"
            title="Xóa khoảng giá"
          >
            <svg
              className="w-3 h-3 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPriceRange;


