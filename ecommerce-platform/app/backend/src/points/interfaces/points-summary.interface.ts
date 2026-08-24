import { MembershipTier, PointsTransactionType } from '@prisma/client';

export interface TierProgressInfo {
  currentTierSpent: number;
  nextTierThreshold: number;
  progressPercentage: number;
  nextTier: MembershipTier | null;
}

export interface LoyaltyPointsSummary {
  currentPoints: number;
  equivalentVnd: number;
  membershipTier: MembershipTier;
  tierProgress: TierProgressInfo;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  pointsExpiringSoon?: {
    points: number;
    expiresAt: string;
  } | null;
}

export interface PointsLedgerItemDto {
  id: number;
  userId: number;
  orderId: number | null;
  orderCode: string | null;
  type: PointsTransactionType;
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  metadata?: any;
  createdAt: Date | string;
}

export interface PointsHistoryPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PointsHistoryResponse {
  items: PointsLedgerItemDto[];
  meta: PointsHistoryPaginationMeta;
}
