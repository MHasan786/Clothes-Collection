import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, HelpCircle, FileText, Lock } from 'lucide-react';

export const PolicyPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Client Policies';
  let activeTab = 'shipping';

  if (path.includes('shipping')) {
    title = 'Shipping & Delivery Policy';
    activeTab = 'shipping';
  } else if (path.includes('return')) {
    title = 'Returns & Exchange Policy';
    activeTab = 'returns';
  } else if (path.includes('faq')) {
    title = 'Frequently Asked Questions';
    activeTab = 'faq';
  } else if (path.includes('privacy')) {
    title = 'Privacy Policy';
    activeTab = 'privacy';
  } else if (path.includes('terms')) {
    title = 'Terms of Service';
    activeTab = 'terms';
  } else if (path.includes('size-guide')) {
    title = 'Size Charts & Measurement Guide';
    activeTab = 'size';
  }

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-16 text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-[#9C8570] font-medium">Customer Care</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-1">{title}</h1>
        </div>

        {/* Quick Tabs */}
        <div className="flex border-b border-[#E8E0D5] mb-10 overflow-x-auto text-xs font-semibold uppercase tracking-wider space-x-6">
          <Link
            to="/shipping-policy"
            className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'shipping' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#9C8570]'
            }`}
          >
            Shipping & Rates
          </Link>
          <Link
            to="/return-policy"
            className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'returns' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#9C8570]'
            }`}
          >
            14-Day Returns & Exchanges
          </Link>
          <Link
            to="/faq"
            className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'faq' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#9C8570]'
            }`}
          >
            FAQs
          </Link>
          <Link
            to="/privacy-policy"
            className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'privacy' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#9C8570]'
            }`}
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms-conditions"
            className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'terms' ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#9C8570]'
            }`}
          >
            Terms of Service
          </Link>
        </div>

        {/* Content Box */}
        <div className="bg-white border border-[#E8E0D5] p-8 sm:p-12 shadow-xs space-y-8 text-xs leading-relaxed text-[#4A4A4A]">
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Express Nationwide Delivery</h2>
              <p>
                STYLEORA dispatches all orders from our Lahore atelier using insured premier couriers including TCS Express, Leopards, and Trax.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-[#F3EFEA] border border-[#E8E0D5]">
                  <h4 className="font-bold text-[#1A1A1A] text-sm">Major Cities</h4>
                  <p className="text-xs text-[#6B5E51] mt-1">Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad</p>
                  <p className="font-bold text-[#1A1A1A] mt-2">2 - 3 Business Days</p>
                </div>
                <div className="p-4 bg-[#F3EFEA] border border-[#E8E0D5]">
                  <h4 className="font-bold text-[#1A1A1A] text-sm">Other Regions & Rural</h4>
                  <p className="text-xs text-[#6B5E51] mt-1">Peshawar, Quetta, Multan, Sialkot, Sukkur, AJK, GB</p>
                  <p className="font-bold text-[#1A1A1A] mt-2">3 - 5 Business Days</p>
                </div>
              </div>

              <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Delivery Charges</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Orders over PKR 5,000:</strong> COMPLIMENTARY (Free of charge)</li>
                <li><strong>Orders under PKR 5,000:</strong> Flat PKR 250 across all of Pakistan</li>
              </ul>

              <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Order Verification</h3>
              <p>
                To safeguard clients against fraudulent dispatches, our customer concierge team will make a short confirmation call to your Pakistani mobile number prior to handing the parcel to the courier.
              </p>
            </div>
          )}

          {activeTab === 'returns' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">14-Day Hassle-Free Exchanges & Returns</h2>
              <p>
                If your garment does not fit impeccably or does not meet your expectations, STYLEORA gladly facilitates exchanges within 14 calendar days of confirmed delivery.
              </p>

              <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Eligibility Requirements</h3>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Garments must be unworn, unwashed, and undamaged with all original STYLEORA atelier tags attached.</li>
                <li>Items must remain in their original luxury protective packaging.</li>
                <li>Custom bespoke tailored garments or pieces altered per custom client requests are not eligible for exchange.</li>
              </ul>

              <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Doorstep Exchange Procedure</h3>
              <ol className="list-decimal list-inside space-y-1.5">
                <li>Visit the <strong>Track Order</strong> portal or contact our concierge via WhatsApp with your order reference (e.g. STY-2026-XXXX).</li>
                <li>Specify the desired replacement size or alternative garment.</li>
                <li>Our courier will arrive with the new piece and collect the exchange parcel right from your doorstep.</li>
              </ol>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Frequently Asked Questions</h2>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-[#1A1A1A] text-sm">How does Cash on Delivery (COD) work?</h4>
                  <p className="mt-1">
                    You can place your order online without entering any credit card details. When the courier rider brings the parcel to your doorstep, you inspect the outer seal and pay the exact invoice amount in Pakistani Rupees in cash.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-[#1A1A1A] text-sm">Can I modify or cancel my order after placement?</h4>
                  <p className="mt-1">
                    Yes. Pending orders that have not yet been dispatched to the courier hub can be cancelled with one click from our <strong>Track Your Order</strong> page or by informing our concierge.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-[#1A1A1A] text-sm">Are your garments pre-shrunk?</h4>
                  <p className="mt-1">
                    Yes. All 100% Egyptian cotton and raw silk textiles undergo sanforization and steam treatment during tailoring to prevent shrinkage upon gentle hand washing.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-[#1A1A1A] text-sm">Do you offer international shipping?</h4>
                  <p className="mt-1">
                    Our default storefront is configured for domestic Pakistan fulfillment with Cash on Delivery. For overseas orders (UK, USA, UAE, Canada), please contact our concierge via email or WhatsApp for custom DHL Express quotes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Privacy Commitment</h2>
              <p>
                STYLEORA respects patron confidentiality. We collect personal contact information (name, delivery address, phone number, email) solely for order fulfillment, dispatch verification, and customer concierge service.
              </p>
              <p>
                We do not sell, rent, or trade customer data to third-party marketing brokers. All account passwords and session tokens are cryptographically secured using salted hashing algorithms.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Terms of Service</h2>
              <p>
                By placing an order on STYLEORA, you agree that you are at least 18 years of age or purchasing with parental consent. All prices are listed in Pakistani Rupees (PKR) inclusive of applicable local charges.
              </p>
              <p>
                Orders are subject to fabric and inventory availability. In the rare event an item is unavailable after ordering, the atelier will promptly notify you and offer an immediate alternative or release of the order.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
