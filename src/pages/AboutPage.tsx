import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Compass, Heart, ShieldCheck, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#FAF9F5] text-[#1A1A1A] pb-24">
      {/* Hero */}
      <div className="relative py-24 bg-[#141414] text-white overflow-hidden text-center">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=2000&q=80"
            alt="Atelier Craft"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C5A880] font-semibold">Our Heritage</p>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight">The Story of STYLEORA</h1>
          <p className="text-sm text-[#D8CCC0] max-w-xl mx-auto leading-relaxed">
            Bridging Pakistan's rich textile legacy with international haute couture minimalism.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-16">
        {/* Story Block 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#A8864D] font-bold">The Genesis</span>
            <h2 className="font-serif text-3xl font-bold">Artisanal Purity in a Disposable World</h2>
            <p className="text-xs sm:text-sm text-[#6B5E51] leading-relaxed">
              Founded in Lahore in 2024, STYLEORA emerged from a fundamental disagreement with the speed and carelessness of modern fast fashion. We believe that true luxury lies in touch, proportion, and quiet longevity.
            </p>
            <p className="text-xs sm:text-sm text-[#6B5E51] leading-relaxed">
              Our flagship atelier on MM Alam Road, Gulberg III, houses master pattern cutters and embroiderers who have dedicated generations to mastering pure silk weaves, long-staple Egyptian cottons, and architectural wool tailoring.
            </p>
          </div>
          <div className="aspect-[4/3] bg-[#F3EFEA] border border-[#E8E0D5] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80"
              alt="Tailoring atelier"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Pillars */}
        <div className="border-t border-[#E8E0D5] pt-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-[#9C8570] font-medium">Core Commitments</span>
            <h2 className="font-serif text-3xl font-bold mt-1">The Pillars of STYLEORA</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 border border-[#E8E0D5] space-y-3">
              <Award className="w-6 h-6 text-[#A8864D]" />
              <h3 className="font-serif text-lg font-bold">Uncompromising Fibers</h3>
              <p className="text-xs text-[#6B5E51] leading-relaxed">
                We only cut from natural, ethically sourced fibers: Grade 6A Mulberry silk, genuine Egyptian cotton, unwashed selvedge denim, and super-fine virgin wools.
              </p>
            </div>

            <div className="bg-white p-6 border border-[#E8E0D5] space-y-3">
              <Heart className="w-6 h-6 text-[#A8864D]" />
              <h3 className="font-serif text-lg font-bold">Dignified Craftsmanship</h3>
              <p className="text-xs text-[#6B5E51] leading-relaxed">
                Every artisan in our atelier receives fair living wages, healthcare, and safe working conditions. We honor the hands that shape our garments.
              </p>
            </div>

            <div className="bg-white p-6 border border-[#E8E0D5] space-y-3">
              <ShieldCheck className="w-6 h-6 text-[#A8864D]" />
              <h3 className="font-serif text-lg font-bold">Doorstep Trust</h3>
              <p className="text-xs text-[#6B5E51] leading-relaxed">
                With reliable Cash on Delivery and a 14-day exchange guarantee across Pakistan, we believe client peace of mind is sacred.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#1A1A1A] text-white p-10 text-center space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">Experience The Collection</h2>
          <p className="text-xs text-[#D8CCC0] max-w-md mx-auto">
            Discover tailored blazers, silk gowns, and festive traditional wear delivered directly to your doorstep.
          </p>
          <Link
            to="/shop"
            className="inline-block px-8 py-3 bg-[#A8864D] hover:bg-[#8C6D38] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-colors"
          >
            Explore All Pieces
          </Link>
        </div>
      </div>
    </div>
  );
};
