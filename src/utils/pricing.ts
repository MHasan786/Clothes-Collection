/**
 * Pricing and currency calculation utilities for STYLEORA
 */

export interface CartItemSummary {
  unitPrice: number;
  quantity: number;
}

export interface CouponSummary {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
}

export interface OrderTotals {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  qualifiesForFreeShipping: boolean;
  amountNeededForFreeShipping: number;
}

/**
 * Formats integer or number amount into standard Pakistani Rupee representation
 */
export function formatPKR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'PKR 0';
  }
  const rounded = Math.round(amount);
  return `PKR ${rounded.toLocaleString('en-PK')}`;
}

/**
 * Calculates discount percentage and savings safely
 */
export function calculateDiscount(
  regularPrice: number,
  salePrice?: number | null
): { discountPercent: number; hasDiscount: boolean; savings: number } {
  if (!salePrice || salePrice >= regularPrice || regularPrice <= 0) {
    return { discountPercent: 0, hasDiscount: false, savings: 0 };
  }
  const savings = regularPrice - salePrice;
  const discountPercent = Math.round((savings / regularPrice) * 100);
  return { discountPercent, hasDiscount: true, savings };
}

/**
 * Calculates comprehensive server/client consistent order breakdown
 */
export function calculateOrderTotals(
  items: CartItemSummary[],
  coupon: CouponSummary | null = null,
  freeShippingThreshold: number = 5000,
  standardShippingFee: number = 250
): OrderTotals {
  const subtotal = items.reduce(
    (acc, item) => acc + Math.max(0, item.unitPrice) * Math.max(0, item.quantity),
    0
  );

  let discountAmount = 0;

  if (coupon && subtotal > 0) {
    const minOrder = coupon.minOrderAmount || 0;
    if (subtotal >= minOrder) {
      if (coupon.discountType === 'percentage') {
        const calculated = Math.round((subtotal * coupon.discountValue) / 100);
        discountAmount = coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0
          ? Math.min(calculated, coupon.maxDiscountAmount)
          : calculated;
      } else if (coupon.discountType === 'fixed') {
        discountAmount = Math.min(subtotal, coupon.discountValue);
      }
    }
  }

  // Ensure discount doesn't exceed subtotal
  discountAmount = Math.min(subtotal, Math.max(0, discountAmount));

  const eligibleForFree = subtotal >= freeShippingThreshold && subtotal > 0;
  const shippingFee = subtotal === 0 ? 0 : eligibleForFree ? 0 : standardShippingFee;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  return {
    subtotal,
    discountAmount,
    shippingFee,
    total,
    qualifiesForFreeShipping: eligibleForFree,
    amountNeededForFreeShipping,
  };
}
