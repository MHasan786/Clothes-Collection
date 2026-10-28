import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Sparkles, CheckCircle, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard.jsx';
import { QuickViewModal } from '../components/QuickViewModal.jsx';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeCollectionTab, setActiveCollectionTab] = useState('all');
  const [collectionProducts, setCollectionProducts] = useState([]);

  useEffect(() => {
    // 1. Fetch categories
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(data))
      .catch(() => {});

    // 2. Fetch new arrivals
    fetch('/api/products?newArrivals=true&limit=4')
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => setNewArrivals(data.products || []))
      .catch(() => {});

    // 3. Fetch best sellers
    fetch('/api/products?bestSellers=true&limit=4')
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => setBestSellers(data.products || []))
      .catch(() => {});

    // 4. Fetch featured products
    fetch('/api/products?featured=true&limit=8')
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => {
        setFeaturedProducts(data.products || []);
        setCollectionProducts(data.products || []);
      })
      .catch(() => {});
  }, []);

  const handleTabChange = async (tab) => {
    setActiveCollectionTab(tab);
    let url = '/api/products?limit=8';
    if (tab === 'casual') url += '&search=shirt';
    else if (tab === 'formal') url += '&subcategory=Formal+%26+Blazers';
    else if (tab === 'traditional') url += '&subcategory=Traditional+%26+Kurtas';
    else if (tab === 'modest') url += '&subcategory=Modest+%26+Abayas';

    try {
      const res = await fetch(url);
      const data = await res.json();
      setCollectionProducts(data.products && data.products.length > 0 ? data.products : featuredProducts);
    } catch {
      setCollectionProducts(featuredProducts);
    }
  };

  return (
    <div className="bg-[#FAF9F5] text-[#1A1A1A]">
      {/* 1. Hero Campaign Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
        {/* Large Editorial Fashion Campaign Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
            alt="STYLEORA Couture Campaign"
            className="w-full h-full object-cover object-center opacity-70 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white space-y-6 py-20">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-xs tracking-[0.3em] uppercase text-[#E8E0D5]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Autumn / Winter Haute Collection</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08]">
            Wear Your <span className="italic font-normal text-[#C5A880]">Confidence</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#D8CCC0] font-light leading-relaxed">
            Impeccable tailoring, pure sustainable fibers, and modern silhouettes crafted for discerning lifestyles. Delivered across Pakistan with Cash on Delivery.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/shop?gender=men"
              className="px-8 py-3.5 bg-white text-[#1A1A1A] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#E8E0D5] transition-all shadow-lg"
            >
              Shop Men
            </Link>
            <Link
              to="/shop?gender=women"
              className="px-8 py-3.5 bg-[#A8864D] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#8C6D38] transition-all shadow-lg"
            >
              Shop Women
            </Link>
            <Link
              to="/shop?gender=kids"
              className="px-8 py-3.5 bg-white/15 text-white border border-white/30 backdrop-blur-md text-xs font-semibold uppercase tracking-[0.2em] hover:bg-white/25 transition-all"
            >
              Shop Kids
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-[#9C8570] font-medium">Curated Portfolios</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-1">Explore By Department</h2>
          <div className="w-12 h-0.5 bg-[#A8864D] mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}&gender=${cat.gender}`}
              className="group relative h-96 overflow-hidden bg-[#F3EFEA] border border-[#E8E0D5]/60 flex flex-col justify-end p-6"
            >
              <img
                src={cat.image_url}
                alt={cat.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

              <div className="relative z-10 text-white space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold">
                  {cat.gender}'s Department
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-white group-hover:text-[#C5A880] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#D8CCC0] line-clamp-1 opacity-80">{cat.description}</p>
                <span className="inline-flex items-center text-xs font-medium uppercase tracking-wider text-white pt-2 group-hover:translate-x-1 transition-transform">
                  <span>Discover Pieces</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. New Arrivals Showcase */}
      <section className="bg-[#F4EFEB] py-20 border-y border-[#E8E0D5]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#9C8570] font-medium">Fresh From The Atelier</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-1">New Arrivals</h2>
            </div>
            <Link
              to="/shop?sort=newest"
              className="mt-4 sm:mt-0 inline-flex items-center text-xs font-semibold uppercase tracking-[0.15em] text-[#1A1A1A] hover:text-[#967436] transition-colors"
            >
              <span>View All New Pieces</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Promotional Editorial Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden bg-[#1A1A1A] text-white border border-[#E8E0D5]/40 grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
          <div className="lg:col-span-7 p-8 sm:p-14 flex flex-col justify-center space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#C5A880] font-semibold">
              Limited Edition Atelier Release
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
              The Silk & Cashmere Capsule
            </h2>
            <p className="text-sm text-[#D8CCC0] max-w-lg leading-relaxed">
              Explore fluid Mulberry silks, sculpted Italian wool blazers, and handcrafted raw silk kurta coordinates. Enjoy an extra 10% off with promo code <strong className="text-white underline">STYLEORA10</strong> at checkout.
            </p>
            <div className="pt-2 flex items-center space-x-4">
              <Link
                to="/shop"
                className="px-8 py-3.5 bg-white text-[#1A1A1A] text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#E8E0D5] transition-colors"
              >
                Shop The Capsule
              </Link>
              <Link
                to="/about"
                className="text-xs uppercase tracking-widest text-[#D8CCC0] hover:text-white underline transition-colors"
              >
                Learn Our Craft
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative h-64 lg:h-auto">
            <img
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80"
              alt="Haute Couture Campaign"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* 5. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#9C8570] font-medium">Acclaimed Favorites</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-1">Best Sellers</h2>
          </div>
          <Link
            to="/shop?sort=popularity"
            className="mt-4 sm:mt-0 inline-flex items-center text-xs font-semibold uppercase tracking-[0.15em] text-[#1A1A1A] hover:text-[#967436] transition-colors"
          >
            <span>View All Bestsellers</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 6. Shop by Collection Tabs */}
      <section className="bg-[#FAF9F5] py-16 border-t border-[#E8E0D5]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-[#9C8570] font-medium">Curated Aesthetics</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-1">Shop By Occasion</h2>
          </div>

          {/* Collection Tabs */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-6 border-b border-[#E8E0D5] pb-4 mb-10 overflow-x-auto text-xs uppercase tracking-wider font-semibold">
            {[
              { id: 'all', label: 'All Occasions' },
              { id: 'formal', label: 'Formal & Black Tie' },
              { id: 'traditional', label: 'Festive & Eid' },
              { id: 'modest', label: 'Modest & Abayas' },
              { id: 'casual', label: 'Elevated Casual' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-2 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeCollectionTab === tab.id
                    ? 'border-[#1A1A1A] text-[#1A1A1A]'
                    : 'border-transparent text-[#9C8570] hover:text-[#1A1A1A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {collectionProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Brand Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#F3EFEA] border border-[#E8E0D5]">
            <img
              src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=80"
              alt="STYLEORA Master Craftsman Atelier"
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#A8864D] font-semibold">
              The Architecture of Distinction
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-[#1A1A1A]">
              Where Classic Heritage Meets Modern Restraint
            </h2>
            <p className="text-sm text-[#6B5E51] leading-relaxed">
              At STYLEORA, we reject the disposable cycle of fast fashion. Born in Lahore with an atelier on MM Alam Road, every piece begins with superior organic long-staple cottons, raw hand-spun silks, and virgin Italian wools.
            </p>
            <p className="text-sm text-[#6B5E51] leading-relaxed">
              Our master cutters and hand-embroidery artisans dedicate hours to each garment, ensuring an impeccable drape that honors timeless elegance.
            </p>
            <div className="pt-2">
              <Link
                to="/about"
                className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#967436] transition-colors pb-1 border-b-2 border-[#1A1A1A]"
              >
                <span>Read Our Full Story</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Verified Customer Testimonials */}
      <section className="bg-[#F3EFEA] py-20 border-y border-[#E8E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs uppercase tracking-[0.25em] text-[#9C8570] font-medium">Patron Impressions</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-1">Verified Client Reviews</h2>
            <div className="w-12 h-0.5 bg-[#A8864D] mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Dr. Shahzad Mir',
                city: 'Islamabad',
                role: 'Verified Buyer',
                item: 'Signature Egyptian Cotton Oxford Shirt',
                review: 'The Egyptian cotton collar holds its shape remarkably well under a suit jacket or worn casually unbuttoned. Exactly the caliber of tailoring I expect from bespoke fashion houses. Fast delivery to Islamabad.',
                rating: 5,
              },
              {
                name: 'Amina Tariq',
                city: 'Lahore',
                role: 'Verified Buyer',
                item: 'Mulberry Silk Column Evening Dress',
                review: 'Ordered the Champagne Gold for an anniversary gala in DHA Lahore. The bias cut falls so naturally and the 22-momme weight feels rich and opaque. Seamless Cash on Delivery service!',
                rating: 5,
              },
              {
                name: 'Fatima Z.',
                city: 'Karachi',
                role: 'Verified Buyer',
                item: 'Chanderi Silk Hand-Embroidered Kurti',
                review: 'The delicate zardozi work looks even more sophisticated in person than in the photos. Paired it with pearl earrings and received endless compliments at our family Eid dinner.',
                rating: 5,
              },
            ].map((t, idx) => (
              <div key={idx} className="bg-white p-8 border border-[#E8E0D5] flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center space-x-1 text-[#A8864D] mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#4A4A4A] italic leading-relaxed mb-6">
                    "{t.review}"
                  </p>
                </div>
                <div className="border-t border-[#E8E0D5]/60 pt-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A1A]">{t.name}</h4>
                    <p className="text-[10px] text-[#9C8570]">{t.city} • {t.item}</p>
                  </div>
                  <span className="inline-flex items-center text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                    <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Curated Instagram & Lookbook Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-[#9C8570] font-medium">#StyleoraAtelier</p>
          <h2 className="font-serif text-3xl font-bold text-[#1A1A1A] mt-1">Seen Around The World</h2>
          <p className="text-xs text-[#9C8570] mt-1">Tag @StyleoraOfficial on Instagram to be featured in our seasonal gallery</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=700&q=80',
            'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=700&q=80',
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80',
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80',
          ].map((img, i) => (
            <div key={i} className="relative aspect-square overflow-hidden bg-[#F3EFEA] border border-[#E8E0D5]/50 group">
              <img
                src={img}
                alt="Instagram lookbook"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-xs uppercase tracking-widest text-white font-semibold border-b border-white pb-0.5">
                  Shop Look
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
