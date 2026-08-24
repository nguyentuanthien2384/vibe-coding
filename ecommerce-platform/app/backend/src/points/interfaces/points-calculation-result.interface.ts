export interface CheckoutPointsCalculationResult {
  userAvailablePoints: number;
  maxPointsCanUse: number;
  conversionRate: number;
  pointsToUse: number;
  discountAmount: number;
  remainingPayableAmount: number;
  isFullyCovered: boolean;
  estimatedPointsEarn: number;
}
