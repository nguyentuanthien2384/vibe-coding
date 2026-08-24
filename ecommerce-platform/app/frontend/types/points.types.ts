/**
 * TYPES & DATA CONTRACTS CHO HỆ THỐNG TÍCH ĐIỂM & ĐỔI ĐIỂM (LOYALTY POINTS)
 */

export type MembershipTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export type PointsTransactionType =
  | 'EARN'       // Tích điểm từ đơn mua hàng
  | 'REDEEM'     // Trừ điểm khi thanh toán đơn hàng
  | 'REFUND'     // Hoàn trả điểm do đơn hàng bị hủy
  | 'EXPIRE'     // Điểm hết hạn sử dụng
  | 'ADJUST';    // Điều chỉnh thủ công từ hệ thống

export interface PointsConfig {
  earnRatePercentage: number;     // Tỷ lệ tích điểm (% trên giá trị đơn, VD: 1%)
  redeemRateVnd: number;          // Giá trị quy đổi: 1 điểm = ? VNĐ (VD: 1000)
  minPointsToRedeem: number;      // Số điểm tối thiểu để được đổi (VD: 10)
  maxRedeemPercentage: number;    // % tối đa giá trị đơn được trừ bằng điểm (VD: 100%)
  pointsExpiryDays: number;       // Thời hạn sử dụng điểm (ngày, 0 = vĩnh viễn)
}

export interface LoyaltyTierProgress {
  currentTierSpent: number;
  nextTierThreshold: number;
  progressPercentage: number;
  nextTier: MembershipTier | null;
}

export interface LoyaltyPointsSummary {
  currentPoints: number;
  equivalentVnd: number;
  membershipTier: MembershipTier;
  tierProgress: LoyaltyTierProgress;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  pointsExpiringSoon?: {
    points: number;
    expiresAt: string;
  };
}

export interface PointsLedgerItem {
  id: string | number;
  userId: number | string;
  orderId?: string | number | null;
  orderCode?: string | null;
  type: PointsTransactionType;
  points: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface PointsHistoryPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PointsHistoryResponse {
  items: PointsLedgerItem[];
  meta: PointsHistoryPaginationMeta;
}

export interface CheckoutPointsCalculation {
  userAvailablePoints: number;
  maxPointsCanUse: number;
  conversionRate: number;
  pointsToUse: number;
  discountAmount: number;
  remainingPayableAmount: number;
  isFullyCovered: boolean;
  estimatedPointsEarn: number;
}

// ----------------------------------------------------
// PROPS INTERFACES CHO DUMB COMPONENTS
// ----------------------------------------------------

export interface PointsTierBadgeProps {
  tier: MembershipTier;
  showIcon?: boolean;
  className?: string;
}

export interface PointsBalanceHeroCardProps {
  summary: LoyaltyPointsSummary;
  onViewGuide?: () => void;
}

export interface PointsRuleGuideCardProps {
  config: PointsConfig;
  className?: string;
}

export interface PointsHistoryFilterProps {
  currentFilter: PointsTransactionType | 'ALL';
  onFilterChange: (filter: PointsTransactionType | 'ALL') => void;
}

export interface PointsHistoryTableProps {
  items: PointsLedgerItem[];
  isLoading?: boolean;
}

export interface PointsHistoryPaginationProps {
  meta: PointsHistoryPaginationMeta;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export interface PointsRedemptionCardProps {
  availablePoints: number;
  maxPointsCanUse: number;
  pointsToUse: number;
  conversionRate: number;
  discountAmount: number;
  isUsingPoints: boolean;
  onToggleUsePoints: (enabled: boolean) => void;
  onPointsChange: (points: number) => void;
  disabled?: boolean;
}

export interface PointsEarningPreviewProps {
  estimatedPoints: number;
  conversionRate?: number;
  className?: string;
}

export interface PointsGuestBannerProps {
  onLoginClick?: () => void;
  className?: string;
}
