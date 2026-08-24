import { MembershipTier } from '@prisma/client';

export interface PointsConfig {
  earnRatePercentage: number;
  redeemRateVnd: number;
  minPointsToRedeem: number;
  maxRedeemPercentage: number;
  pointsExpiryDays: number;
  tierMultipliers: Record<MembershipTier, number>;
  tierThresholds: Record<MembershipTier, number>;
}
