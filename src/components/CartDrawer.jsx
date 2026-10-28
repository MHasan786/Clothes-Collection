import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { formatPKR } from '../utils/pricing.js';

export const CartDrawer = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    freeShippingThreshold,
    qualifiesForFreeShipping,
    amountNeededForFreeShipping,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponStatus(null);
    const res = await applyCoupon(couponInput.trim());
    setCouponStatus({ message: res.message, isError: !res.success });
    setIsApplying(false);
    if (res.success) setCouponInput('');
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF9F5] border-l border-[#E8E0D5] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-[#E8E0D5] flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-wide text-[#1A1A1A]">Shopping Bag</h2>
              <p className="text-xs text-[#9C8570] font-sans">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#1A1A1A] hover:text-[#967436] transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#F3EFEA] px-6 py-3 border-b border-[#E8E0D5]/70">
            {qualifiesForFreeShipping ? (
              <p className="text-xs font-medium text-emerald-800 flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-600 mr-2 animate-pulse" />
                Congratulations! You have unlocked Complimentary Express Delivery.
              </p>
            ) : (
              <div className="space-y-1.5">
                <p className="text-xs text-[#6B5E51]">
                  Add <strong className="text-[#1A1A1A]">{formatPKR(amountNeededForFreeShipping)}</strong> more to
                  unlock Free Delivery
                </p>
                <div className="w-full bg-[#E8E0D5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#A8864D] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-[#F3EFEA] flex items-center justify-center text-[#9C8570]">
                  <Tag className="w-8 h-8 opacity-40" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">Your Bag is Empty</h3>
                  <p className="text-xs text-[#9C8570] mt-1 max-w-xs">
                    Explore our latest seasonal collections and curated wardrobe essentials.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#333] transition-colors cursor-pointer"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex space-x-4 pb-6 border-b border-[#E8E0D5]/60">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-20 h-26 object-cover bg-[#F3EFEA] border border-[#E8E0D5]/50 flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-xs sm:text-sm text-[#1A1A1A] line-clamp-2">{item.title}</h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#9C8570] hover:text-red-600 transition-colors ml-2 cursor-pointer"
                          aria-label={`Remove ${item.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-1 flex items-center space-x-3 text-[11px] text-[#9C8570]">
                        <span>Size: <strong className="text-[#1A1A1A]">{item.size}</strong></span>
                        <span>•</span>
                        <span className="flex items-center">
                          Color:
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full ml-1 border border-black/20"
                            style={{ backgroundColor: item.colorCode }}
                          />
                          <span className="ml-1 text-[#1A1A1A]">{item.colorName}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#E8E0D5] bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-[#1A1A1A] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1.5 text-[#1A1A1A] hover:bg-[#F3EFEA] disabled:opacity-30 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-semibold text-xs text-[#1A1A1A]">
                          {formatPKR(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Summary */}
          {items.length > 0 && (
            <div className="border-t border-[#E8E0D5] p-6 bg-[#FAF9F5] space-y-4">
              {/* Coupon Code Input */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. STYLEORA10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full text-xs uppercase px-3 py-2 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A] tracking-wider"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplying || !couponInput.trim()}
                    className="px-4 py-2 bg-[#1A1A1A] text-white text-xs font-medium uppercase tracking-wider hover:bg-[#333] disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {isApplying ? 'Checking...' : 'Apply'}
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 border border-emerald-200">
                    <span className="font-medium">Applied: {appliedCoupon.code}</span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-emerald-700 hover:text-emerald-900 underline text-[11px] cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {couponStatus && (
                  <p className={`text-[11px] ${couponStatus.isError ? 'text-red-600' : 'text-emerald-700'}`}>
                    {couponStatus.message}
                  </p>
                )}
              </form>

              {/* Breakdown */}
              <div className="space-y-2 text-xs pt-2 border-t border-[#E8E0D5]/70">
                <div className="flex justify-between text-[#6B5E51]">
                  <span>Subtotal</span>
                  <span className="text-[#1A1A1A]">{formatPKR(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-{formatPKR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6B5E51]">
                  <span>Estimated Delivery</span>
                  <span>{shippingFee === 0 ? 'COMPLIMENTARY' : formatPKR(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#1A1A1A] pt-2 border-t border-[#E8E0D5]">
                  <span>Total</span>
                  <span>{formatPKR(grandTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-[#1A1A1A] text-[#FAF9F5] text-xs font-semibold uppercase tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-[#333] transition-colors cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-center space-x-2 text-[10px] text-[#9C8570] pt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Cash on Delivery Available Across Pakistan</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
