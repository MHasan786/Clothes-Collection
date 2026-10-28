import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { validateEmail } from '../utils/validation.js';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setStatus({ message: 'Please enter a valid email address', isError: true });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ message: data.message, isError: false });
        setEmail('');
      } else {
        setStatus({ message: data.error || 'Failed to subscribe', isError: true });
      }
    } catch {
      setStatus({ message: 'Network error. Please try again.', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#141414] text-[#FAF9F5] border-t border-[#2A2A2A] transition-colors">
      {/* 1. Value Proposition Pillars */}
      <div className="border-b border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
              <Truck className="w-6 h-6 text-[#A8864D] flex-shrink-0" />
              <div>
                <h4 className="font-serif text-sm font-semibold tracking-wide text-white">Express Delivery</h4>
                <p className="text-xs text-[#9C8570] mt-0.5">Complimentary across Pakistan on orders over PKR 5,000.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
              <ShieldCheck className="w-6 h-6 text-[#A8864D] flex-shrink-0" />
              <div>
                <h4 className="font-serif text-sm font-semibold tracking-wide text-white">Cash on Delivery</h4>
                <p className="text-xs text-[#9C8570] mt-0.5">Pay in cash upon doorstep delivery anywhere in Pakistan.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
              <RefreshCw className="w-6 h-6 text-[#A8864D] flex-shrink-0" />
              <div>
                <h4 className="font-serif text-sm font-semibold tracking-wide text-white">14-Day Exchanges</h4>
                <p className="text-xs text-[#9C8570] mt-0.5">Hassle-free size replacement and return guarantee.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
              <Award className="w-6 h-6 text-[#A8864D] flex-shrink-0" />
              <div>
                <h4 className="font-serif text-sm font-semibold tracking-wide text-white">Artisanal Craft</h4>
                <p className="text-xs text-[#9C8570] mt-0.5">Ethically sourced fibers and master craftsmanship.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Intro & Atelier Address */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-[0.2em] uppercase text-white">
                STYLEORA
              </span>
              <span className="block text-[9px] tracking-[0.3em] text-[#A8864D] uppercase font-sans">
                Atelier Lahore • Est. 2024
              </span>
            </Link>
            <p className="text-xs text-[#A89E92] leading-relaxed max-w-sm">
              STYLEORA is an independent fashion atelier bridging classical heritage tailoring with contemporary minimal restraint. Handcrafted luxury garments designed for lasting distinction.
            </p>
            <div className="space-y-2 text-xs text-[#A89E92] pt-2">
              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-[#A8864D] flex-shrink-0" />
                42-C Gulberg III, MM Alam Road, Lahore, Pakistan
              </p>
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-[#A8864D] flex-shrink-0" />
                +92 42 3578 9100 / WhatsApp: +92 300 1122334
              </p>
              <p className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-[#A8864D] flex-shrink-0" />
                concierge@styleora.com
              </p>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A89E92]">
              <li><Link to="/shop?gender=men" className="hover:text-white transition-colors">Men's Wardrobe</Link></li>
              <li><Link to="/shop?gender=women" className="hover:text-white transition-colors">Women's Couture</Link></li>
              <li><Link to="/shop?gender=kids" className="hover:text-white transition-colors">Kids' Festive Edit</Link></li>
              <li><Link to="/shop?subcategory=Traditional+%26+Kurtas" className="hover:text-white transition-colors">Festive & Kurtas</Link></li>
              <li><Link to="/shop?subcategory=Modest+%26+Abayas" className="hover:text-white transition-colors">Modest Fashion</Link></li>
              <li><Link to="/shop?sort=newest" className="hover:text-white transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Customer Concierge
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A89E92]">
              <li><Link to="/track-order" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping & Delivery Rates</Link></li>
              <li><Link to="/return-policy" className="hover:text-white transition-colors">Returns & Exchanges (14 Days)</Link></li>
              <li><Link to="/size-guide" className="hover:text-white transition-colors">Size Charts & Fit Guide</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Concierge</Link></li>
            </ul>
          </div>

          {/* Gazette Newsletter */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-white">
              The Atelier Gazette
            </h4>
            <p className="text-xs text-[#A89E92] leading-relaxed">
              Subscribe to receive exclusive invitations, seasonal trunk shows, and 10% off your first order.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-[#1F1F1F] border border-[#333] text-white placeholder-[#777] focus:outline-hidden focus:border-[#A8864D]"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-1 top-1 bottom-1 px-3 bg-[#A8864D] hover:bg-[#8C6D38] text-white flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {status && (
                <p className={`text-[11px] ${status.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                  {status.message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar & Payment Methods */}
      <div className="border-t border-[#222] bg-[#0E0E0E] py-6 text-xs text-[#7A7267]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-center sm:text-left">
            <span>© {new Date().getFullYear()} STYLEORA Fashion Atelier Ltd. All rights reserved.</span>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>

          {/* Payment Badges */}
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="px-2 py-1 bg-[#1F1F1F] text-[#CCC] border border-[#333] rounded text-[10px] font-semibold">
              Cash on Delivery (COD)
            </span>
            <span className="px-2 py-1 bg-[#1F1F1F] text-[#CCC] border border-[#333] rounded text-[10px] font-semibold">
              Bank IBFT
            </span>
            <span className="px-2 py-1 bg-[#1F1F1F] text-[#CCC] border border-[#333] rounded text-[10px] font-semibold">
              Visa / Mastercard
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
