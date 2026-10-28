import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Tag,
  Users,
  Settings,
  Mail,
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Printer,
  Edit,
  Trash2,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Download,
  Eye,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatPKR } from '../utils/pricing';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, login, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'inventory' | 'orders' | 'coupons' | 'content' | 'subscribers' | 'inquiries'>('overview');

  // Admin login state if not admin
  const [adminEmail, setAdminEmail] = useState('admin@styleora.com');
  const [adminPassword, setAdminPassword] = useState('AdminPass@123');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Overview metrics
  const [overviewData, setOverviewData] = useState<any>(null);

  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Inventory
  const [inventoryVariants, setInventoryVariants] = useState<any[]>([]);
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Coupons
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Subscribers & Inquiries
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Site Settings
  const [settings, setSettings] = useState<any>({});
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);

  // New Product Form state
  const [newProd, setNewProd] = useState({
    title: '',
    sku: '',
    gender: 'men',
    category_id: 'cat_men_shirts',
    subcategory: 'Shirts',
    regular_price: 4950,
    sale_price: '',
    cost_price: 2200,
    fabric: '100% Combed Cotton',
    fit: 'Tailored Fit',
    care_instructions: 'Machine wash delicate',
    occasion: 'Casual & Formal',
    description: '',
    is_featured: 1,
    is_new_arrival: 1,
    is_best_seller: 0,
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'],
    variants: [
      { size: 'S', color_name: 'Ivory Cream', color_code: '#FAF8F5', stock_quantity: 10 },
      { size: 'M', color_name: 'Ivory Cream', color_code: '#FAF8F5', stock_quantity: 15 },
      { size: 'L', color_name: 'Ivory Cream', color_code: '#FAF8F5', stock_quantity: 12 },
    ],
  });

  // New Coupon Form state
  const [newCpn, setNewCpn] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 4000,
    max_discount_amount: 2000,
    usage_limit: 100,
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('styleora_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const loadAllAdminData = () => {
    const headers = getAuthHeaders();

    fetch('/api/admin/reports', { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setOverviewData(data))
      .catch(() => {});

    fetch('/api/admin/products', { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProducts(data))
      .catch(() => {});

    fetch('/api/admin/orders', { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setOrders(data))
      .catch(() => {});

    fetch('/api/admin/inventory', { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setInventoryVariants(data))
      .catch(() => {});

    fetch('/api/admin/coupons', { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCoupons(data))
      .catch(() => {});

    fetch('/api/admin/newsletter', { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSubscribers(data))
      .catch(() => {});

    fetch('/api/admin/contact-messages', { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setInquiries(data))
      .catch(() => {});

    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setSettings(data))
      .catch(() => {});
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = await login(adminEmail, adminPassword);
    if (!res.success) {
      setLoginError(res.error || 'Failed to authenticate');
    }
  };

  // If user is not admin, show Admin Authentication Screen
  if (!isAdmin) {
    return (
      <div className="bg-[#141414] min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1F1F1F] border border-[#333] p-8 shadow-2xl text-white">
          <div className="text-center mb-8">
            <span className="font-serif text-3xl font-bold tracking-[0.2em] text-white">
              STYLEORA
            </span>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-[#A8864D]/20 text-[#C5A880] text-[11px] font-semibold uppercase tracking-widest mt-2 border border-[#A8864D]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Management Portal</span>
            </div>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#AAA] mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-[#141414] border border-[#333] text-white focus:outline-hidden focus:border-[#A8864D]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#AAA] mb-1">Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-[#141414] border border-[#333] text-white focus:outline-hidden focus:border-[#A8864D]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#A8864D] hover:bg-[#8C6D38] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-colors"
            >
              Authenticate & Enter Dashboard
            </button>

            <div className="pt-4 border-t border-[#333] text-center">
              <button
                type="button"
                onClick={() => {
                  setAdminEmail('admin@styleora.com');
                  setAdminPassword('AdminPass@123');
                }}
                className="text-[11px] text-[#C5A880] hover:underline"
              >
                Reset to Default Admin Credentials (admin@styleora.com / AdminPass@123)
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, updates: any) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        loadAllAdminData();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, ...updates });
        }
      }
    } catch {}
  };

  // Handle Quick Inventory Adjustment
  const handleAdjustStock = async (variantId: string, newStock: number) => {
    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ variant_id: variantId, new_quantity: newStock, reason: 'Admin dashboard adjustment' }),
      });
      if (res.ok) {
        loadAllAdminData();
      }
    } catch {}
  };

  // Handle Create Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newProd),
      });
      if (res.ok) {
        setIsProductModalOpen(false);
        loadAllAdminData();
      }
    } catch {}
  };

  // Handle Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newCpn),
      });
      if (res.ok) {
        setIsCouponModalOpen(false);
        loadAllAdminData();
        setNewCpn({ code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 4000, max_discount_amount: 2000, usage_limit: 100 });
      }
    } catch {}
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSettingsSavedMsg('Settings updated successfully!');
        setTimeout(() => setSettingsSavedMsg(null), 3000);
      }
    } catch {}
  };

  // Export orders to CSV
  const handleExportOrdersCSV = () => {
    const csvRows = [
      ['Order Number', 'Date', 'Customer Name', 'Email', 'Phone', 'City', 'Payment Method', 'Status', 'Total (PKR)'],
      ...orders.map((o) => [
        o.order_number,
        new Date(o.created_at).toLocaleDateString(),
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.shipping_city,
        o.payment_method,
        o.order_status,
        o.total_amount,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `STYLEORA_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-[#1A1A1A] flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-[#141414] text-white border-b border-[#2A2A2A] px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <Link to="/" className="font-serif text-xl font-bold tracking-[0.2em] uppercase">
            STYLEORA <span className="text-[#A8864D] text-xs font-sans tracking-widest font-normal">MANAGEMENT</span>
          </Link>
          <span className="hidden sm:inline-block px-2.5 py-0.5 bg-[#A8864D]/30 text-[#C5A880] text-[10px] font-bold uppercase rounded">
            Executive Admin
          </span>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <Link to="/" className="text-[#AAA] hover:text-white transition-colors">
            View Storefront ↗
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Admin Sidebar Nav */}
        <aside className="w-full md:w-64 bg-white border-r border-[#E8E0D5] p-4 space-y-1 text-xs font-semibold uppercase tracking-wider">
          {[
            { id: 'overview', label: 'Overview Metrics', icon: LayoutDashboard },
            { id: 'orders', label: 'Order Processing', icon: ShoppingBag, badge: overviewData?.metrics?.pendingOrders },
            { id: 'products', label: 'Catalog Products', icon: Package, badge: overviewData?.metrics?.totalProducts },
            { id: 'inventory', label: 'Stock Matrix', icon: Layers, badge: overviewData?.metrics?.lowStockItems, badgeColor: 'bg-red-500 text-white' },
            { id: 'coupons', label: 'Discount Coupons', icon: Tag },
            { id: 'content', label: 'Store Settings', icon: Settings },
            { id: 'subscribers', label: 'Gazette Subscribers', icon: Mail, badge: subscribers.length },
            { id: 'inquiries', label: 'Customer Inquiries', icon: FileText, badge: inquiries.length },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded transition-colors ${
                  isActive ? 'bg-[#1A1A1A] text-white' : 'text-[#6B5E51] hover:bg-[#F3EFEA] hover:text-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${item.badgeColor || 'bg-[#A8864D] text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && overviewData && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Executive Dashboard</h2>
                  <p className="text-xs text-[#9C8570]">Real-time e-commerce performance metrics across Pakistan</p>
                </div>
                <button
                  onClick={loadAllAdminData}
                  className="inline-flex items-center px-3 py-1.5 bg-[#FAF9F5] border border-[#E8E0D5] hover:bg-[#F3EFEA] text-xs font-semibold text-[#1A1A1A]"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 border border-[#E8E0D5] space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-[#9C8570] font-semibold">Total Revenue (Valid)</p>
                  <p className="font-serif text-2xl font-bold text-[#1A1A1A]">
                    {formatPKR(overviewData.metrics.totalRevenue)}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">From fulfilled & active sales</p>
                </div>

                <div className="bg-white p-5 border border-[#E8E0D5] space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-[#9C8570] font-semibold">Total Orders</p>
                  <p className="font-serif text-2xl font-bold text-[#1A1A1A]">
                    {overviewData.metrics.totalOrders}
                  </p>
                  <p className="text-[10px] text-[#6B5E51]">
                    {overviewData.metrics.pendingOrders} pending verification
                  </p>
                </div>

                <div className="bg-white p-5 border border-[#E8E0D5] space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-[#9C8570] font-semibold">Delivered Orders</p>
                  <p className="font-serif text-2xl font-bold text-emerald-800">
                    {overviewData.metrics.deliveredOrders}
                  </p>
                  <p className="text-[10px] text-emerald-700">Fulfilled across Pakistan</p>
                </div>

                <div className="bg-white p-5 border border-[#E8E0D5] space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-[#9C8570] font-semibold">Low Stock Alerts</p>
                  <p className="font-serif text-2xl font-bold text-amber-600">
                    {overviewData.metrics.lowStockItems}
                  </p>
                  <p className="text-[10px] text-amber-700">Variants with ≤ 5 units</p>
                </div>
              </div>

              {/* Recent Orders & Top Selling Products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-white border border-[#E8E0D5] p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#E8E0D5] pb-3">
                    <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Recent Dispatches</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-[#A8864D] hover:underline"
                    >
                      View All Orders →
                    </button>
                  </div>

                  <div className="divide-y divide-[#E8E0D5]/70 text-xs">
                    {overviewData.recentOrders?.map((ord: any) => (
                      <div key={ord.id} className="py-2.5 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[#1A1A1A] font-mono">{ord.order_number}</p>
                          <p className="text-[#9C8570]">{ord.customer_name} • {ord.payment_method.toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPKR(ord.total_amount)}</p>
                          <span className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                            ord.order_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-[#F3EFEA]'
                          }`}>
                            {ord.order_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white border border-[#E8E0D5] p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#E8E0D5] pb-3">
                    <h3 className="font-serif text-base font-bold text-[#1A1A1A]">Top Performing Pieces</h3>
                    <span className="text-xs text-[#9C8570]">By units sold</span>
                  </div>

                  <div className="divide-y divide-[#E8E0D5]/70 text-xs">
                    {overviewData.topSelling?.map((p: any) => (
                      <div key={p.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img src={p.image_url} alt="" className="w-10 h-12 object-cover bg-[#F3EFEA] border" />
                          <div>
                            <h4 className="font-semibold text-[#1A1A1A]">{p.title}</h4>
                            <p className="text-[#9C8570]">{formatPKR(p.regular_price)} • SKU: {p.sku}</p>
                          </div>
                        </div>
                        <span className="font-bold text-[#A8864D] text-xs">
                          {p.total_sales} sold
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER PROCESSING */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Customer Orders</h2>
                  <p className="text-xs text-[#9C8570]">Manage order statuses, courier assignments, and printable invoices</p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleExportOrdersCSV}
                    className="inline-flex items-center px-4 py-2 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#333] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 mr-2" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Filter controls */}
              <div className="bg-white p-4 border border-[#E8E0D5] flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-[#9C8570] uppercase font-semibold">Filter Status:</span>
                  {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 capitalize font-medium border ${
                        orderStatusFilter === st
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : 'bg-[#FAF9F5] text-[#1A1A1A] border-[#E8E0D5]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search Order # or Client..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#FAF9F5] border border-[#E8E0D5] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white border border-[#E8E0D5] overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[#F3EFEA] border-b border-[#E8E0D5] text-[#1A1A1A] font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Order Ref</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">City / Area</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Total (PKR)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D5]">
                    {orders
                      .filter((o) => (orderStatusFilter === 'all' ? true : o.order_status === orderStatusFilter))
                      .filter((o) =>
                        orderSearch
                          ? o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            o.customer_name.toLowerCase().includes(orderSearch.toLowerCase())
                          : true
                      )
                      .map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#FAF9F5] transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#1A1A1A]">
                            {ord.order_number}
                          </td>
                          <td className="py-3 px-4 text-[#9C8570]">
                            {new Date(ord.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-[#1A1A1A]">{ord.customer_name}</p>
                            <p className="text-[10px] text-[#9C8570]">{ord.customer_phone}</p>
                          </td>
                          <td className="py-3 px-4 text-[#4A4A4A]">
                            {ord.shipping_city}, {ord.shipping_area}
                          </td>
                          <td className="py-3 px-4 uppercase font-medium text-[#6B5E51]">
                            {ord.payment_method}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={ord.order_status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, { order_status: e.target.value })}
                              className={`text-xs py-1 px-2 border rounded font-semibold ${
                                ord.order_status === 'delivered'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : ord.order_status === 'cancelled'
                                  ? 'bg-red-50 text-red-800 border-red-300'
                                  : 'bg-white border-[#E8E0D5]'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="returned">Returned</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 font-bold text-[#1A1A1A]">
                            {formatPKR(ord.total_amount)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-2.5 py-1 bg-[#F3EFEA] hover:bg-[#E8E0D5] text-[#1A1A1A] font-medium transition-colors"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Catalog Management</h2>
                  <p className="text-xs text-[#9C8570]">Create, edit, publish, and configure variant garments</p>
                </div>

                <button
                  onClick={() => setIsProductModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#333] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 mr-2" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Product Table */}
              <div className="bg-white border border-[#E8E0D5] overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[#F3EFEA] border-b border-[#E8E0D5] text-[#1A1A1A] font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Garment</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Regular Price</th>
                      <th className="py-3 px-4">Sale Price</th>
                      <th className="py-3 px-4">Total Stock</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D5]">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAF9F5]">
                        <td className="py-3 px-4 flex items-center space-x-3">
                          <img src={p.primary_image} alt="" className="w-10 h-13 object-cover bg-[#F3EFEA] border" />
                          <div>
                            <span className="font-bold text-[#1A1A1A] block">{p.title}</span>
                            <span className="text-[10px] text-[#9C8570] capitalize">{p.gender}'s clothing</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono">{p.sku}</td>
                        <td className="py-3 px-4">{p.category_name || p.subcategory}</td>
                        <td className="py-3 px-4 font-medium">{formatPKR(p.regular_price)}</td>
                        <td className="py-3 px-4 text-emerald-700">
                          {p.sale_price ? formatPKR(p.sale_price) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${p.total_stock <= 10 ? 'text-amber-600' : 'text-[#1A1A1A]'}`}>
                            {p.total_stock || 0} units
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold rounded">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Link
                            to={`/product/${p.slug}`}
                            target="_blank"
                            className="text-[#9C8570] hover:text-[#1A1A1A]"
                            title="View on storefront"
                          >
                            <Eye className="w-4 h-4 inline" />
                          </Link>
                          <button
                            onClick={async () => {
                              if (confirm(`Delete product "${p.title}"?`)) {
                                await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE', headers: getAuthHeaders() });
                                loadAllAdminData();
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Stock Matrix</h2>
                  <p className="text-xs text-[#9C8570]">Real-time inventory levels per size & color variant with instant adjustment</p>
                </div>
                <button
                  onClick={() => setLowStockFilter(!lowStockFilter)}
                  className={`px-3 py-1.5 text-xs font-semibold border ${
                    lowStockFilter ? 'bg-amber-600 text-white' : 'bg-white text-[#1A1A1A] border-[#E8E0D5]'
                  }`}
                >
                  {lowStockFilter ? 'Show All Variants' : 'Filter Low Stock Only (≤ 5)'}
                </button>
              </div>

              <div className="bg-white border border-[#E8E0D5] overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[#F3EFEA] border-b border-[#E8E0D5] text-[#1A1A1A] font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Garment</th>
                      <th className="py-3 px-4">Variant SKU</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Color</th>
                      <th className="py-3 px-4">Current Stock</th>
                      <th className="py-3 px-4">Quick Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D5]">
                    {inventoryVariants
                      .filter((v) => (lowStockFilter ? v.stock_quantity <= 5 : true))
                      .map((v) => (
                        <tr key={v.id} className="hover:bg-[#FAF9F5]">
                          <td className="py-3 px-4 font-semibold text-[#1A1A1A]">
                            {v.product_title}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#9C8570]">{v.sku}</td>
                          <td className="py-3 px-4 font-bold">{v.size}</td>
                          <td className="py-3 px-4 flex items-center space-x-1.5">
                            <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: v.color_code }} />
                            <span>{v.color_name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-bold ${v.stock_quantity <= 5 ? 'text-amber-600' : 'text-emerald-700'}`}>
                              {v.stock_quantity} units
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleAdjustStock(v.id, Math.max(0, v.stock_quantity - 1))}
                                className="w-6 h-6 border flex items-center justify-center hover:bg-[#F3EFEA]"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleAdjustStock(v.id, v.stock_quantity + 5)}
                                className="px-2 py-0.5 bg-[#F3EFEA] text-[11px] font-semibold hover:bg-[#E8E0D5]"
                              >
                                +5 Restock
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Discount Coupons</h2>
                  <p className="text-xs text-[#9C8570]">Configure promo codes, percentage or fixed discounts, and thresholds</p>
                </div>
                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="px-4 py-2 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#333]"
                >
                  + Create Coupon
                </button>
              </div>

              <div className="bg-white border border-[#E8E0D5] overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[#F3EFEA] border-b border-[#E8E0D5] font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Discount</th>
                      <th className="py-3 px-4">Min Spend</th>
                      <th className="py-3 px-4">Times Used</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D5]">
                    {coupons.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-4 font-mono font-bold text-[#A8864D]">{c.code}</td>
                        <td className="py-3 px-4 capitalize">{c.discount_type}</td>
                        <td className="py-3 px-4 font-bold">
                          {c.discount_type === 'percentage' ? `${c.discount_value}%` : formatPKR(c.discount_value)}
                        </td>
                        <td className="py-3 px-4">{formatPKR(c.min_order_amount)}</td>
                        <td className="py-3 px-4">{c.times_used} / {c.usage_limit}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: STORE SETTINGS */}
          {activeTab === 'content' && (
            <div className="max-w-2xl bg-white border border-[#E8E0D5] p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Store Settings & Policies</h2>
                <p className="text-xs text-[#9C8570]">Configure announcement bar, thresholds, and brand story</p>
              </div>

              {settingsSavedMsg && (
                <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-3 border border-emerald-200">
                  {settingsSavedMsg}
                </p>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Announcement Bar Message</label>
                  <input
                    type="text"
                    value={settings.announcement_bar_text || ''}
                    onChange={(e) => setSettings({ ...settings, announcement_bar_text: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF9F5]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Free Shipping Threshold (PKR)</label>
                    <input
                      type="number"
                      value={settings.free_shipping_threshold || 5000}
                      onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF9F5]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Standard Shipping Fee (PKR)</label>
                    <input
                      type="number"
                      value={settings.standard_shipping_fee || 250}
                      onChange={(e) => setSettings({ ...settings, standard_shipping_fee: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF9F5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Hero Banner Headline</label>
                  <input
                    type="text"
                    value={settings.hero_headline || ''}
                    onChange={(e) => setSettings({ ...settings, hero_headline: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF9F5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Brand Heritage Story</label>
                  <textarea
                    rows={4}
                    value={settings.about_story || ''}
                    onChange={(e) => setSettings({ ...settings, about_story: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E8E0D5] bg-[#FAF9F5]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1A1A1A] text-white font-semibold uppercase tracking-wider hover:bg-[#333]"
                >
                  Save Store Settings
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: GAZETTE SUBSCRIBERS */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Gazette Newsletter Subscribers</h2>
                  <p className="text-xs text-[#9C8570]">{subscribers.length} registered VIP patron emails</p>
                </div>
              </div>

              <div className="bg-white border border-[#E8E0D5]">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-[#F3EFEA] border-b border-[#E8E0D5] font-semibold uppercase">
                      <th className="py-3 px-4">Subscriber Email</th>
                      <th className="py-3 px-4">Subscribed Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D5]">
                    {subscribers.map((s) => (
                      <tr key={s.id}>
                        <td className="py-3 px-4 font-medium">{s.email}</td>
                        <td className="py-3 px-4 text-[#9C8570]">{new Date(s.subscribed_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: CUSTOMER INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Concierge Inquiries</h2>
              <div className="bg-white border border-[#E8E0D5] divide-y divide-[#E8E0D5]">
                {inquiries.map((m) => (
                  <div key={m.id} className="p-4 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-[#1A1A1A]">{m.name} ({m.email})</h4>
                      <span className="text-[#9C8570]">{new Date(m.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="font-medium text-[#A8864D]">{m.subject}</p>
                    <p className="text-[#4A4A4A]">{m.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Selected Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSelectedOrder(null)} />
          <div className="min-h-screen px-4 text-center flex items-center justify-center py-8">
            <div className="inline-block w-full max-w-2xl bg-white border border-[#E8E0D5] p-6 text-left shadow-2xl relative z-10 space-y-4">
              <div className="flex justify-between items-start border-b border-[#E8E0D5] pb-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                    Order {selectedOrder.order_number}
                  </h3>
                  <p className="text-xs text-[#9C8570]">
                    Placed {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-[#9C8570] hover:text-black">
                  ✕
                </button>
              </div>

              {/* Courier & Tracking Form */}
              <div className="bg-[#FAF9F5] p-4 border border-[#E8E0D5] space-y-3 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-[11px]">Courier Dispatch Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-[#6B5E51]">Courier Partner</label>
                    <input
                      type="text"
                      placeholder="e.g. TCS Express / Leopards"
                      defaultValue={selectedOrder.courier_name || ''}
                      onBlur={(e) => handleUpdateOrderStatus(selectedOrder.id, { courier_name: e.target.value })}
                      className="w-full px-2 py-1.5 border border-[#E8E0D5] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[#6B5E51]">Tracking Code</label>
                    <input
                      type="text"
                      placeholder="e.g. TCS-99881234"
                      defaultValue={selectedOrder.tracking_number || ''}
                      onBlur={(e) => handleUpdateOrderStatus(selectedOrder.id, { tracking_number: e.target.value })}
                      className="w-full px-2 py-1.5 border border-[#E8E0D5] bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-[#E8E0D5] text-xs">
                {selectedOrder.items?.map((itm: any) => (
                  <div key={itm.id} className="py-2 flex justify-between">
                    <div>
                      <p className="font-semibold">{itm.product_title}</p>
                      <p className="text-[11px] text-[#9C8570]">Size: {itm.size} • Color: {itm.color_name} • Qty: {itm.quantity}</p>
                    </div>
                    <span className="font-bold">{formatPKR(itm.total_price)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E8E0D5] pt-3 flex justify-between font-bold text-sm">
                <span>Total Amount:</span>
                <span>{formatPKR(selectedOrder.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsProductModalOpen(false)} />
          <div className="min-h-screen px-4 text-center flex items-center justify-center py-8">
            <div className="inline-block w-full max-w-2xl bg-white border border-[#E8E0D5] p-6 text-left shadow-2xl relative z-10 space-y-4">
              <div className="flex justify-between items-center border-b border-[#E8E0D5] pb-3">
                <h3 className="font-serif text-xl font-bold">Add New Luxury Piece</h3>
                <button onClick={() => setIsProductModalOpen(false)}>✕</button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={newProd.title}
                      onChange={(e) => setNewProd({ ...newProd, title: e.target.value })}
                      className="w-full px-2.5 py-1.5 border"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">SKU *</label>
                    <input
                      type="text"
                      required
                      value={newProd.sku}
                      onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })}
                      className="w-full px-2.5 py-1.5 border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Department</label>
                    <select
                      value={newProd.gender}
                      onChange={(e) => setNewProd({ ...newProd, gender: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 border"
                    >
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="kids">Kids</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Regular Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      value={newProd.regular_price}
                      onChange={(e) => setNewProd({ ...newProd, regular_price: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Sale Price (Optional)</label>
                    <input
                      type="number"
                      value={newProd.sale_price}
                      onChange={(e) => setNewProd({ ...newProd, sale_price: e.target.value })}
                      className="w-full px-2.5 py-1.5 border"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Primary Image URL</label>
                  <input
                    type="text"
                    required
                    value={newProd.images[0]}
                    onChange={(e) => setNewProd({ ...newProd, images: [e.target.value] })}
                    className="w-full px-2.5 py-1.5 border"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newProd.description}
                    onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                    className="w-full px-2.5 py-1.5 border"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1A1A1A] text-white font-semibold uppercase tracking-wider"
                >
                  Publish Garment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsCouponModalOpen(false)} />
          <div className="min-h-screen px-4 text-center flex items-center justify-center py-8">
            <div className="inline-block w-full max-w-md bg-white border border-[#E8E0D5] p-6 text-left shadow-2xl relative z-10 space-y-4">
              <div className="flex justify-between items-center border-b border-[#E8E0D5] pb-3">
                <h3 className="font-serif text-xl font-bold">Create Coupon</h3>
                <button onClick={() => setIsCouponModalOpen(false)}>✕</button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Coupon Code (Uppercase)</label>
                  <input
                    type="text"
                    required
                    value={newCpn.code}
                    onChange={(e) => setNewCpn({ ...newCpn, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FLASH20"
                    className="w-full px-3 py-2 border font-mono uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Type</label>
                    <select
                      value={newCpn.discount_type}
                      onChange={(e) => setNewCpn({ ...newCpn, discount_type: e.target.value as any })}
                      className="w-full px-3 py-2 border"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (PKR)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Value</label>
                    <input
                      type="number"
                      required
                      value={newCpn.discount_value}
                      onChange={(e) => setNewCpn({ ...newCpn, discount_value: Number(e.target.value) })}
                      className="w-full px-3 py-2 border"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Min Spend Required (PKR)</label>
                  <input
                    type="number"
                    value={newCpn.min_order_amount}
                    onChange={(e) => setNewCpn({ ...newCpn, min_order_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1A1A1A] text-white font-semibold uppercase tracking-wider"
                >
                  Create Active Coupon
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
