'use client';

import { useState } from 'react';
import { PointsConfig } from '../../types/settings.types';
import {
  Coins,
  Percent,
  Calculator,
  Award,
  Clock,
  ShieldCheck,
  Zap,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface PointsSettingsFormProps {
  data: PointsConfig;
  onChange: (updated: PointsConfig) => void;
}

const DEFAULT_POINTS_CONFIG: PointsConfig = {
  earnRatePercentage: 1.0,
  redeemRateVnd: 1000,
  minPointsToRedeem: 10,
  maxRedeemPercentage: 100,
  pointsExpiryDays: 0,
  tierMultipliers: {
    BRONZE: 1.0,
    SILVER: 1.1,
    GOLD: 1.25,
    DIAMOND: 1.5,
  },
  tierThresholds: {
    BRONZE: 0,
    SILVER: 2000000,
    GOLD: 5000000,
    DIAMOND: 10000000,
  },
};

const TIER_COLORS = {
  BRONZE: 'border-amber-700/30 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300',
  SILVER: 'border-slate-400/40 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200',
  GOLD: 'border-yellow-500/40 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-300',
  DIAMOND: 'border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-800 dark:text-cyan-300',
};

const PointsSettingsForm = ({ data, onChange }: PointsSettingsFormProps) => {
  const currentConfig: PointsConfig = {
    ...DEFAULT_POINTS_CONFIG,
    ...data,
    tierMultipliers: {
      ...DEFAULT_POINTS_CONFIG.tierMultipliers,
      ...(data?.tierMultipliers || {}),
    },
    tierThresholds: {
      ...DEFAULT_POINTS_CONFIG.tierThresholds,
      ...(data?.tierThresholds || {}),
    },
  };

  const [testOrderAmount, setTestOrderAmount] = useState<number>(500000);

  const handleFieldChange = (field: keyof PointsConfig, value: number) => {
    onChange({
      ...currentConfig,
      [field]: value,
    });
  };

  const handleMultiplierChange = (tier: keyof PointsConfig['tierMultipliers'], value: number) => {
    onChange({
      ...currentConfig,
      tierMultipliers: {
        ...currentConfig.tierMultipliers,
        [tier]: value,
      },
    });
  };

  const handleThresholdChange = (tier: keyof PointsConfig['tierThresholds'], value: number) => {
    onChange({
      ...currentConfig,
      tierThresholds: {
        ...currentConfig.tierThresholds,
        [tier]: value,
      },
    });
  };

  // Tính thử nghiệm
  const earnRate = currentConfig.earnRatePercentage || 0;
  const redeemRate = currentConfig.redeemRateVnd || 1000;
  const baseEarnValueVnd = testOrderAmount * (earnRate / 100);

  return (
    <div className="space-y-6">
      {/* 1. Base Points Config Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#4880FF]" />
            Cấu hình Tích & Đổi Điểm Thưởng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Thiết lập tỷ lệ sinh điểm thưởng khi hoàn tất đơn hàng và giá trị quy đổi sang VNĐ khi thanh toán.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earn Rate % */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tỷ Lệ Tích Điểm Cơ Bản (% giá trị đơn hàng) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={currentConfig.earnRatePercentage}
                onChange={(e) => handleFieldChange('earnRatePercentage', parseFloat(e.target.value) || 0)}
                placeholder="1.0"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
              />
              <Percent className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-slate-400">
              Ví dụ: 1% nghĩa là đơn hàng 100.000đ sẽ nhận được 1.000đ giá trị điểm.
            </p>
          </div>

          {/* Redeem Rate VND */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Giá Trị Quy Đổi Điểm (VNĐ / 1 Điểm) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="100"
                min="100"
                value={currentConfig.redeemRateVnd}
                onChange={(e) => handleFieldChange('redeemRateVnd', parseInt(e.target.value, 10) || 0)}
                placeholder="1000"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white font-mono"
              />
              <Coins className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-slate-400">
              Ví dụ: 1.000đ / điểm nghĩa là 10 điểm = 10.000đ khi cấn trừ vào hóa đơn.
            </p>
          </div>

          {/* Min Points To Redeem */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Số Điểm Tối Thiểu Để Đổi Điểm (Điểm)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={currentConfig.minPointsToRedeem}
                onChange={(e) => handleFieldChange('minPointsToRedeem', parseInt(e.target.value, 10) || 0)}
                placeholder="10"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
              />
              <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-slate-400">
              Khách hàng phải tích lũy tối thiểu số điểm này mới được áp dụng tại bước thanh toán.
            </p>
          </div>

          {/* Max Redeem Percentage */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              % Tối Đa Giá Trị Đơn Hàng Được Trừ Bằng Điểm (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                value={currentConfig.maxRedeemPercentage}
                onChange={(e) => handleFieldChange('maxRedeemPercentage', parseInt(e.target.value, 10) || 0)}
                placeholder="100"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
              />
              <Percent className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-slate-400">
              Đặt 100% nếu cho phép trừ toàn bộ tiền hàng (đơn hàng 0đ sau khi áp dụng điểm).
            </p>
          </div>

          {/* Points Expiry Days */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Thời Hạn Sử Dụng Điểm Thưởng (Ngày)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={currentConfig.pointsExpiryDays}
                onChange={(e) => handleFieldChange('pointsExpiryDays', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4880FF] focus:ring-1 focus:ring-[#4880FF] text-slate-900 dark:text-white"
              />
              <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-slate-400">
              Nhập <strong>0</strong> nếu điểm tích lũy có giá trị <strong>vĩnh viễn</strong> (không bao giờ hết hạn).
            </p>
          </div>
        </div>
      </div>

      {/* 2. Membership Tier Multipliers */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Hệ Số Nhân Tích Điểm Theo Hạng Thành Viên
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hạng thành viên càng cao nhận được hệ số nhân tích điểm thưởng càng lớn trên mỗi đơn hàng.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'] as const).map((tier) => {
            const val = currentConfig.tierMultipliers[tier];
            return (
              <div
                key={tier}
                className={`p-4 rounded-xl border ${TIER_COLORS[tier]} space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs tracking-wider">HẠNG {tier}</span>
                  <Sparkles className="w-4 h-4 opacity-75" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium opacity-80">Hệ số nhân (x):</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1"
                    max="5"
                    value={val}
                    onChange={(e) => handleMultiplierChange(tier, parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white text-center focus:outline-none focus:ring-1 focus:ring-[#4880FF]"
                  />
                </div>
                <p className="text-[11px] opacity-75 text-center font-medium">
                  +{Math.round((val - 1) * 100)}% điểm thưởng
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Membership Tier Thresholds */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Mốc Chi Tiêu Tích Lũy Để Thăng Hạng Thành Viên
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tổng chi tiêu tích lũy từ các đơn hàng hoàn tất để khách hàng được nâng hạng tự động.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'] as const).map((tier) => {
            const val = currentConfig.tierThresholds[tier];
            return (
              <div
                key={tier}
                className={`p-4 rounded-xl border ${TIER_COLORS[tier]} space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs tracking-wider">HẠNG {tier}</span>
                  <Zap className="w-4 h-4 opacity-75" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium opacity-80">Chi tiêu tối thiểu (VNĐ):</label>
                  <input
                    type="number"
                    step="500000"
                    min="0"
                    value={val}
                    onChange={(e) => handleThresholdChange(tier, parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-white text-right font-mono focus:outline-none focus:ring-1 focus:ring-[#4880FF]"
                  />
                </div>
                <p className="text-[11px] opacity-75 text-right font-mono font-medium">
                  {val.toLocaleString('vi-VN')} đ
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Live Calculation Preview Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-900 border border-blue-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#4880FF]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Xem Trước Mô Phỏng Tích Điểm (Live Preview)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Giả định đơn hàng:</span>
            <input
              type="number"
              step="100000"
              value={testOrderAmount}
              onChange={(e) => setTestOrderAmount(parseInt(e.target.value, 10) || 0)}
              className="w-32 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white text-right font-mono"
            />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">đ</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'] as const).map((tier) => {
            const mult = currentConfig.tierMultipliers[tier] || 1;
            const pointsEarned = Math.floor((baseEarnValueVnd * mult) / redeemRate);
            const discountValue = pointsEarned * redeemRate;
            return (
              <div
                key={tier}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl p-3 border border-slate-200/60 dark:border-slate-700 space-y-1"
              >
                <span className="text-[11px] font-bold text-slate-500 uppercase">{tier}</span>
                <p className="text-base font-extrabold text-[#4880FF] font-mono">
                  +{pointsEarned.toLocaleString('vi-VN')} <span className="text-xs font-normal">điểm</span>
                </p>
                <p className="text-[10px] text-slate-400">
                  ≈ {discountValue.toLocaleString('vi-VN')}đ giảm giá
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PointsSettingsForm;
