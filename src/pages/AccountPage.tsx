import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPKR } from '../utils/pricing';
import type { Order, Product } from '../types';

export const AccountPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';
  const navigate = useNavigate();

  const { user, isAdmin, login, register, logout, updateProfile, wishlist, toggleWishlist } = useAuth();
  const { addToCart } = useCart();

  // Auth Form state
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile Edit state
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<any[]>([]);

  // Wishlist products
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || '');

      // Load orders
      setIsLoadingOrders(true);
      const token = localStorage.getItem('styleora_token');
      if (token) {
        fetch('/api/user/orders', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : []))
          .then((data) => setOrders(data))
          .catch(() => {})
          .finally(() => setIsLoadingOrders(false));

        fetch('/api/user/addresses', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : []))
          .then((data) => setAddresses(data))
          .catch(() => {});
      }
    }
  }, [user]);

  // Load wishlist products
  useEffect(() => {
    if (wishlist.length > 0) {
      fetch('/api/products?limit=50')
        .then((res) => (res.ok ? res.json() : { products: [] }))
        .then((data) => {
          const matched = (data.products || []).filter((p: Product) => wishlist.includes(p.id));
          setWishlistProducts(matched);
        })
        .catch(() => {});
    } else {
      setWishlistProducts([]);
    }
  }, [wishlist]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    const res = await login(loginEmail, loginPassword);
    setIsSubmitting(false);
    if (!res.success) {
      setAuthError(res.error || 'Failed to sign in');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    const res = await register(regName, regEmail, regPassword, regPhone);
    setIsSubmitting(false);
    if (!res.success) {
      setAuthError(res.error || 'Failed to register account');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateProfile(editName, editPhone);
    if (ok) {
      setProfileMsg('Profile updated successfully.');
      setTimeout(() => setProfileMsg(null), 3000);
    } else {
      setProfileMsg('Failed to update profile. Please check your phone format.');
    }
  };

  // Demo account quick fill helper
  const handleDemoFill = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setLoginEmail('admin@styleora.com');
      setLoginPassword('AdminPass@123');
    } else {
      setLoginEmail('customer@styleora.com');
      setLoginPassword('CustomerPass@123');
    }
  };

  // If NOT logged in, show Sign In / Sign Up tabs
  if (!user) {
    return (
      <div className="bg-[#FAF9F5] min-h-screen py-16">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <span className="font-serif text-3xl font-bold tracking-[0.15em] text-[#1A1A1A]">
              STYLEORA
            </span>
            <p className="text-xs text-[#9C8570] uppercase tracking-widest mt-1">
              Atelier Client Portal
            </p>
          </div>

          <div className="bg-white border border-[#E8E0D5] p-6 sm:p-8 shadow-sm">
            {/* View Tabs */}
            <div className="flex border-b border-[#E8E0D5] mb-6 text-xs font-semibold uppercase tracking-wider">
              <button
                onClick={() => { setIsRegisterView(false); setAuthError(null); }}
                className={`flex-1 pb-3 text-center border-b-2 transition-all ${
                  !isRegisterView ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#9C8570]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsRegisterView(true); setAuthError(null); }}
                className={`flex-1 pb-3 text-center border-b-2 transition-all ${
                  isRegisterView ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#9C8570]'
                }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                {authError}
              </div>
            )}

            {!isRegisterView ? (
              // Sign In Form
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. customer@styleora.com"
                    className="w-full text-xs px-3 py-2.5 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full text-xs px-3 py-2.5 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#333] transition-colors"
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>

                {/* Quick Demo Credentials for Fast Evaluation */}
                <div className="pt-4 border-t border-[#E8E0D5]/70 space-y-2 text-center">
                  <p className="text-[11px] text-[#9C8570]">Instant Demo Testing Accounts:</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDemoFill('customer')}
                      className="flex-1 py-1.5 px-2 bg-[#F3EFEA] hover:bg-[#E8E0D5] text-[11px] font-medium text-[#1A1A1A] transition-colors"
                    >
                      Fill Demo Client
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoFill('admin')}
                      className="flex-1 py-1.5 px-2 bg-[#E8DFD5] hover:bg-[#D6C8B7] text-[11px] font-bold text-[#8C6D38] transition-colors"
                    >
                      Fill Demo Admin
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              // Sign Up Form
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Usman Ali"
                    className="w-full text-xs px-3 py-2.5 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. usman@example.com"
                    className="w-full text-xs px-3 py-2.5 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Mobile Phone Number (03XX...)</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full text-xs px-3 py-2.5 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full text-xs px-3 py-2.5 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#333] transition-colors"
                >
                  {isSubmitting ? 'Creating Account...' : 'Register'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  return (
    <div className="bg-[#FAF9F5] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-[#E8E0D5] gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#9C8570]">Patron Portal</span>
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">{user.name}</h1>
            <p className="text-xs text-[#6B5E51]">{user.email} {user.phone && `• ${user.phone}`}</p>
          </div>

          <div className="flex items-center space-x-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center px-4 py-2 bg-[#A8864D] hover:bg-[#8C6D38] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                <span>Open Admin Panel</span>
              </Link>
            )}

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="inline-flex items-center px-4 py-2 border border-[#E8E0D5] bg-white text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E8E0D5] mt-6 text-xs font-semibold uppercase tracking-wider space-x-8">
          <button
            onClick={() => setSearchParams({ tab: 'orders' })}
            className={`pb-3 border-b-2 flex items-center transition-all ${
              activeTab === 'orders' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#9C8570]'
            }`}
          >
            <Package className="w-4 h-4 mr-2" />
            <span>Order History ({orders.length})</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'wishlist' })}
            className={`pb-3 border-b-2 flex items-center transition-all ${
              activeTab === 'wishlist' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#9C8570]'
            }`}
          >
            <Heart className="w-4 h-4 mr-2" />
            <span>Wishlist ({wishlist.length})</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'profile' })}
            className={`pb-3 border-b-2 flex items-center transition-all ${
              activeTab === 'profile' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#9C8570]'
            }`}
          >
            <UserIcon className="w-4 h-4 mr-2" />
            <span>Account Details</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {/* TAB 1: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="bg-white p-12 text-center border border-[#E8E0D5] space-y-3">
                  <Package className="w-10 h-10 text-[#9C8570] mx-auto opacity-50" />
                  <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">No Orders Placed Yet</h3>
                  <p className="text-xs text-[#6B5E51] max-w-sm mx-auto">
                    Your luxury wardrobe journey begins now. Browse our curated seasonal collections.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-block mt-2 px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#333]"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="bg-white border border-[#E8E0D5] p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E0D5] gap-2">
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-sm font-bold text-[#1A1A1A]">{ord.order_number}</span>
                          <span className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded ${
                            ord.order_status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.order_status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-[#F3EFEA] text-[#1A1A1A]'
                          }`}>
                            {ord.order_status}
                          </span>
                        </div>
                        <p className="text-xs text-[#9C8570] mt-0.5">
                          Placed on {new Date(ord.created_at).toLocaleDateString()} • {ord.payment_method.toUpperCase()}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-bold text-[#1A1A1A]">
                          {formatPKR(ord.total_amount)}
                        </span>
                        <Link
                          to={`/track-order?orderNumber=${ord.order_number}`}
                          className="px-3 py-1.5 border border-[#E8E0D5] hover:bg-[#F3EFEA] text-xs font-medium text-[#1A1A1A] transition-colors"
                        >
                          Track Package
                        </Link>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="divide-y divide-[#E8E0D5]/60">
                      {ord.items?.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.image_url}
                              alt=""
                              className="w-10 h-13 object-cover bg-[#F3EFEA] border border-[#E8E0D5]"
                            />
                            <div>
                              <h4 className="font-medium text-[#1A1A1A]">{item.product_title}</h4>
                              <p className="text-[11px] text-[#9C8570]">
                                Size: {item.size} • Color: {item.color_name} • Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-[#1A1A1A]">{formatPKR(item.total_price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div>
              {wishlistProducts.length === 0 ? (
                <div className="bg-white p-12 text-center border border-[#E8E0D5] space-y-3">
                  <Heart className="w-10 h-10 text-[#9C8570] mx-auto opacity-50" />
                  <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">Your Wishlist is Empty</h3>
                  <p className="text-xs text-[#6B5E51] max-w-sm mx-auto">
                    Save your desired pieces while browsing to review or purchase them anytime.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-block mt-2 px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#333]"
                  >
                    Browse Collections
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {wishlistProducts.map((prod) => (
                    <div key={prod.id} className="relative group">
                      <Link to={`/product/${prod.slug}`} className="block aspect-[3/4] overflow-hidden bg-[#F3EFEA] border border-[#E8E0D5]">
                        <img
                          src={prod.primary_image}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      <button
                        onClick={() => toggleWishlist(prod.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-red-600 rounded-full shadow-sm"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="pt-2">
                        <h4 className="font-serif text-sm font-semibold text-[#1A1A1A] line-clamp-1">{prod.title}</h4>
                        <p className="text-xs font-bold text-[#1A1A1A] mt-0.5">
                          {formatPKR(prod.sale_price || prod.regular_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACCOUNT PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-xl bg-white border border-[#E8E0D5] p-6 sm:p-8 space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A] border-b border-[#E8E0D5] pb-3">
                Personal Information
              </h3>

              {profileMsg && (
                <p className="text-xs font-medium text-emerald-800 bg-emerald-50 p-3 border border-emerald-200">
                  {profileMsg}
                </p>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full text-xs px-3 py-2.5 bg-[#F3EFEA] border border-[#E8E0D5] text-[#9C8570]"
                  />
                  <p className="text-[10px] text-[#9C8570] mt-1">Email address is permanent for your account.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Pakistani Mobile Phone</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full text-xs px-3 py-2.5 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#333] transition-colors"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
