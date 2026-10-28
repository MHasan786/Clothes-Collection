import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, ArrowLeft, Loader2, CreditCard, Banknote, Building2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPKR } from '../utils/pricing';
import { validateCheckoutForm } from '../utils/validation';

const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan',
];

const MAJOR_CITIES: Record<string, string[]> = {
  Punjab: ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur', 'Sargodha', 'Sheikhupura', 'Jhelum', 'Gujrat'],
  Sindh: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpur Khas'],
  'Islamabad Capital Territory': ['Islamabad'],
  'Khyber Pakhtunkhwa': ['Peshawar', 'Abbottabad', 'Mardan', 'Swat', 'Kohat', 'Dera Ismail Khan'],
  Balochistan: ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Hub'],
  'Azad Jammu & Kashmir': ['Muzaffarabad', 'Mirpur', 'Rawalakot', 'Kotli'],
  'Gilgit-Baltistan': ['Gilgit', 'Skardu', 'Hunza'],
};

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, discountAmount, shippingFee, grandTotal, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    province: 'Punjab',
    city: 'Lahore',
    area: '',
    address: '',
    deliveryInstructions: '',
    paymentMethod: 'cod' as 'cod' | 'bank_transfer' | 'card',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Auto-fill saved address if authenticated
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone,
      }));
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF9F5] p-6 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-[#1A1A1A]">Your Bag is Empty</h2>
        <p className="text-xs text-[#6B5E51]">Add items to your shopping bag before proceeding to checkout.</p>
        <Link
          to="/shop"
          className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#333]"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Validate form fields locally
    const validation = validateCheckoutForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        province: formData.province,
        city: formData.city,
        area: formData.area,
        address: formData.address,
        deliveryInstructions: formData.deliveryInstructions,
        paymentMethod: formData.paymentMethod,
        couponCode: appliedCoupon?.code || null,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      };

      const token = localStorage.getItem('styleora_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'Failed to place order. Please check inventory availability.');
        setIsSubmitting(false);
        return;
      }

      // Order placed successfully! Clear cart & navigate to confirmation
      clearCart();
      navigate(`/order-confirmation/${data.orderNumber}`, { state: { orderData: data } });
    } catch (err: any) {
      setServerError(err.message || 'An unexpected network error occurred.');
      setIsSubmitting(false);
    }
  };

  const cityOptions = MAJOR_CITIES[formData.province] || ['Other'];

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/shop"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#9C8570] hover:text-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-2">
            Secure Checkout
          </h1>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Customer & Delivery Details (7 cols) */}
            <div className="lg:col-span-7 space-y-8 bg-white p-6 sm:p-8 border border-[#E8E0D5]">
              {/* Section 1: Customer Contact */}
              <div className="space-y-4">
                <div className="border-b border-[#E8E0D5] pb-2 flex justify-between items-center">
                  <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
                    1. Contact Information
                  </h2>
                  {!user && (
                    <Link to="/account" className="text-xs text-[#A8864D] hover:underline">
                      Have an account? Sign in
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Ali Reza"
                      className={`w-full text-xs px-3 py-2.5 bg-white border ${
                        errors.fullName ? 'border-red-500' : 'border-[#E8E0D5]'
                      } focus:outline-hidden focus:border-[#1A1A1A]`}
                    />
                    {errors.fullName && <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. ali@example.com"
                      className={`w-full text-xs px-3 py-2.5 bg-white border ${
                        errors.email ? 'border-red-500' : 'border-[#E8E0D5]'
                      } focus:outline-hidden focus:border-[#1A1A1A]`}
                    />
                    {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Pakistani Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 0300 1234567"
                    className={`w-full text-xs px-3 py-2.5 bg-white border ${
                      errors.phone ? 'border-red-500' : 'border-[#E8E0D5]'
                    } focus:outline-hidden focus:border-[#1A1A1A]`}
                  />
                  <p className="text-[10px] text-[#9C8570] mt-1">
                    Courier rider will call this number before arrival for doorstep dispatch.
                  </p>
                  {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Section 2: Pakistan Shipping Address */}
              <div className="space-y-4 pt-4">
                <div className="border-b border-[#E8E0D5] pb-2">
                  <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
                    2. Shipping Address (Pakistan)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                      Province / Region *
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={(e) => {
                        const newProv = e.target.value;
                        const defaultCity = MAJOR_CITIES[newProv]?.[0] || '';
                        setFormData((prev) => ({ ...prev, province: newProv, city: defaultCity }));
                      }}
                      className="w-full text-xs px-3 py-2.5 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                    >
                      {PAKISTAN_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      list="city-suggestions"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Lahore, Karachi, Islamabad"
                      className={`w-full text-xs px-3 py-2.5 bg-white border ${
                        errors.city ? 'border-red-500' : 'border-[#E8E0D5]'
                      } focus:outline-hidden focus:border-[#1A1A1A]`}
                    />
                    <datalist id="city-suggestions">
                      {cityOptions.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                    {errors.city && <p className="text-[11px] text-red-600 mt-1">{errors.city}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Area / Locality / Sector *
                  </label>
                  <input
                    type="text"
                    name="area"
                    required
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="e.g. DHA Phase 6 / Gulberg III / Clifton Block 5 / F-7"
                    className={`w-full text-xs px-3 py-2.5 bg-white border ${
                      errors.area ? 'border-red-500' : 'border-[#E8E0D5]'
                    } focus:outline-hidden focus:border-[#1A1A1A]`}
                  />
                  {errors.area && <p className="text-[11px] text-red-600 mt-1">{errors.area}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Complete Street Address & House / Apartment *
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. House 42, Street 18, Sector C"
                    className={`w-full text-xs px-3 py-2 bg-white border ${
                      errors.address ? 'border-red-500' : 'border-[#E8E0D5]'
                    } focus:outline-hidden focus:border-[#1A1A1A]`}
                  />
                  {errors.address && <p className="text-[11px] text-red-600 mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    name="deliveryInstructions"
                    value={formData.deliveryInstructions}
                    onChange={handleInputChange}
                    placeholder="e.g. Near commercial market, ring gate bell"
                    className="w-full text-xs px-3 py-2 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              {/* Section 3: Payment Method */}
              <div className="space-y-4 pt-4">
                <div className="border-b border-[#E8E0D5] pb-2">
                  <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
                    3. Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* COD */}
                  <label
                    className={`flex items-start p-4 border cursor-pointer transition-all ${
                      formData.paymentMethod === 'cod'
                        ? 'border-[#1A1A1A] bg-[#FAF9F5]'
                        : 'border-[#E8E0D5] hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="mt-0.5 text-[#1A1A1A] focus:ring-0"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1A1A1A] flex items-center">
                          <Banknote className="w-4 h-4 mr-1.5 text-[#A8864D]" />
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] font-semibold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B5E51] mt-1">
                        Pay in cash to the TCS or Leopards courier upon inspecting the sealed parcel at your doorstep.
                      </p>
                    </div>
                  </label>

                  {/* Bank Transfer (IBFT) */}
                  <label
                    className={`flex items-start p-4 border cursor-pointer transition-all ${
                      formData.paymentMethod === 'bank_transfer'
                        ? 'border-[#1A1A1A] bg-[#FAF9F5]'
                        : 'border-[#E8E0D5] hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={handleInputChange}
                      className="mt-0.5 text-[#1A1A1A] focus:ring-0"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1A1A1A] flex items-center">
                          <Building2 className="w-4 h-4 mr-1.5 text-[#A8864D]" />
                          Direct Bank Transfer / IBFT
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B5E51] mt-1">
                        Transfer directly to our Meezan Bank corporate account. Account details will be provided on confirmation.
                      </p>
                    </div>
                  </label>

                  {/* Credit / Debit Card Simulator */}
                  <label
                    className={`flex items-start p-4 border cursor-pointer transition-all ${
                      formData.paymentMethod === 'card'
                        ? 'border-[#1A1A1A] bg-[#FAF9F5]'
                        : 'border-[#E8E0D5] hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="mt-0.5 text-[#1A1A1A] focus:ring-0"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1A1A1A] flex items-center">
                          <CreditCard className="w-4 h-4 mr-1.5 text-[#A8864D]" />
                          Online Card Payment (Visa / Mastercard)
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B5E51] mt-1">
                        Secure 3D-authenticated gateway sandbox. Encrypted end-to-end.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 border border-[#E8E0D5] space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A] border-b border-[#E8E0D5] pb-3">
                  Order Summary ({items.length} {items.length === 1 ? 'piece' : 'pieces'})
                </h3>

                {/* Items List */}
                <div className="divide-y divide-[#E8E0D5]/70 max-h-80 overflow-y-auto space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="pt-3 flex space-x-3 items-center">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-14 h-18 object-cover bg-[#F3EFEA] border border-[#E8E0D5] flex-shrink-0"
                      />
                      <div className="flex-1 text-xs">
                        <h4 className="font-medium text-[#1A1A1A] line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-[#9C8570] mt-0.5">
                          {item.size} • {item.colorName} • Qty: {item.quantity}
                        </p>
                        <p className="font-semibold text-[#1A1A1A] mt-1">
                          {formatPKR(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Totals */}
                <div className="border-t border-[#E8E0D5] pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-[#6B5E51]">
                    <span>Subtotal</span>
                    <span className="text-[#1A1A1A] font-medium">{formatPKR(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-{formatPKR(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#6B5E51]">
                    <span>Estimated Shipping (Pakistan)</span>
                    <span className="text-[#1A1A1A] font-medium">
                      {shippingFee === 0 ? 'COMPLIMENTARY' : formatPKR(shippingFee)}
                    </span>
                  </div>

                  <div className="border-t border-[#E8E0D5] pt-3 flex justify-between text-base font-bold text-[#1A1A1A]">
                    <span>Grand Total</span>
                    <span>{formatPKR(grandTotal)}</span>
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-[#333] disabled:opacity-50 transition-colors shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span>Verifying & Placing Order...</span>
                      </>
                    ) : (
                      <span>Confirm & Place Order</span>
                    )}
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-center space-x-2 text-[10px] text-[#9C8570]">
                  <ShieldCheck className="w-4 h-4 text-[#A8864D]" />
                  <span>Doorstep verification • 100% Genuine Quality Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
