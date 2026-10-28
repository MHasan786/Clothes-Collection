import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPKR, calculateDiscount, calculateOrderTotals } from './pricing.js';

test('formatPKR formats currency correctly', () => {
  assert.equal(formatPKR(0), 'PKR 0');
  assert.equal(formatPKR(4950), 'PKR 4,950');
  assert.equal(formatPKR(125000), 'PKR 125,000');
});

test('calculateDiscount returns correct discount percentages and savings', () => {
  const result1 = calculateDiscount(10000, 7500);
  assert.equal(result1.hasDiscount, true);
  assert.equal(result1.discountPercent, 25);
  assert.equal(result1.savings, 2500);

  const result2 = calculateDiscount(5000, 5000);
  assert.equal(result2.hasDiscount, false);
  assert.equal(result2.discountPercent, 0);

  const result3 = calculateDiscount(4000, null);
  assert.equal(result3.hasDiscount, false);
});

test('calculateOrderTotals computes subtotal, free shipping threshold, and discount accurately', () => {
  // Test case 1: Below free shipping threshold without coupon
  const cart1 = [{ unitPrice: 2000, quantity: 2 }]; // 4000
  const totals1 = calculateOrderTotals(cart1, null, 5000, 250);
  assert.equal(totals1.subtotal, 4000);
  assert.equal(totals1.qualifiesForFreeShipping, false);
  assert.equal(totals1.shippingFee, 250);
  assert.equal(totals1.discountAmount, 0);
  assert.equal(totals1.amountNeededForFreeShipping, 1000);
  assert.equal(totals1.total, 4250);

  // Test case 2: Above free shipping threshold with percentage coupon
  const cart2 = [{ unitPrice: 3000, quantity: 2 }]; // 6000
  const coupon2 = {
    code: 'STYLEORA10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 4000,
  };
  const totals2 = calculateOrderTotals(cart2, coupon2, 5000, 250);
  assert.equal(totals2.subtotal, 6000);
  assert.equal(totals2.qualifiesForFreeShipping, true);
  assert.equal(totals2.shippingFee, 0);
  assert.equal(totals2.discountAmount, 600); // 10% of 6000
  assert.equal(totals2.total, 5400);

  // Test case 3: Fixed discount coupon with minimum order check
  const coupon3 = {
    code: 'WELCOME500',
    discountType: 'fixed',
    discountValue: 500,
    minOrderAmount: 4000,
  };
  const totals3 = calculateOrderTotals([{ unitPrice: 2000, quantity: 1 }], coupon3, 5000, 250);
  // Below min order of 4000, coupon should not apply
  assert.equal(totals3.discountAmount, 0);
  assert.equal(totals3.shippingFee, 250);
  assert.equal(totals3.total, 2250);
});
