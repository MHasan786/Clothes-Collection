import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { formatPKR, calculateDiscount } from '../utils/pricing.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const QuickViewModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useAuth();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    if (product) {
      const primary = product.primary_image || (product.images && product.images[0]?.url) || '';
      setActiveImage(primary);
      setQuantity(1);
      setFeedbackMsg(null);

      // Auto-select first in-stock variant
      if (product.variants && product.variants.length > 0) {
        const firstInStock = product.variants.find((v) => v.stock_quantity > 0) || product.variants[0];
        setSelectedVariant(firstInStock);
        setSelectedSize(firstInStock.size);
        setSelectedColor(firstInStock.color_name);
      }
    }
  }, [product]);

  // When size or color changes, resolve variant
  useEffect(() => {
    if (product && product.variants && selectedSize && selectedColor) {
      const match = product.variants.find(
        (v) => v.size === selectedSize && v.color_name === selectedColor
      );
      setSelectedVariant(match || null);
    }
  }, [selectedSize, selectedColor, product]);

  if (!product) return null;

  const price = product.sale_price || product.regular_price;
  const { hasDiscount, discountPercent } = calculateDiscount(product.regular_price, product.sale_price);
  const inWishlist = isInWishlist(product.id);

  const availableSizes = Array.from(new Set((product.variants || []).map((v) => v.size)));
  const availableColors = Array.from(
    new Set((product.variants || []).map((v) => JSON.stringify({ name: v.color_name, code: v.color_code })))
  ).map((s) => JSON.parse(s));

  const handleAddToCart = () => {
    if (!selectedVariant) {
      setFeedbackMsg({ text: 'Please select an available size and color', isError: true });
      return;
    }
    const result = addToCart(product, selectedVariant, quantity);
    if (result.success) {
      onClose();
    } else {
      setFeedbackMsg({ text: result.message || 'Cannot add to bag', isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="min-h-screen px-4 text-center flex items-center justify-center py-8">
        <div className="inline-block w-full max-w-4xl bg-[#FAF9F5] border border-[#E8E0D5] p-6 sm:p-8 text-left shadow-2xl relative z-10 transition-all">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#9C8570] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Gallery Left */}
            <div className="space-y-3">
              <div className="aspect-[3/4] w-full overflow-hidden bg-[#F3EFEA] border border-[#E8E0D5]/60">
                <img
                  src={activeImage}
                  alt={product.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.url)}
                      className={`w-16 h-20 flex-shrink-0 border cursor-pointer ${
                        activeImage === img.url ? 'border-[#1A1A1A]' : 'border-transparent opacity-70'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Right */}
            <div className="space-y-5">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-[#9C8570] font-medium">
                  {product.category_name || product.subcategory} • SKU: {product.sku}
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-1">
                  {product.title}
                </h2>

                <div className="mt-3 flex items-baseline space-x-3">
                  <span className="text-xl font-bold text-[#1A1A1A]">{formatPKR(price)}</span>
                  {hasDiscount && (
                    <>
                      <span className="text-sm text-[#9C8570] line-through">
                        {formatPKR(product.regular_price)}
                      </span>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5">
                        Save {discountPercent}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-2">
                  Color: <span className="font-normal text-[#9C8570]">{selectedColor}</span>
                </label>
                <div className="flex items-center space-x-2">
                  {availableColors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                        selectedColor === c.name ? 'border-[#1A1A1A] scale-110' : 'border-transparent'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/20"
                        style={{ backgroundColor: c.code }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
                    Size: <span className="font-normal text-[#9C8570]">{selectedSize}</span>
                  </label>
                  <Link
                    to="/size-guide"
                    target="_blank"
                    className="text-[11px] text-[#9C8570] underline hover:text-[#1A1A1A]"
                  >
                    Size Guide
                  </Link>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map((size) => {
                    const variantForSize = (product.variants || []).find(
                      (v) => v.size === size && (selectedColor ? v.color_name === selectedColor : true)
                    );
                    const isOutOfStock = !variantForSize || variantForSize.stock_quantity <= 0;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={isOutOfStock}
                        className={`py-2 text-xs font-medium uppercase tracking-wider border transition-all cursor-pointer ${
                          selectedSize === size
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                            : isOutOfStock
                            ? 'bg-neutral-100 text-neutral-400 border-neutral-200 line-through cursor-not-allowed'
                            : 'bg-white text-[#1A1A1A] border-[#E8E0D5] hover:border-[#1A1A1A]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stock Indicator */}
              <div>
                {selectedVariant ? (
                  selectedVariant.stock_quantity > 0 ? (
                    <p className="text-xs text-emerald-700 flex items-center font-medium">
                      <Check className="w-3.5 h-3.5 mr-1" />
                      In Stock ({selectedVariant.stock_quantity} pieces available)
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 font-medium">
                      Sold out in this variant
                    </p>
                  )
                ) : (
                  <p className="text-xs text-[#9C8570]">Select a size to check availability</p>
                )}
              </div>

              {feedbackMsg && (
                <p className={`text-xs ${feedbackMsg.isError ? 'text-red-600' : 'text-emerald-700'}`}>
                  {feedbackMsg.text}
                </p>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || selectedVariant.stock_quantity <= 0}
                    className="flex-1 py-3 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-[#333] disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 border border-[#E8E0D5] transition-colors cursor-pointer ${
                      inWishlist ? 'bg-[#1A1A1A] text-white' : 'hover:bg-[#F3EFEA] text-[#1A1A1A]'
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="text-center pt-2">
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={onClose}
                    className="inline-flex items-center text-xs font-medium text-[#9C8570] hover:text-[#1A1A1A] transition-colors"
                  >
                    <span>View Full Product Specifications & Details</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
