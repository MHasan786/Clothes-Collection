import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { validateEmail, validatePakistanPhone } from '../utils/validation';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order & Sizing Inquiry',
    message: '',
  });

  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !validateEmail(formData.email) || !formData.message.trim()) {
      setStatus({ message: 'Please complete all required fields with a valid email.', isError: true });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ message: data.message || 'Message sent! Our concierge will contact you soon.', isError: false });
        setFormData({ name: '', email: '', phone: '', subject: 'Order & Sizing Inquiry', message: '' });
      } else {
        setStatus({ message: data.error || 'Failed to submit message.', isError: true });
      }
    } catch {
      setStatus({ message: 'Network error. Please try again later.', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen py-16 text-[#1A1A1A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-[#9C8570] font-medium">Customer Concierge</p>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A] mt-1">
            Connect With STYLEORA
          </h1>
          <p className="text-xs sm:text-sm text-[#6B5E51] mt-2">
            Whether inquiring about custom bridal tailoring, bespoke measurements, or delivery schedules, our concierge is at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E8E0D5] p-6 sm:p-10 shadow-xs space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] border-b border-[#E8E0D5] pb-4">
              Send An Atelier Inquiry
            </h2>

            {status && (
              <div className={`p-4 text-xs font-medium border ${
                status.isError ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Fatima Tariq"
                    className="w-full px-3 py-2.5 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. fatima@example.com"
                    className="w-full px-3 py-2.5 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Mobile Number (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0300 1234567"
                    className="w-full px-3 py-2.5 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Inquiry Topic</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                  >
                    <option value="Order & Sizing Inquiry">Order & Sizing Inquiry</option>
                    <option value="Exchange or Return Assistance">Exchange or Return Assistance</option>
                    <option value="Custom Bespoke Tailoring">Custom Bespoke Tailoring</option>
                    <option value="Corporate / Bulk Orders">Corporate / Bulk Orders</option>
                    <option value="Other Concierge Query">Other Concierge Query</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Message *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detail your request or order number..."
                  className="w-full px-3 py-2 bg-white border border-[#E8E0D5] focus:outline-hidden focus:border-[#1A1A1A]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.2em] flex items-center justify-center space-x-2 hover:bg-[#333] transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-1" />
                <span>{isSubmitting ? 'Transmitting...' : 'Dispatch Inquiry'}</span>
              </button>
            </form>
          </div>

          {/* Right Boutique Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-[#E8E0D5] p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#9C8570] font-semibold">Flagship Atelier</span>
                <h3 className="font-serif text-xl font-bold text-[#1A1A1A] mt-1">Lahore Boutique</h3>
              </div>

              <div className="space-y-4 text-xs text-[#6B5E51]">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#A8864D] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1A1A1A] block">Address:</strong>
                    <span>42-C Gulberg III, MM Alam Road, Lahore 54000, Punjab, Pakistan</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-[#A8864D] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1A1A1A] block">Telephone Concierge:</strong>
                    <span>+92 42 3578 9100</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-[#A8864D] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1A1A1A] block">Electronic Mail:</strong>
                    <span>concierge@styleora.com</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-[#A8864D] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1A1A1A] block">Boutique & Support Hours:</strong>
                    <span>Monday - Saturday: 11:00 AM - 9:00 PM (PKT)</span>
                    <span className="block text-[#9C8570]">Sunday: Closed for artisan rest</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp direct link */}
              <div className="pt-2">
                <a
                  href="https://wa.me/923001122334?text=Hello%20STYLEORA%20Concierge,%20I%20have%20an%20inquiry%20regarding%20your%20collection."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp Directly</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
