import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  LogOut,
  Package,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { user, isAdmin, logout, wishlist } = useAuth();
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const [announcementText, setAnnouncementText] = useState(
    'Complimentary Express Delivery on orders over PKR 5,000 | Code: STYLEORA10 for 10% off'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : ({} as Record<string, any>)))
      .then((data: Record<string, any>) => {
        if (data.announcement_bar_text) {
          setAnnouncementText(data.announcement_bar_text);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#E8E0D5]/70 transition-all">
      {/* 1. Announcement Bar */}
      {isAnnouncementVisible && (
        <div className="bg-[#1A1A1A] text-[#FAF9F5] text-xs py-2 px-4 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex-1 text-center font-medium tracking-wide">
              <span>{announcementText}</span>
            </div>
            <button
              onClick={() => setIsAnnouncementVisible(false)}
              className="text-[#D8CCC0] hover:text-white p-1 ml-2 transition-colors"
              aria-label="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#1A1A1A] hover:text-[#967436] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Left Nav Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-medium tracking-widest uppercase">
            <Link to="/shop" className="text-[#1A1A1A] hover:text-[#967436] transition-colors py-2">
              Shop All
            </Link>

            {/* Men Mega Dropdown */}
            <div className="group relative py-2">
              <Link to="/shop?gender=men" className="inline-flex items-center text-[#1A1A1A] hover:text-[#967436] transition-colors">
                <span>Men</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
              </Link>
              <div className="absolute top-full left-0 w-64 bg-[#FAF9F5] border border-[#E8E0D5] shadow-xl py-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                <div className="px-4 pb-2 border-b border-[#E8E0D5]/50 text-[10px] tracking-wider text-[#9C8570]">
                  MEN'S ATELIER
                </div>
                <div className="pt-2 flex flex-col space-y-2 text-xs normal-case tracking-normal">
                  <Link to="/shop?gender=men&subcategory=Shirts" className="px-4 py-1.5 hover:bg-[#F3EFEA] hover:text-[#967436] transition-colors">
                    Shirts & Dress Shirts
                  </Link>
                  <Link to="/shop?gender=men&subcategory=T-Shirts+%26+Polos" className="px-4 py-1.5 hover:bg-[#F3EFEA] hover:text-[#967436] transition-colors">
                    T-Shirts & Polos
                  </Link>
                  <Link to="/shop?gender=men&subcategory=Formal+%26+Blazers" className="px-4 py-1.5 hover:bg-[#F3EFEA] hover:text-[#967436] transition-colors">
                    Formal Suits & Blazers
                  </Link>
                  <Link to="/shop?gender=men&subcategory=Traditional+%26+Kurtas" className="px-4 py-1.5 hover:bg-[#F3EFEA] hover:text-[#967436] transition-colors">
                    Traditional & Kurtas
                  </Link>
                  <Link to="/shop?gender=men&subcategory=Jeans+%26+Trousers" className="px-4 py-1.5 hover:bg-[#F3EFEA] hover:text-[#967436] transition-colors">
                    Jeans & Chinos
                  </Link>
                </div>
              </div>
            </div>

            {/* Women Mega Dropdown */}
            <div className="group relative py-2">
              <Link to="/shop?gender=women" className="inline-flex items-center text-[#1A1A1A] hover:text-[#967436] transition-colors">
                <span>Women</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
              </Link>
              <div className="absolute top-full left-0 w-64 bg-[#FAF9F5] border border-[#E8E0D5] shadow-xl py-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                <div className="px-4 pb-2 border-b border-[#E8E0D5]/50 text-[10px] tracking-wider text-[#9C8570]">
                  WOMEN'S COUTURE
                </div>
                <div className="pt-2 flex flex-col space-y-2 text-xs normal-case tracking-normal">
                  <Link to="/shop?gender=women&subcategory=Dresses" className="px-4 py-1.5 hover:bg-[#F3EFEA] hover:text-[#967436] transition-colors">
                    Evening Gowns & Dresses
                  </Link>
                  <Link to="/shop?gender=women&subcategory=Festive+%26+Traditional" className="px-4 py-1.5 hover:bg-[#F3EFEA] hover:text-[#967436] transition-colors">
                    Festive 2-Piece & 3-Piece Suits
                  </Link>
                  <Link to="/shop?gender=women&subcategory=Modest+%26+Abayas" className="px-4 py-1.5 hover:bg-[#F3EFEA] hover:text-[#967436] transition-colors">
                    Modest Fashion & Abayas
                  </Link>
                  <Link to="/shop?gender=women&subcategory=Tops+%26+Shirts" className="px-4 py-1.5 hover:bg-[#F3EFEA] hover:text-[#967436] transition-colors">
                    Cashmere Knits & Silk Tops
                  </Link>
                </div>
              </div>
            </div>

            {/* Kids Mega Dropdown */}
            <div className="group relative py-2">
              <Link to="/shop?gender=kids" className="inline-flex items-center text-[#1A1A1A] hover:text-[#967436] transition-colors">
                <span>Kids</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
              </Link>
              <div className="absolute top-full left-0 w-60 bg-[#FAF9F5] border border-[#E8E0D5] shadow-xl py-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                <div className="px-4 pb-2 border-b border-[#E8E0D5]/50 text-[10px] tracking-wider text-[#9C8570]">
                  KIDS' COLLECTION
                </div>
                <div className="pt-2 flex flex-col space-y-2 text-xs normal-case tracking-normal">
                  <Link to="/shop?gender=kids&subcategory=Traditional+Clothing" className="px-4 py-1.5 hover:bg-[#F3EFEA] hover:text-[#967436] transition-colors">
                    Boys' Festive Kurta Sets
                  </Link>
                  <Link to="/shop?gender=kids&subcategory=Dresses" className="px-4 py-1.5 hover:bg-[#F3EFEA] hover:text-[#967436] transition-colors">
                    Girls' Festive Dresses
                  </Link>
                  <Link to="/shop?gender=kids" className="px-4 py-1.5 hover:bg-[#F3EFEA] hover:text-[#967436] transition-colors">
                    Organic Everyday Separates
                  </Link>
                </div>
              </div>
            </div>

            <Link to="/shop?sort=newest" className="text-[#1A1A1A] hover:text-[#967436] transition-colors py-2">
              New Arrivals
            </Link>
            <Link to="/shop?sort=popularity" className="text-[#1A1A1A] hover:text-[#967436] transition-colors py-2">
              Best Sellers
            </Link>
          </nav>

          {/* Center Brand Logo */}
          <div className="flex-1 lg:flex-none text-center">
            <Link to="/" className="inline-block group">
              <span className="font-serif text-2xl sm:text-3xl lg:text-4xl tracking-[0.2em] uppercase font-bold text-[#1A1A1A] transition-colors group-hover:text-[#967436]">
                STYLEORA
              </span>
              <span className="block text-[9px] tracking-[0.35em] text-[#9C8570] uppercase font-sans -mt-1">
                Atelier Lahore
              </span>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#1A1A1A] hover:text-[#967436] transition-colors"
              aria-label="Search catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="p-2 text-[#1A1A1A] hover:text-[#967436] transition-colors relative"
                aria-label="Customer account menu"
              >
                <UserIcon className="w-5 h-5" />
                {isAdmin && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B38F4D]" />
                )}
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#FAF9F5] border border-[#E8E0D5] shadow-2xl py-3 z-50 text-xs">
                  {user ? (
                    <div>
                      <div className="px-4 py-2 border-b border-[#E8E0D5]/70">
                        <p className="font-semibold text-sm text-[#1A1A1A]">{user.name}</p>
                        <p className="text-[#9C8570] text-[11px] truncate">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <div className="px-2 py-2 border-b border-[#E8E0D5]/50 bg-[#F4EFEB]">
                          <Link
                            to="/admin"
                            className="flex items-center px-3 py-1.5 font-medium text-[#8C6D38] hover:bg-[#E8E0D5]/60 rounded transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </div>
                      )}

                      <div className="py-1">
                        <Link
                          to="/account"
                          className="flex items-center px-4 py-2 hover:bg-[#F3EFEA] text-[#1A1A1A] transition-colors"
                        >
                          <Package className="w-4 h-4 mr-2 text-[#9C8570]" />
                          My Orders & Profile
                        </Link>
                        <Link
                          to="/track-order"
                          className="flex items-center px-4 py-2 hover:bg-[#F3EFEA] text-[#1A1A1A] transition-colors"
                        >
                          <Search className="w-4 h-4 mr-2 text-[#9C8570]" />
                          Track My Order
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsAccountMenuOpen(false);
                            navigate('/');
                          }}
                          className="w-full text-left flex items-center px-4 py-2 hover:bg-[#F3EFEA] text-red-600 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-2 space-y-3">
                      <p className="text-xs text-[#6B5E51]">
                        Sign in for order tracking, saved addresses & luxury member perks.
                      </p>
                      <Link
                        to="/account"
                        className="block w-full py-2 px-3 text-center bg-[#1A1A1A] text-white font-medium tracking-wide uppercase text-[11px] hover:bg-[#333] transition-colors"
                      >
                        Sign In / Register
                      </Link>
                      <div className="border-t border-[#E8E0D5]/50 pt-2">
                        <Link
                          to="/track-order"
                          className="block text-center text-[11px] text-[#9C8570] hover:text-[#1A1A1A]"
                        >
                          Track an existing order
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Link */}
            <Link
              to="/account?tab=wishlist"
              className="p-2 text-[#1A1A1A] hover:text-[#967436] transition-colors relative hidden sm:block"
              aria-label="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#B38F4D] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#1A1A1A] hover:text-[#967436] transition-colors relative"
              aria-label="Open shopping bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#1A1A1A] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-[#FAF9F5] z-50 overflow-y-auto px-6 py-6 border-t border-[#E8E0D5]">
          <nav className="flex flex-col space-y-4 text-sm uppercase tracking-wider font-medium">
            <Link to="/shop" className="py-2 border-b border-[#E8E0D5]/50 text-[#1A1A1A]">
              Shop All Collections
            </Link>

            {/* Men Submenu */}
            <div>
              <button
                onClick={() => setMobileSubmenu(mobileSubmenu === 'men' ? null : 'men')}
                className="w-full flex justify-between items-center py-2 border-b border-[#E8E0D5]/50 text-[#1A1A1A]"
              >
                <span>Men's Atelier</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileSubmenu === 'men' ? 'rotate-180' : ''}`} />
              </button>
              {mobileSubmenu === 'men' && (
                <div className="pl-4 py-2 space-y-2 text-xs normal-case text-[#6B5E51]">
                  <Link to="/shop?gender=men" className="block py-1">All Men's</Link>
                  <Link to="/shop?gender=men&subcategory=Shirts" className="block py-1">Shirts & Dress Shirts</Link>
                  <Link to="/shop?gender=men&subcategory=Formal+%26+Blazers" className="block py-1">Suits & Blazers</Link>
                  <Link to="/shop?gender=men&subcategory=Traditional+%26+Kurtas" className="block py-1">Traditional & Kurtas</Link>
                  <Link to="/shop?gender=men&subcategory=Jeans+%26+Trousers" className="block py-1">Jeans & Chinos</Link>
                </div>
              )}
            </div>

            {/* Women Submenu */}
            <div>
              <button
                onClick={() => setMobileSubmenu(mobileSubmenu === 'women' ? null : 'women')}
                className="w-full flex justify-between items-center py-2 border-b border-[#E8E0D5]/50 text-[#1A1A1A]"
              >
                <span>Women's Couture</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileSubmenu === 'women' ? 'rotate-180' : ''}`} />
              </button>
              {mobileSubmenu === 'women' && (
                <div className="pl-4 py-2 space-y-2 text-xs normal-case text-[#6B5E51]">
                  <Link to="/shop?gender=women" className="block py-1">All Women's</Link>
                  <Link to="/shop?gender=women&subcategory=Dresses" className="block py-1">Evening Gowns & Dresses</Link>
                  <Link to="/shop?gender=women&subcategory=Festive+%26+Traditional" className="block py-1">Festive Suits (2 & 3 Piece)</Link>
                  <Link to="/shop?gender=women&subcategory=Modest+%26+Abayas" className="block py-1">Modest Fashion & Abayas</Link>
                  <Link to="/shop?gender=women&subcategory=Tops+%26+Shirts" className="block py-1">Cashmere Knits & Silk Tops</Link>
                </div>
              )}
            </div>

            {/* Kids Submenu */}
            <div>
              <button
                onClick={() => setMobileSubmenu(mobileSubmenu === 'kids' ? null : 'kids')}
                className="w-full flex justify-between items-center py-2 border-b border-[#E8E0D5]/50 text-[#1A1A1A]"
              >
                <span>Kids' Wear</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileSubmenu === 'kids' ? 'rotate-180' : ''}`} />
              </button>
              {mobileSubmenu === 'kids' && (
                <div className="pl-4 py-2 space-y-2 text-xs normal-case text-[#6B5E51]">
                  <Link to="/shop?gender=kids" className="block py-1">All Kids</Link>
                  <Link to="/shop?gender=kids&subcategory=Traditional+Clothing" className="block py-1">Boys' Kurta Pajama Sets</Link>
                  <Link to="/shop?gender=kids&subcategory=Dresses" className="block py-1">Girls' Festive Dresses</Link>
                </div>
              )}
            </div>

            <Link to="/shop?sort=newest" className="py-2 border-b border-[#E8E0D5]/50 text-[#1A1A1A]">
              New Arrivals
            </Link>
            <Link to="/shop?sort=popularity" className="py-2 border-b border-[#E8E0D5]/50 text-[#1A1A1A]">
              Best Sellers
            </Link>
            <Link to="/about" className="py-2 border-b border-[#E8E0D5]/50 text-[#1A1A1A]">
              About Us
            </Link>
            <Link to="/contact" className="py-2 border-b border-[#E8E0D5]/50 text-[#1A1A1A]">
              Contact Concierge
            </Link>

            {isAdmin && (
              <Link to="/admin" className="py-2 border-b border-[#E8E0D5]/50 text-[#8C6D38] font-bold flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
