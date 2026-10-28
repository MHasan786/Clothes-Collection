export interface User {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
  name: string;
  phone: string;
  role: 'admin' | 'customer';
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  province: string;
  city: string;
  area: string;
  address: string;
  is_default: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  gender: 'men' | 'women' | 'kids' | 'unisex';
  description: string;
  image_url: string;
  is_featured: number;
  display_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color_name: string;
  color_code: string;
  sku: string;
  stock_quantity: number;
  image_url?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  is_primary: number;
  display_order: number;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  slug: string;
  description: string;
  gender: 'men' | 'women' | 'kids' | 'unisex';
  category_id: string;
  subcategory: string;
  regular_price: number;
  sale_price: number | null;
  cost_price: number;
  fabric: string;
  fit: string;
  care_instructions: string;
  occasion: string;
  is_featured: number;
  is_new_arrival: number;
  is_best_seller: number;
  status: 'published' | 'draft' | 'archived';
  rating: number;
  review_count: number;
  total_sales: number;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  category_name?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_title: string;
  product_sku: string;
  size: string;
  color_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_province: string;
  shipping_city: string;
  shipping_area: string;
  shipping_address: string;
  delivery_instructions?: string;
  payment_method: 'cod' | 'bank_transfer' | 'card';
  payment_status: 'pending' | 'paid' | 'refunded';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  coupon_code: string | null;
  total_amount: number;
  courier_name: string | null;
  tracking_number: string | null;
  internal_notes: string | null;
  cancellation_reason: string | null;
  return_status: 'none' | 'requested' | 'approved' | 'rejected' | 'completed';
  return_reason: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number;
  usage_limit: number;
  times_used: number;
  expires_at: string | null;
  is_active: number;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  customer_name: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: number;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
}

export interface SiteSettings {
  announcement_bar_text: string;
  free_shipping_threshold: number;
  standard_shipping_fee: number;
  hero_headline: string;
  hero_subheading: string;
  about_story: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  whatsapp_number: string;
}
