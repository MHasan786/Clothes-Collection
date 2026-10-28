import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import type { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { formatPKR } from '../utils/pricing';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filters from query params
  const gender = searchParams.get('gender') || 'all';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const size = searchParams.get('size') || '';
  const color = searchParams.get('color') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Local state for price inputs
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams);
    if (!params.has('limit')) params.set('limit', '12');

    fetch(`/api/products?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { products: [], total: 0, totalPages: 1 }))
      .then((data) => {
        setProducts(data.products || []);
        setTotalCount(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [searchParams]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(next);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localMin) next.set('minPrice', localMin);
    else next.delete('minPrice');
    if (localMax) next.set('maxPrice', localMax);
    else next.delete('maxPrice');
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setLocalMin('');
    setLocalMax('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    (gender && gender !== 'all') || category || subcategory || search || minPrice || maxPrice || size || color
  );

  return (
    <div className="bg-[#FAF9F5] min-h-screen pb-20">
      {/* 1. Shop Page Header Banner */}
      <div className="bg-[#F3EFEA] border-b border-[#E8E0D5] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9C8570] font-medium">
            {gender !== 'all' ? `${gender}'s Department` : 'Curated Ready-to-Wear'}
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A]">
            {subcategory || category ? (subcategory || category).replace(/-/g, ' ') : 'All Collections'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5E51] max-w-lg mx-auto">
            Explore {totalCount} luxury handcrafted garments tailored for effortless distinction.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* 2. Top Controls & Active Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E0D5] gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center px-4 py-2 border border-[#E8E0D5] text-xs font-semibold uppercase tracking-wider bg-white text-[#1A1A1A]"
            >
              <Filter className="w-3.5 h-3.5 mr-2" />
              <span>Filter ({hasActiveFilters ? 'Active' : 'All'})</span>
            </button>

            <span className="text-xs text-[#9C8570]">
              Showing <strong className="text-[#1A1A1A]">{products.length}</strong> of{' '}
              <strong className="text-[#1A1A1A]">{totalCount}</strong> pieces
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#9C8570] uppercase tracking-wider hidden sm:inline">Sort By:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="text-xs bg-white border border-[#E8E0D5] px-3 py-2 text-[#1A1A1A] focus:outline-hidden focus:border-[#1A1A1A] tracking-wide"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popularity">Most Popular & Best Selling</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Active Filter Pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 py-4 border-b border-[#E8E0D5]/70">
            <span className="text-[11px] text-[#9C8570] font-medium mr-1">Active Filters:</span>
            {gender && gender !== 'all' && (
              <span className="inline-flex items-center px-2.5 py-1 bg-[#F3EFEA] border border-[#E8E0D5] text-xs text-[#1A1A1A]">
                Gender: {gender}
                <button onClick={() => updateParam('gender', null)} className="ml-1.5 text-[#9C8570] hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center px-2.5 py-1 bg-[#F3EFEA] border border-[#E8E0D5] text-xs text-[#1A1A1A]">
                Category: {category}
                <button onClick={() => updateParam('category', null)} className="ml-1.5 text-[#9C8570] hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {subcategory && (
              <span className="inline-flex items-center px-2.5 py-1 bg-[#F3EFEA] border border-[#E8E0D5] text-xs text-[#1A1A1A]">
                Subcategory: {subcategory}
                <button onClick={() => updateParam('subcategory', null)} className="ml-1.5 text-[#9C8570] hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {size && (
              <span className="inline-flex items-center px-2.5 py-1 bg-[#F3EFEA] border border-[#E8E0D5] text-xs text-[#1A1A1A]">
                Size: {size}
                <button onClick={() => updateParam('size', null)} className="ml-1.5 text-[#9C8570] hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {color && (
              <span className="inline-flex items-center px-2.5 py-1 bg-[#F3EFEA] border border-[#E8E0D5] text-xs text-[#1A1A1A]">
                Color: {color}
                <button onClick={() => updateParam('color', null)} className="ml-1.5 text-[#9C8570] hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center px-2.5 py-1 bg-[#F3EFEA] border border-[#E8E0D5] text-xs text-[#1A1A1A]">
                Price: {minPrice ? formatPKR(Number(minPrice)) : 'PKR 0'} - {maxPrice ? formatPKR(Number(maxPrice)) : 'Any'}
                <button
                  onClick={() => {
                    setLocalMin('');
                    setLocalMax('');
                    updateParam('minPrice', null);
                    updateParam('maxPrice', null);
                  }}
                  className="ml-1.5 text-[#9C8570] hover:text-black"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center px-2.5 py-1 bg-[#F3EFEA] border border-[#E8E0D5] text-xs text-[#1A1A1A]">
                Query: "{search}"
                <button onClick={() => updateParam('search', null)} className="ml-1.5 text-[#9C8570] hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#A8864D] hover:underline ml-2 font-medium"
            >
              Clear All
            </button>
          </div>
        )}

        {/* 3. Main Content: Left Filter Sidebar + Right Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden lg:block space-y-8 pr-6 border-r border-[#E8E0D5]/70">
            {/* Gender Department */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-3">
                Department
              </h3>
              <div className="space-y-2 text-xs">
                {['all', 'men', 'women', 'kids'].map((g) => (
                  <button
                    key={g}
                    onClick={() => updateParam('gender', g)}
                    className={`block w-full text-left py-1 capitalize transition-colors ${
                      gender === g ? 'font-bold text-[#A8864D]' : 'text-[#6B5E51] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {g === 'all' ? 'All Departments' : `${g}'s Clothing`}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-3">
                Categories
              </h3>
              <div className="space-y-2 text-xs max-h-56 overflow-y-auto">
                <button
                  onClick={() => updateParam('category', null)}
                  className={`block w-full text-left py-1 transition-colors ${
                    !category ? 'font-bold text-[#A8864D]' : 'text-[#6B5E51] hover:text-[#1A1A1A]'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParam('category', cat.slug)}
                    className={`block w-full text-left py-1 transition-colors ${
                      category === cat.slug ? 'font-bold text-[#A8864D]' : 'text-[#6B5E51] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-3">
                Sizes
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateParam('size', size === s ? null : s)}
                    className={`py-1.5 text-xs font-medium border text-center transition-all ${
                      size === s
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'bg-white text-[#1A1A1A] border-[#E8E0D5] hover:border-[#1A1A1A]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-3">
                Color Palette
              </h3>
              <div className="space-y-1.5 text-xs">
                {[
                  { name: 'Black', code: '#1A1A1A' },
                  { name: 'Cream', code: '#FAF8F5' },
                  { name: 'Navy', code: '#152238' },
                  { name: 'Camel', code: '#C19A6B' },
                  { name: 'Rose', code: '#DCAE96' },
                  { name: 'Gold', code: '#F7E7CE' },
                ].map((c) => (
                  <button
                    key={c.name}
                    onClick={() => updateParam('color', color === c.name ? null : c.name)}
                    className={`flex items-center w-full py-1 text-left transition-colors ${
                      color === c.name ? 'font-bold text-[#A8864D]' : 'text-[#6B5E51] hover:text-[#1A1A1A]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full mr-2 border border-black/20"
                      style={{ backgroundColor: c.code }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-3">
                Price (PKR)
              </h3>
              <form onSubmit={handlePriceApply} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localMin}
                    onChange={(e) => setLocalMin(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                  <span className="text-xs text-[#9C8570]">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localMax}
                    onChange={(e) => setLocalMax(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#333] transition-colors"
                >
                  Apply Range
                </button>
              </form>
            </div>
          </aside>

          {/* Right Product Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center text-[#9C8570]">
                <Loader2 className="w-8 h-8 animate-spin text-[#A8864D] mb-3" />
                <p className="text-xs uppercase tracking-widest">Loading Atelier Collection...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center space-y-4 bg-white border border-[#E8E0D5] p-8">
                <h3 className="font-serif text-2xl font-medium text-[#1A1A1A]">No Pieces Found</h3>
                <p className="text-xs text-[#6B5E51] max-w-sm mx-auto">
                  We could not find any garments matching your current filter criteria. Try adjusting or clearing your filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#333] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center space-x-2 pt-6 border-t border-[#E8E0D5]">
                    <button
                      onClick={() => updateParam('page', String(page - 1))}
                      disabled={page <= 1}
                      className="p-2 border border-[#E8E0D5] bg-white text-[#1A1A1A] disabled:opacity-30 hover:bg-[#F3EFEA] transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                      const pNum = i + 1;
                      return (
                        <button
                          key={pNum}
                          onClick={() => updateParam('page', String(pNum))}
                          className={`w-9 h-9 text-xs font-semibold border transition-all ${
                            page === pNum
                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                              : 'bg-white text-[#1A1A1A] border-[#E8E0D5] hover:bg-[#F3EFEA]'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => updateParam('page', String(page + 1))}
                      disabled={page >= totalPages}
                      className="p-2 border border-[#E8E0D5] bg-white text-[#1A1A1A] disabled:opacity-30 hover:bg-[#F3EFEA] transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-[#FAF9F5] p-6 flex flex-col justify-between shadow-2xl">
              <div className="space-y-6 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#E8E0D5] pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Filters</h3>
                  <button onClick={() => setIsMobileFilterOpen(false)}>
                    <X className="w-5 h-5 text-[#9C8570]" />
                  </button>
                </div>

                {/* Mobile Department */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">Department</h4>
                  <div className="space-y-1 text-xs">
                    {['all', 'men', 'women', 'kids'].map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          updateParam('gender', g);
                          setIsMobileFilterOpen(false);
                        }}
                        className={`block w-full text-left py-1 capitalize ${
                          gender === g ? 'font-bold text-[#A8864D]' : 'text-[#6B5E51]'
                        }`}
                      >
                        {g === 'all' ? 'All' : `${g}'s Clothing`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Categories */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-2">Categories</h4>
                  <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
                    <button
                      onClick={() => {
                        updateParam('category', null);
                        setIsMobileFilterOpen(false);
                      }}
                      className="block w-full text-left py-1"
                    >
                      All Categories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          updateParam('category', c.slug);
                          setIsMobileFilterOpen(false);
                        }}
                        className={`block w-full text-left py-1 ${category === c.slug ? 'font-bold text-[#A8864D]' : ''}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E0D5]">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider"
                >
                  View Results ({totalCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
