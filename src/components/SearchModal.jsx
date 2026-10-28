import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { formatPKR } from '../utils/pricing.js';

export const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&limit=8`);
        const data = await res.json();
        setResults(data.products || []);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectProduct = (slug) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const handleViewAllResults = () => {
    onClose();
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="min-h-screen px-4 text-center flex items-start justify-center pt-20">
        <div className="inline-block w-full max-w-2xl bg-[#FAF9F5] border border-[#E8E0D5] p-6 text-left shadow-2xl relative z-10 transition-all">
          <div className="flex items-center justify-between border-b border-[#E8E0D5] pb-4">
            <div className="flex items-center flex-1">
              <Search className="w-5 h-5 text-[#9C8570] mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by apparel title, fabric (e.g. Silk, Cotton), or SKU..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    handleViewAllResults();
                  }
                }}
                className="w-full bg-transparent text-base sm:text-lg text-[#1A1A1A] placeholder-[#9C8570] focus:outline-hidden"
              />
            </div>
            {isLoading && <Loader2 className="w-5 h-5 text-[#A8864D] animate-spin ml-2" />}
            <button
              onClick={onClose}
              className="p-1 text-[#9C8570] hover:text-[#1A1A1A] ml-2 transition-colors cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick tags */}
          {!query && (
            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-wider text-[#9C8570] font-medium mb-2">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {['Egyptian Cotton', 'Wool Blazer', 'Festive Kurta', 'Mulberry Silk', 'Power Suit', 'Modest Abaya'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-xs px-3 py-1 bg-[#F3EFEA] hover:bg-[#E8E0D5] text-[#1A1A1A] transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results list */}
          {results.length > 0 && (
            <div className="mt-4 divide-y divide-[#E8E0D5]/60 max-h-96 overflow-y-auto">
              {results.map((product) => {
                const price = product.sale_price || product.regular_price;
                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.slug)}
                    className="py-3 px-2 flex items-center justify-between hover:bg-[#F3EFEA] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.primary_image}
                        alt={product.title}
                        className="w-12 h-16 object-cover bg-[#F3EFEA] border border-[#E8E0D5]/50 flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs uppercase tracking-wider text-[#9C8570] font-medium">
                          {product.category_name || product.subcategory}
                        </p>
                        <h4 className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#967436] transition-colors line-clamp-1">
                          {product.title}
                        </h4>
                        <p className="text-xs font-semibold text-[#1A1A1A] mt-0.5">
                          {formatPKR(price)}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9C8570] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })}
            </div>
          )}

          {query.trim() && !isLoading && results.length === 0 && (
            <div className="py-8 text-center text-[#9C8570] text-sm">
              No pieces found matching "{query}". Try checking the spelling or searching by category.
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#E8E0D5] text-center">
              <button
                onClick={handleViewAllResults}
                className="text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] hover:text-[#967436] transition-colors cursor-pointer"
              >
                View all results in Shop ({results.length}+ items) →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
