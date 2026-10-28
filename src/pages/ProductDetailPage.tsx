import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  Share2,
  ChevronDown,
  Check,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import type { Product, ProductVariant } from '../types';
import { formatPKR, calculateDiscount } from '../utils/pricing';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { SizeGuideModal } from '../components/SizeGuideModal';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { user, isInWishlist, toggleWishlist } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    description: true,
    fabric: true,
    fit: false,
    care: false,
    shipping: false,
  });

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState<string | null>(null);

  const toggleAccordion = (section: string) => {
    setOpenAccordions((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setFeedbackMsg(null);

    fetch(`/api/products/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Product | null) => {
        if (data) {
          setProduct(data);
          const primary = data.primary_image || (data.images && data.images[0]?.url) || '';
          setActiveImage(primary);

          if (data.variants && data.variants.length > 0) {
            const firstInStock = data.variants.find((v) => v.stock_quantity > 0) || data.variants[0];
            setSelectedVariant(firstInStock);
            setSelectedSize(firstInStock.size);
            setSelectedColor(firstInStock.color_name);
          }

          // Save to recently viewed in localStorage
          try {
            const stored = localStorage.getItem('styleora_recently_viewed');
            let list: Product[] = stored ? JSON.parse(stored) : [];
            list = list.filter((p) => p.id !== data.id);
            list.unshift(data);
            if (list.length > 6) list.pop();
            localStorage.setItem('styleora_recently_viewed', JSON.stringify(list));
            setRecentlyViewed(list.filter((p) => p.id !== data.id));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [slug]);

  // Sync selected variant when size or color changes
  useEffect(() => {
    if (product && product.variants && selectedSize && selectedColor) {
      const match = product.variants.find(
        (v) => v.size === selectedSize && v.color_name === selectedColor
      );
      setSelectedVariant(match || null);
      setQuantity(1);
    }
  }, [selectedSize, selectedColor, product]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF9F5] text-[#9C8570]">
        <p className="text-xs uppercase tracking-widest animate-pulse">Loading Product Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF9F5] p-6 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">Product Not Found</h2>
        <p className="text-xs text-[#6B5E51]">The piece you are seeking may have moved or is no longer available.</p>
        <Link
          to="/shop"
          className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-widest"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const price = product.sale_price || product.regular_price;
  const { hasDiscount, discountPercent, savings } = calculateDiscount(product.regular_price, product.sale_price);
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
    const res = addToCart(product, selectedVariant, quantity);
    if (!res.success) {
      setFeedbackMsg({ text: res.message || 'Cannot add to bag', isError: true });
    }
  };

  const handleBuyNow = () => {
    if (!selectedVariant) {
      setFeedbackMsg({ text: 'Please select an available size and color', isError: true });
      return;
    }
    const res = addToCart(product, selectedVariant, quantity);
    if (res.success) {
      setIsCartOpen(false);
      navigate('/checkout');
    } else {
      setFeedbackMsg({ text: res.message || 'Cannot add to bag', isError: true });
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setFeedbackMsg({ text: 'Product link copied to clipboard!', isError: false });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          customer_name: reviewName,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });
      if (res.ok) {
        setReviewStatus('Thank you! Your verified review has been submitted.');
        setReviewComment('');
        setReviewTitle('');
        setShowReviewForm(false);
      }
    } catch {
      setReviewStatus('Error submitting review. Please try again.');
    }
  };

  return (
    <div className="bg-[#FAF9F5] text-[#1A1A1A] pb-24">
      {/* 1. Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs text-[#9C8570]">
        <nav className="flex items-center space-x-2">
          <Link to="/" className="hover:text-[#1A1A1A]">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#1A1A1A]">Shop</Link>
          <span>/</span>
          <Link to={`/shop?gender=${product.gender}`} className="capitalize hover:text-[#1A1A1A]">{product.gender}</Link>
          <span>/</span>
          <span className="text-[#1A1A1A] font-medium truncate max-w-xs">{product.title}</span>
        </nav>
      </div>

      {/* 2. Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Gallery (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Large Image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F3EFEA] border border-[#E8E0D5]">
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {hasDiscount && (
                  <span className="bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1">
                    Sale -{discountPercent}%
                  </span>
                )}
                {Boolean(product.is_new_arrival) && (
                  <span className="bg-[#FAF9F5] text-[#1A1A1A] border border-[#E8E0D5] text-xs font-semibold uppercase tracking-wider px-2.5 py-1">
                    New Arrival
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.url)}
                    className={`aspect-[3/4] overflow-hidden border transition-all ${
                      activeImage === img.url
                        ? 'border-[#1A1A1A] ring-1 ring-[#1A1A1A]'
                        : 'border-[#E8E0D5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Buy Box (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-[#9C8570] uppercase tracking-widest mb-1.5">
                <span>{product.category_name || product.subcategory}</span>
                <span>SKU: {selectedVariant?.sku || product.sku}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight">
                {product.title}
              </h1>

              {/* Rating Review Summary */}
              <div className="mt-2.5 flex items-center space-x-2">
                <div className="flex items-center text-[#A8864D]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(product.rating || 5) ? 'fill-current' : 'text-[#E8E0D5]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#9C8570]">
                  ({product.review_count || (product.reviews ? product.reviews.length : 0)} reviews)
                </span>
              </div>

              {/* Price Calculation */}
              <div className="mt-4 flex items-baseline space-x-3">
                <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                  {formatPKR(price)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-[#9C8570] line-through">
                      {formatPKR(product.regular_price)}
                    </span>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5">
                      Save {formatPKR(savings)} ({discountPercent}%)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Color Swatch Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-2">
                Color: <strong className="text-[#1A1A1A]">{selectedColor}</strong>
              </label>
              <div className="flex items-center space-x-3">
                {availableColors.map((c: any) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedColor === c.name ? 'border-[#1A1A1A] scale-110 shadow-sm' : 'border-transparent'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full border border-black/20"
                      style={{ backgroundColor: c.code }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A]">
                  Select Size: <strong className="text-[#1A1A1A]">{selectedSize}</strong>
                </label>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-xs text-[#A8864D] underline hover:text-[#1A1A1A] transition-colors"
                >
                  Size Guide & Measurements
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
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
                      className={`py-2.5 text-xs font-semibold uppercase tracking-wider border transition-all ${
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

            {/* Stock Quantity Status */}
            <div>
              {selectedVariant ? (
                selectedVariant.stock_quantity > 0 ? (
                  <div className="flex items-center space-x-2 text-xs font-medium text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>
                      {selectedVariant.stock_quantity <= 5
                        ? `Only ${selectedVariant.stock_quantity} left in stock - order soon`
                        : `In Stock (${selectedVariant.stock_quantity} pieces ready to dispatch)`}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-red-600 font-semibold">
                    This size & color variant is sold out.
                  </p>
                )
              ) : (
                <p className="text-xs text-[#9C8570]">Select a size to check availability</p>
              )}
            </div>

            {/* Quantity Selector & Add to Bag / Buy Now */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-4">
                {/* Quantity */}
                <div className="flex items-center border border-[#E8E0D5] bg-white h-12">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3.5 h-full text-[#1A1A1A] hover:bg-[#F3EFEA] disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold text-[#1A1A1A]">{quantity}</span>
                  <button
                    onClick={() => {
                      if (selectedVariant && quantity < selectedVariant.stock_quantity) {
                        setQuantity(quantity + 1);
                      }
                    }}
                    disabled={!selectedVariant || quantity >= selectedVariant.stock_quantity}
                    className="px-3.5 h-full text-[#1A1A1A] hover:bg-[#F3EFEA] disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Bag CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock_quantity <= 0}
                  className="flex-1 h-12 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-[#333] disabled:opacity-40 transition-colors shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                {/* Wishlist Toggle */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`h-12 w-12 border border-[#E8E0D5] flex items-center justify-center transition-colors ${
                    inWishlist ? 'bg-[#1A1A1A] text-white' : 'hover:bg-[#F3EFEA] text-[#1A1A1A]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Buy Now (Direct Checkout) */}
              <button
                onClick={handleBuyNow}
                disabled={!selectedVariant || selectedVariant.stock_quantity <= 0}
                className="w-full h-12 bg-[#A8864D] text-white text-xs font-semibold uppercase tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-[#8C6D38] disabled:opacity-40 transition-colors shadow-sm"
              >
                <span>Buy Now with Cash on Delivery</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {feedbackMsg && (
                <p className={`text-xs ${feedbackMsg.isError ? 'text-red-600' : 'text-emerald-700'}`}>
                  {feedbackMsg.text}
                </p>
              )}
            </div>

            {/* Delivery & Assurance Strip */}
            <div className="bg-[#F3EFEA] p-4 border border-[#E8E0D5] space-y-2 text-xs text-[#6B5E51]">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-[#A8864D]" />
                <span>
                  <strong>Estimated Delivery:</strong> 2-4 Business Days across Pakistan
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#A8864D]" />
                <span>Cash on Delivery (COD) & Online Bank Transfer supported</span>
              </div>
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-[#A8864D]" />
                <span>Complimentary 14-day exchange on unworn garments</span>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-[#E8E0D5] divide-y divide-[#E8E0D5] pt-2">
              {/* Description */}
              <div>
                <button
                  onClick={() => toggleAccordion('description')}
                  className="w-full py-3.5 flex justify-between items-center text-left text-xs font-bold uppercase tracking-wider text-[#1A1A1A]"
                >
                  <span>Description & Silhouette</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordions.description ? 'rotate-180' : ''}`} />
                </button>
                {openAccordions.description && (
                  <div className="pb-4 text-xs text-[#6B5E51] leading-relaxed">
                    <p>{product.description}</p>
                  </div>
                )}
              </div>

              {/* Fabric & Material */}
              <div>
                <button
                  onClick={() => toggleAccordion('fabric')}
                  className="w-full py-3.5 flex justify-between items-center text-left text-xs font-bold uppercase tracking-wider text-[#1A1A1A]"
                >
                  <span>Fabric & Tactile Quality</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordions.fabric ? 'rotate-180' : ''}`} />
                </button>
                {openAccordions.fabric && (
                  <div className="pb-4 text-xs text-[#6B5E51] leading-relaxed space-y-1">
                    <p><strong>Composition:</strong> {product.fabric || '100% Pure Natural Fibers'}</p>
                    <p><strong>Occasion:</strong> {product.occasion || 'Versatile Luxury'}</p>
                  </div>
                )}
              </div>

              {/* Fit & Specifications */}
              <div>
                <button
                  onClick={() => toggleAccordion('fit')}
                  className="w-full py-3.5 flex justify-between items-center text-left text-xs font-bold uppercase tracking-wider text-[#1A1A1A]"
                >
                  <span>Fit & Tailoring Specifications</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordions.fit ? 'rotate-180' : ''}`} />
                </button>
                {openAccordions.fit && (
                  <div className="pb-4 text-xs text-[#6B5E51] leading-relaxed">
                    <p><strong>Fit:</strong> {product.fit || 'Contemporary Tailored Fit'}</p>
                    <p className="mt-1">Designed true to size for comfortable elegance.</p>
                  </div>
                )}
              </div>

              {/* Care Instructions */}
              <div>
                <button
                  onClick={() => toggleAccordion('care')}
                  className="w-full py-3.5 flex justify-between items-center text-left text-xs font-bold uppercase tracking-wider text-[#1A1A1A]"
                >
                  <span>Care & Maintenance</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openAccordions.care ? 'rotate-180' : ''}`} />
                </button>
                {openAccordions.care && (
                  <div className="pb-4 text-xs text-[#6B5E51] leading-relaxed">
                    <p>{product.care_instructions || 'Dry clean recommended or hand wash cold.'}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center text-xs text-[#9C8570] hover:text-[#1A1A1A] transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Share Piece</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Verified Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="border-t border-[#E8E0D5] pt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-[#E8E0D5] gap-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                Customer Reviews
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center text-[#A8864D]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-[#9C8570]">
                  {product.rating || 5.0} out of 5 based on verified client feedback
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#333] transition-colors"
            >
              {showReviewForm ? 'Cancel Review' : 'Write A Review'}
            </button>
          </div>

          {/* Review Submission Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="my-8 p-6 bg-[#F3EFEA] border border-[#E8E0D5] max-w-xl space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Submit Your Feedback</h3>
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="text-xs px-3 py-2 bg-white border border-[#E8E0D5]"
                >
                  <option value={5}>5 Stars - Flawless Craftsmanship</option>
                  <option value={4}>4 Stars - Great Quality</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Needs Improvement</option>
                  <option value={1}>1 Star - Unsatisfied</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Headline</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Exceptional fabric and quick delivery"
                  className="w-full text-xs px-3 py-2 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Review Comments</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell other clients about the fit, texture, and tailoring..."
                  className="w-full text-xs px-3 py-2 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#A8864D] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#8C6D38] transition-colors"
              >
                Submit Review
              </button>
            </form>
          )}

          {reviewStatus && (
            <p className="my-4 text-xs font-semibold text-emerald-800 bg-emerald-50 p-3 border border-emerald-200">
              {reviewStatus}
            </p>
          )}

          {/* Reviews List */}
          <div className="mt-8 space-y-6">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((r) => (
                <div key={r.id} className="pb-6 border-b border-[#E8E0D5]/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#1A1A1A]">{r.customer_name}</span>
                      {Boolean(r.is_verified_purchase) && (
                        <span className="inline-flex items-center text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                          <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#9C8570]">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center text-[#A8864D]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-[#E8E0D5]'}`}
                      />
                    ))}
                  </div>

                  {r.title && <h4 className="text-xs font-bold text-[#1A1A1A]">{r.title}</h4>}
                  <p className="text-xs text-[#4A4A4A] leading-relaxed">{r.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#9C8570]">No reviews written for this piece yet. Be the first to share your thoughts!</p>
            )}
          </div>
        </div>
      </section>

      {/* 4. Complete The Look / Related Products */}
      {product.related && product.related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="border-t border-[#E8E0D5] pt-12 mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-[#9C8570] font-medium">Complementary Styling</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-1">
              Complete The Look
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {product.related.map((rel: any) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="border-t border-[#E8E0D5] pt-12 mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-[#9C8570] font-medium">Your Browsing History</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] mt-1">
              Recently Viewed
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recentlyViewed.slice(0, 4).map((rv) => (
              <ProductCard key={rv.id} product={rv} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Add to Cart Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-[#FAF9F5]/95 backdrop-blur-md border-t border-[#E8E0D5] p-3 z-40 lg:hidden flex items-center justify-between">
        <div>
          <span className="block text-xs font-bold text-[#1A1A1A] truncate max-w-[160px]">{product.title}</span>
          <span className="text-xs font-bold text-[#A8864D]">{formatPKR(price)}</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock_quantity <= 0}
          className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider disabled:opacity-40"
        >
          Add to Bag
        </button>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        gender={product.gender}
      />
    </div>
  );
};
