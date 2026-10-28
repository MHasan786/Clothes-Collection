import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Printer, Truck } from 'lucide-react';
import { formatPKR } from '../utils/pricing.js';

export const OrderConfirmationPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.orderData || null);

  useEffect(() => {
    if (!order && orderNumber) {
      fetch(`/api/orders/track/${orderNumber}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setOrder(data))
        .catch(() => {});
    }
  }, [order, orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Printable Invoice Header */}
        <div className="hidden print-only mb-8 pb-6 border-b border-black">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-widest">STYLEORA ATELIER</h1>
              <p className="text-xs">42-C Gulberg III, MM Alam Road, Lahore, Pakistan</p>
              <p className="text-xs">concierge@styleora.com • +92 42 3578 9100</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold">TAX INVOICE</h2>
              <p className="text-xs">Order: {orderNumber}</p>
              <p className="text-xs">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white border border-[#E8E0D5] p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-[#9C8570] font-medium">Order Confirmed</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
              Thank You For Your Patronage
            </h1>
            <p className="text-xs sm:text-sm text-[#6B5E51] max-w-md mx-auto">
              Your garments have been reserved at the atelier. We will call you to verify prior to dispatch via express courier.
            </p>
          </div>

          {/* Reference Pill */}
          <div className="inline-block bg-[#F3EFEA] border border-[#E8E0D5] px-6 py-3 text-xs text-[#1A1A1A]">
            <span className="text-[#9C8570] uppercase tracking-wider block text-[10px]">Order Reference Number</span>
            <span className="font-mono text-base font-bold tracking-widest text-[#1A1A1A]">{orderNumber}</span>
          </div>

          {/* Customer & Shipping Summary */}
          {order && (
            <div className="border-t border-[#E8E0D5] pt-6 text-left grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#6B5E51]">
              <div>
                <h4 className="font-bold text-[#1A1A1A] uppercase tracking-wider text-[11px] mb-2">Recipient</h4>
                <p className="font-medium text-[#1A1A1A]">{order.customerName || order.customer_name}</p>
                <p>{order.customerEmail || order.customer_email}</p>
                <p>{order.customerPhone || order.customer_phone}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#1A1A1A] uppercase tracking-wider text-[11px] mb-2">Delivery Address</h4>
                <p>{order.shipping_address || order.address}</p>
                <p>{order.shipping_area || order.area}, {order.shipping_city || order.city}</p>
                <p>{order.shipping_province || order.province}, Pakistan</p>
              </div>

              <div>
                <h4 className="font-bold text-[#1A1A1A] uppercase tracking-wider text-[11px] mb-2">Payment Method</h4>
                <p className="capitalize font-medium text-[#1A1A1A]">
                  {(order.payment_method || order.paymentMethod || 'Cash on Delivery').replace('_', ' ')}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1A1A1A] uppercase tracking-wider text-[11px] mb-2">Order Total</h4>
                <p className="font-bold text-base text-[#1A1A1A]">
                  {formatPKR(order.totalAmount || order.total_amount || 0)}
                </p>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-6 border-t border-[#E8E0D5] flex flex-wrap items-center justify-center gap-4 no-print">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-6 py-3 border border-[#E8E0D5] bg-[#FAF9F5] hover:bg-[#F3EFEA] text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 mr-2 text-[#9C8570]" />
              <span>Print Order Receipt</span>
            </button>

            <Link
              to={`/track-order?orderNumber=${orderNumber}`}
              className="inline-flex items-center px-6 py-3 bg-[#1A1A1A] hover:bg-[#333] text-xs font-semibold uppercase tracking-wider text-white transition-colors"
            >
              <Truck className="w-4 h-4 mr-2" />
              <span>Track Live Delivery</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
