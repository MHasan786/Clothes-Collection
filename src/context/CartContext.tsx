import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product, ProductVariant } from '../types';
import { calculateOrderTotals, type CouponSummary } from '../utils/pricing';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  grandTotal: number;
  freeShippingThreshold: number;
  qualifiesForFreeShipping: boolean;
  amountNeededForFreeShipping: number;
  appliedCoupon: CouponSummary | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 5000;
const STANDARD_SHIPPING_FEE = 250;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('styleora_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<CouponSummary | null>(() => {
    try {
      const saved = localStorage.getItem('styleora_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('styleora_cart', JSON.stringify(items));
  }, [items]);

  // Sync coupon to localStorage
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('styleora_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('styleora_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    if (variant.stock_quantity <= 0) {
      return { success: false, message: 'This variant is currently out of stock.' };
    }

    const cartItemId = `${product.id}_${variant.id}`;
    const unitPrice = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.regular_price;
    const primaryImg = product.primary_image || (product.images && product.images[0]?.url) || '';

    let errorMsg = '';
    setItems((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > variant.stock_quantity) {
          errorMsg = `Cannot add more. Maximum available stock is ${variant.stock_quantity}.`;
          return prev;
        }
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQty, maxStock: variant.stock_quantity } : item
        );
      } else {
        if (quantity > variant.stock_quantity) {
          errorMsg = `Requested quantity exceeds available stock (${variant.stock_quantity}).`;
          return prev;
        }
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          variantId: variant.id,
          title: product.title,
          sku: variant.sku || product.sku,
          size: variant.size,
          colorName: variant.color_name,
          colorCode: variant.color_code,
          unitPrice,
          quantity,
          maxStock: variant.stock_quantity,
          imageUrl: primaryImg,
        };
        return [...prev, newItem];
      }
    });

    if (errorMsg) {
      return { success: false, message: errorMsg };
    }

    setIsCartOpen(true);
    return { success: true };
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const boundedQty = Math.min(newQty, item.maxStock);
          return { ...item, quantity: boundedQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    try {
      const sub = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: sub }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Invalid coupon code' };
      }
      setAppliedCoupon({
        code: data.code,
        discountType: data.discount_type,
        discountValue: data.discount_value,
        maxDiscountAmount: data.max_discount_amount,
      });
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error validating coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const totals = calculateOrderTotals(
    items.map((i) => ({ unitPrice: i.unitPrice, quantity: i.quantity })),
    appliedCoupon,
    FREE_SHIPPING_THRESHOLD,
    STANDARD_SHIPPING_FEE
  );

  const totalItemsCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        shippingFee: totals.shippingFee,
        grandTotal: totals.total,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        qualifiesForFreeShipping: totals.qualifiesForFreeShipping,
        amountNeededForFreeShipping: totals.amountNeededForFreeShipping,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
