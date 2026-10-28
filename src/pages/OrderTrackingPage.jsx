import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { formatPKR } from '../utils/pricing.js';

export const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchOrder = async (ordNum) => {
    if (!ordNum.trim()) return;
    setIsLoading(true);
    setError(null);
    setActionSuccess(null);

    try {
      let url = `/api/orders/track/${encodeURIComponent(ordNum.trim().toUpperCase())}`;
      if (phone.trim()) {
        url += `?phone=${encodeURIComponent(phone.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Order not found. Please verify your order reference.');
        setOrder(null);
      } else {
        setOrder(data);
      }
    } catch {
      setError('Unable to retrieve tracking information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      fetchOrder(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrder(orderNumber);
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    const confirm = window.confirm('Are you sure you wish to cancel this order?');
    if (!confirm) return;

    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Customer requested cancellation via portal' }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess('Your order has been cancelled and inventory released.');
        fetchOrder(order.order_number);
      } else {
        setError(data.error || 'Failed to cancel order.');
      }
    } catch {
      setError('Error processing cancellation request.');
    }
  };

  const handleReturnRequest = async () => {
    if (!order) return;
    const reason = prompt('Please provide reason for exchange/return:');
    if (!reason) return;

    try {
      const res = await fetch(`/api/orders/${order.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnReason: reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess('Exchange/Return request submitted. Concierge will contact you within 24 hours.');
        fetchOrder(order.order_number);
      } else {
        setError(data.error || 'Failed to request return.');
      }
    } catch {
      setError('Error processing return request.');
    }
  };

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = order ? statusSteps.indexOf(order.order_status) : -1;

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-[#9C8570] font-medium">Real-Time Dispatch</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-1">Track Your Order</h1>
          <p className="text-xs text-[#6B5E51] mt-2">
            Enter your order reference code (e.g. STY-2026-XXXX) to view live courier status.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-6 border border-[#E8E0D5] shadow-xs mb-10">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <input
                type="text"
                required
                placeholder="Order Number (e.g. STY-2026-9821)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                className="w-full text-xs uppercase px-3 py-3 bg-[#FAF9F5] border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A] font-mono tracking-wider"
              />
            </div>
            <div className="sm:col-span-4">
              <input
                type="tel"
                placeholder="Mobile Number (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs px-3 py-3 bg-[#FAF9F5] border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-full py-3 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#333] transition-colors flex items-center justify-center cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track'}
              </button>
            </div>
          </form>

          {error && <p className="text-xs text-red-600 mt-3 font-medium">{error}</p>}
          {actionSuccess && <p className="text-xs text-emerald-700 mt-3 font-medium">{actionSuccess}</p>}
        </div>

        {/* Order Details Display */}
        {order && (
          <div className="bg-white border border-[#E8E0D5] p-6 sm:p-10 shadow-sm space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E8E0D5] pb-6 gap-4">
              <div>
                <span className="text-xs text-[#9C8570] uppercase tracking-wider block">Order Reference</span>
                <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] font-mono">
                  {order.order_number}
                </h2>
                <span className="text-xs text-[#9C8570]">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                  order.order_status === 'delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.order_status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-[#F3EFEA] text-[#1A1A1A]'
                }`}>
                  Status: {order.order_status}
                </span>
                {order.courier_name && (
                  <p className="text-xs text-[#6B5E51] mt-1">
                    Courier: <strong>{order.courier_name}</strong> ({order.tracking_number || 'In transit'})
                  </p>
                )}
              </div>
            </div>

            {/* Visual Stepper */}
            {order.order_status !== 'cancelled' && (
              <div className="py-6 border-b border-[#E8E0D5]">
                <h3 className="text-xs uppercase tracking-widest text-[#9C8570] font-semibold mb-6">
                  Shipment Progress
                </h3>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {[
                    { label: 'Pending', desc: 'Received at atelier' },
                    { label: 'Confirmed', desc: 'Order verified' },
                    { label: 'Processing', desc: 'Handcrafted & packed' },
                    { label: 'Shipped', desc: 'Dispatched with courier' },
                    { label: 'Delivered', desc: 'Doorstep fulfilled' },
                  ].map((step, idx) => {
                    const isPassed = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;
                    return (
                      <div key={step.label} className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-colors ${
                            isPassed
                              ? 'bg-[#1A1A1A] text-white'
                              : 'bg-[#F3EFEA] text-[#9C8570] border border-[#E8E0D5]'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className={`text-[11px] font-semibold ${isCurrent ? 'text-[#A8864D]' : 'text-[#1A1A1A]'}`}>
                          {step.label}
                        </span>
                        <span className="text-[10px] text-[#9C8570] hidden sm:block mt-0.5">{step.desc}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Itemized list */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[#9C8570] font-semibold mb-4">
                Ordered Garments
              </h3>
              <div className="divide-y divide-[#E8E0D5]/70">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex items-center space-x-4">
                    <img
                      src={item.image_url}
                      alt={item.product_title}
                      className="w-12 h-16 object-cover bg-[#F3EFEA] border border-[#E8E0D5]"
                    />
                    <div className="flex-1 text-xs">
                      <h4 className="font-semibold text-[#1A1A1A]">{item.product_title}</h4>
                      <p className="text-[#9C8570]">
                        Size: {item.size} • Color: {item.color_name} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#1A1A1A]">
                      {formatPKR(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E8E0D5] pt-4 mt-4 text-xs space-y-1 text-right">
                <p className="text-[#6B5E51]">Subtotal: {formatPKR(order.subtotal)}</p>
                {order.discount_amount > 0 && (
                  <p className="text-emerald-700">Discount: -{formatPKR(order.discount_amount)}</p>
                )}
                <p className="text-[#6B5E51]">Shipping: {order.shipping_fee === 0 ? 'COMPLIMENTARY' : formatPKR(order.shipping_fee)}</p>
                <p className="text-sm font-bold text-[#1A1A1A] pt-1 border-t border-[#E8E0D5] inline-block">
                  Grand Total: {formatPKR(order.total_amount)}
                </p>
              </div>
            </div>

            {/* Actions: Cancel if pending, Return if delivered */}
            <div className="border-t border-[#E8E0D5] pt-6 flex flex-wrap items-center justify-between gap-4">
              {order.order_status === 'pending' && (
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel Order
                </button>
              )}

              {order.order_status === 'delivered' && order.return_status === 'none' && (
                <button
                  onClick={handleReturnRequest}
                  className="px-4 py-2 border border-[#E8E0D5] bg-[#F3EFEA] hover:bg-[#E8E0D5] text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] transition-colors flex items-center cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                  <span>Request 14-Day Exchange / Return</span>
                </button>
              )}

              {order.return_status && order.return_status !== 'none' && (
                <span className="text-xs font-semibold text-[#A8864D] bg-[#F3EFEA] px-3 py-1.5 rounded">
                  Exchange Status: {order.return_status}
                </span>
              )}

              <Link
                to="/contact"
                className="text-xs text-[#9C8570] hover:text-[#1A1A1A] underline"
              >
                Need assistance? Contact Concierge
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
