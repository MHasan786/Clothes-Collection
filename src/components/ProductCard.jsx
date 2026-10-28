import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { formatPKR, calculateDiscount } from '../utils/pricing.js';
import { useAuth } from '../context/AuthContext.jsx';

export const ProductCard = ({ product, onQuickView }) => {
  const { isInWishlist, toggleWishlist } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const inWishlist = isInWishlist(product.id);

  const price = product.sale_price || product.regular_price;
  const { hasDiscount, discountPercent } = calculateDiscount(product.regular_price, product.sale_price);

  const primaryImage = product.primary_image || (product.images && product.images[0]?.url) || '';
  const secondaryImage = (product.images && product.images[1]?.url) || primaryImage;

  return (
    <div
      className="group relative flex flex-col transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Image Container (Portrait 3:4) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F3EFEA] border border-[#E8E0D5]/50">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm">
              Sale -{discountPercent}%
            </span>
          )}
          {Boolean(product.is_new_arrival) && !hasDiscount && (
            <span className="bg-[#FAF9F5] text-[#1A1A1A] border border-[#E8E0D5] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 shadow-sm">
              New In
            </span>
          )}
          {Boolean(product.is_best_seller) && (
            <span className="bg-[#A8864D] text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 shadow-sm">
              Best Seller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            inWishlist
              ? 'bg-[#1A1A1A] text-white'
              : 'bg-white/80 text-[#1A1A1A] hover:bg-white hover:text-[#967436]'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button (Desktop Hover Overlay) */}
        {onQuickView && (
          <div className="absolute inset-x-3 bottom-3 hidden lg:flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-full py-2.5 bg-[#FAF9F5]/95 hover:bg-[#1A1A1A] hover:text-[#FAF9F5] text-[#1A1A1A] text-xs font-semibold uppercase tracking-[0.15em] backdrop-blur-xs border border-[#E8E0D5] shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Product Meta Info */}
      <div className="pt-3 pb-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Subcategory & Gender Tag */}
          <div className="text-[10px] uppercase tracking-widest text-[#9C8570] font-medium mb-1">
            {product.category_name || product.subcategory || product.gender}
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-sm sm:text-base text-[#1A1A1A] font-semibold tracking-wide group-hover:text-[#967436] transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Color Swatches */}
        {product.available_colors && product.available_colors.length > 0 && (
          <div className="flex items-center space-x-1.5 mt-2">
            {product.available_colors.slice(0, 4).map((c, i) => (
              <span
                key={i}
                title={c.name}
                className="w-2.5 h-2.5 rounded-full border border-black/20"
                style={{ backgroundColor: c.code }}
              />
            ))}
            {product.available_colors.length > 4 && (
              <span className="text-[10px] text-[#9C8570]">
                +{product.available_colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Pricing */}
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
            {formatPKR(price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-[#9C8570] line-through">
              {formatPKR(product.regular_price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
