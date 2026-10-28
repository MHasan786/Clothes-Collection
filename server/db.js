import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { hashPassword } from './auth.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'styleora.sqlite');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign key enforcement
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      province TEXT NOT NULL,
      city TEXT NOT NULL,
      area TEXT NOT NULL,
      address TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      gender TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      is_featured INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      gender TEXT NOT NULL,
      category_id TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      regular_price INTEGER NOT NULL,
      sale_price INTEGER,
      cost_price INTEGER NOT NULL,
      fabric TEXT NOT NULL,
      fit TEXT NOT NULL,
      care_instructions TEXT NOT NULL,
      occasion TEXT NOT NULL,
      is_featured INTEGER DEFAULT 0,
      is_new_arrival INTEGER DEFAULT 0,
      is_best_seller INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published',
      rating REAL DEFAULT 4.8,
      review_count INTEGER DEFAULT 0,
      total_sales INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      url TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      size TEXT NOT NULL,
      color_name TEXT NOT NULL,
      color_code TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS inventory_logs (
      id TEXT PRIMARY KEY,
      variant_id TEXT NOT NULL,
      previous_stock INTEGER NOT NULL,
      new_stock INTEGER NOT NULL,
      change_amount INTEGER NOT NULL,
      reason TEXT NOT NULL,
      order_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (variant_id) REFERENCES product_variants(id)
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value INTEGER NOT NULL,
      min_order_amount INTEGER DEFAULT 0,
      max_discount_amount INTEGER DEFAULT 0,
      usage_limit INTEGER DEFAULT 100,
      times_used INTEGER DEFAULT 0,
      expires_at TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      shipping_province TEXT NOT NULL,
      shipping_city TEXT NOT NULL,
      shipping_area TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      delivery_instructions TEXT,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      order_status TEXT DEFAULT 'pending',
      subtotal INTEGER NOT NULL,
      shipping_fee INTEGER NOT NULL,
      discount_amount INTEGER DEFAULT 0,
      coupon_code TEXT,
      total_amount INTEGER NOT NULL,
      courier_name TEXT,
      tracking_number TEXT,
      internal_notes TEXT,
      cancellation_reason TEXT,
      return_status TEXT DEFAULT 'none',
      return_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT NOT NULL,
      product_title TEXT NOT NULL,
      product_sku TEXT NOT NULL,
      size TEXT NOT NULL,
      color_name TEXT NOT NULL,
      unit_price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      title TEXT NOT NULL,
      comment TEXT NOT NULL,
      is_verified_purchase INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      subscribed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_num ON orders(order_number);
  `);

  seedInitialData();
}

function seedInitialData() {
  const checkAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@styleora.com');
  if (checkAdmin) {
    return;
  }

  const now = new Date().toISOString();

  const adminAuth = hashPassword('AdminPass@123');
  const adminId = 'usr_admin_01';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, name, phone, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    adminId,
    'admin@styleora.com',
    adminAuth.hash,
    adminAuth.salt,
    'Executive Director (Admin)',
    '03001122334',
    'admin',
    now
  );

  const custAuth = hashPassword('CustomerPass@123');
  const custId = 'usr_cust_01';
  db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, name, phone, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    custId,
    'customer@styleora.com',
    custAuth.hash,
    custAuth.salt,
    'Ali Reza',
    '03214567890',
    'customer',
    now
  );

  db.prepare(`
    INSERT INTO addresses (id, user_id, full_name, phone, province, city, area, address, is_default, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'addr_01',
    custId,
    'Ali Reza',
    '03214567890',
    'Punjab',
    'Lahore',
    'DHA Phase 5, Sector G',
    'Bungalow 18, Street 4',
    1,
    now
  );

  const categories = [
    {
      id: 'cat_men_shirts',
      name: "Men's Shirts & Polos",
      slug: 'mens-shirts-polos',
      gender: 'men',
      description: 'Sophisticated dress shirts, luxury linen, and tailored polo shirts crafted from fine Egyptian cotton.',
      image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
      is_featured: 1,
      display_order: 1,
    },
    {
      id: 'cat_men_formal',
      name: "Men's Formal & Blazers",
      slug: 'mens-formal-blazers',
      gender: 'men',
      description: 'Sharp Italian cuts, bespoke wool blazers, and luxury tailored suits for timeless elegance.',
      image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      is_featured: 1,
      display_order: 2,
    },
    {
      id: 'cat_men_traditional',
      name: "Men's Traditional & Kurtas",
      slug: 'mens-traditional-kurtas',
      gender: 'men',
      description: 'Raw silk kurtas, handcrafted embroidered waistcoats, and classic festive wear.',
      image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      is_featured: 1,
      display_order: 3,
    },
    {
      id: 'cat_women_dresses',
      name: "Women's Couture & Dresses",
      slug: 'womens-couture-dresses',
      gender: 'women',
      description: 'Sculpted evening gowns, fluid silk slips, and contemporary silhouettes.',
      image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
      is_featured: 1,
      display_order: 4,
    },
    {
      id: 'cat_women_traditional',
      name: "Women's Festive & Suits",
      slug: 'womens-festive-suits',
      gender: 'women',
      description: 'Pure chanderi silk, hand-embellished 2-piece and 3-piece festive ensembles.',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      is_featured: 1,
      display_order: 5,
    },
    {
      id: 'cat_women_modest',
      name: "Women's Modest & Abayas",
      slug: 'womens-modest-abayas',
      gender: 'women',
      description: 'Flowing contemporary abayas, kimonos, and modest coordinates.',
      image_url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80',
      is_featured: 1,
      display_order: 6,
    },
    {
      id: 'cat_kids_festive',
      name: "Kids' Festive & Traditional",
      slug: 'kids-festive-traditional',
      gender: 'kids',
      description: 'Delicate hand-embroidered kurta sets and floral organza dresses for young royals.',
      image_url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
      is_featured: 1,
      display_order: 7,
    },
    {
      id: 'cat_kids_casual',
      name: "Kids' Smart Casual",
      slug: 'kids-smart-casual',
      gender: 'kids',
      description: 'Premium organic cottons, relaxed linen separates, and comfortable everyday wear.',
      image_url: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
      is_featured: 1,
      display_order: 8,
    },
  ];

  const insertCat = db.prepare(`
    INSERT INTO categories (id, name, slug, gender, description, image_url, is_featured, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const cat of categories) {
    insertCat.run(cat.id, cat.name, cat.slug, cat.gender, cat.description, cat.image_url, cat.is_featured, cat.display_order);
  }

  const products = [
    {
      id: 'prod_m01',
      sku: 'STY-M-SH-001',
      title: 'Signature Egyptian Cotton Oxford Shirt',
      slug: 'signature-egyptian-cotton-oxford-shirt',
      description: 'Crafted from 100% long-staple Egyptian cotton with a soft brushed hand feel. Designed with a structured button-down collar, mother-of-pearl buttons, and a tailored contemporary silhouette that effortlessly transitions from boardroom meetings to evening engagements.',
      gender: 'men',
      category_id: 'cat_men_shirts',
      subcategory: 'Shirts',
      regular_price: 5950,
      sale_price: 4950,
      cost_price: 2400,
      fabric: '100% Combed Egyptian Cotton (120/2 ply)',
      fit: 'Contemporary Tailored Fit',
      care_instructions: 'Machine wash warm (40°C). Medium iron while damp. Dry cleanable.',
      occasion: 'Business & Smart Casual',
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      rating: 4.9,
      review_count: 28,
      total_sales: 145,
      images: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80',
      ],
      variants: [
        { size: 'S', color_name: 'Ivory Cream', color_code: '#FAF8F5', stock: 12 },
        { size: 'M', color_name: 'Ivory Cream', color_code: '#FAF8F5', stock: 18 },
        { size: 'L', color_name: 'Ivory Cream', color_code: '#FAF8F5', stock: 14 },
        { size: 'XL', color_name: 'Ivory Cream', color_code: '#FAF8F5', stock: 6 },
        { size: 'S', color_name: 'Sky Blue', color_code: '#BDD2EA', stock: 10 },
        { size: 'M', color_name: 'Sky Blue', color_code: '#BDD2EA', stock: 15 },
        { size: 'L', color_name: 'Sky Blue', color_code: '#BDD2EA', stock: 8 },
      ],
    },
    {
      id: 'prod_m02',
      sku: 'STY-M-BL-002',
      title: 'Hand-Tailored Italian Wool Blazer',
      slug: 'hand-tailored-italian-wool-blazer',
      description: 'An unstructured single-breasted blazer cut from super 130s Italian virgin wool. Features half-canvas construction, soft natural shoulder pads, horn buttons, and functional patch pockets for an effortless European drape.',
      gender: 'men',
      category_id: 'cat_men_formal',
      subcategory: 'Formal & Blazers',
      regular_price: 19500,
      sale_price: 16500,
      cost_price: 9000,
      fabric: '100% Super 130s Virgin Wool',
      fit: 'Modern Slim Silhouette',
      care_instructions: 'Specialist Dry Clean Only. Steam to release wrinkles.',
      occasion: 'Formal & Evening Soirée',
      is_featured: 1,
      is_new_arrival: 0,
      is_best_seller: 1,
      rating: 5.0,
      review_count: 19,
      total_sales: 82,
      images: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
      ],
      variants: [
        { size: '38R', color_name: 'Midnight Navy', color_code: '#152238', stock: 5 },
        { size: '40R', color_name: 'Midnight Navy', color_code: '#152238', stock: 8 },
        { size: '42R', color_name: 'Midnight Navy', color_code: '#152238', stock: 4 },
        { size: '40R', color_name: 'Charcoal Grey', color_code: '#36454F', stock: 6 },
        { size: '42R', color_name: 'Charcoal Grey', color_code: '#36454F', stock: 3 },
      ],
    },
    {
      id: 'prod_m03',
      sku: 'STY-M-KT-003',
      title: 'Handcrafted Raw Silk Festive Kurta Set',
      slug: 'handcrafted-raw-silk-festive-kurta-set',
      description: 'Woven from handloom raw textured silk, featuring subtle tonal threadwork on the mandarin collar and cuffs. Paired with a tailored cotton-silk churidar trouser. Perfect for weddings, Eid festivities, and celebratory occasions.',
      gender: 'men',
      category_id: 'cat_men_traditional',
      subcategory: 'Traditional & Kurtas',
      regular_price: 12900,
      sale_price: null,
      cost_price: 5500,
      fabric: 'Pure Raw Silk with Cotton Silk Lining',
      fit: 'Relaxed Traditional Fit',
      care_instructions: 'Dry Clean Recommended. Do not bleach or tumble dry.',
      occasion: 'Festive, Weddings & Eid',
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 0,
      rating: 4.8,
      review_count: 14,
      total_sales: 56,
      images: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=80',
      ],
      variants: [
        { size: 'S', color_name: 'Antique Cream', color_code: '#E8E3D7', stock: 9 },
        { size: 'M', color_name: 'Antique Cream', color_code: '#E8E3D7', stock: 12 },
        { size: 'L', color_name: 'Antique Cream', color_code: '#E8E3D7', stock: 7 },
        { size: 'XL', color_name: 'Antique Cream', color_code: '#E8E3D7', stock: 4 },
        { size: 'M', color_name: 'Emerald Green', color_code: '#1B4D3E', stock: 6 },
        { size: 'L', color_name: 'Emerald Green', color_code: '#1B4D3E', stock: 5 },
      ],
    },
    {
      id: 'prod_m04',
      sku: 'STY-M-PL-004',
      title: 'Royal Supima Interlock Knit Polo',
      slug: 'royal-supima-interlock-knit-polo',
      description: 'An elevated take on the staple polo, knit from heavyweight Supima interlock jersey. Features a seamless ribbed collar, mother-of-pearl buttons, and a clean side-slit hem for timeless understated luxury.',
      gender: 'men',
      category_id: 'cat_men_shirts',
      subcategory: 'T-Shirts & Polos',
      regular_price: 4250,
      sale_price: 3600,
      cost_price: 1800,
      fabric: '100% California Supima Cotton (260 GSM)',
      fit: 'Regular Tailored Fit',
      care_instructions: 'Machine wash delicate cold. Flat dry in shade.',
      occasion: 'Casual & Weekend Brunch',
      is_featured: 0,
      is_new_arrival: 1,
      is_best_seller: 1,
      rating: 4.7,
      review_count: 32,
      total_sales: 210,
      images: [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80',
      ],
      variants: [
        { size: 'S', color_name: 'Jet Black', color_code: '#1A1A1A', stock: 15 },
        { size: 'M', color_name: 'Jet Black', color_code: '#1A1A1A', stock: 22 },
        { size: 'L', color_name: 'Jet Black', color_code: '#1A1A1A', stock: 18 },
        { size: 'XL', color_name: 'Jet Black', color_code: '#1A1A1A', stock: 9 },
        { size: 'M', color_name: 'Warm Taupe', color_code: '#8B8589', stock: 14 },
        { size: 'L', color_name: 'Warm Taupe', color_code: '#8B8589', stock: 11 },
      ],
    },
    {
      id: 'prod_w01',
      sku: 'STY-W-DR-001',
      title: 'Mulberry Silk Column Evening Dress',
      slug: 'mulberry-silk-column-evening-dress',
      description: 'Cut on the bias from 22-momme heavy Mulberry silk satin. This dramatic column dress features a clean square neckline, delicate adjustable straps, a sultry low back, and a graceful side slit for fluid movement.',
      gender: 'women',
      category_id: 'cat_women_dresses',
      subcategory: 'Dresses',
      regular_price: 17500,
      sale_price: 14500,
      cost_price: 7500,
      fabric: '100% Grade 6A Mulberry Silk (22 Momme)',
      fit: 'Fluid Bias Cut',
      care_instructions: 'Hand wash gently with silk detergent or dry clean.',
      occasion: 'Gala, Dinner & Receptions',
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      rating: 4.9,
      review_count: 41,
      total_sales: 112,
      images: [
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80',
      ],
      variants: [
        { size: 'XS', color_name: 'Champagne Gold', color_code: '#F7E7CE', stock: 6 },
        { size: 'S', color_name: 'Champagne Gold', color_code: '#F7E7CE', stock: 11 },
        { size: 'M', color_name: 'Champagne Gold', color_code: '#F7E7CE', stock: 9 },
        { size: 'L', color_name: 'Champagne Gold', color_code: '#F7E7CE', stock: 4 },
        { size: 'S', color_name: 'Onyx Noir', color_code: '#0F0F10', stock: 8 },
        { size: 'M', color_name: 'Onyx Noir', color_code: '#0F0F10', stock: 10 },
      ],
    },
    {
      id: 'prod_w02',
      sku: 'STY-W-TR-002',
      title: 'Chanderi Silk Hand-Embroidered Kurti & Trouser',
      slug: 'chanderi-silk-hand-embroidered-kurti-trouser',
      description: 'An exquisite 2-piece ensemble crafted from translucent Chanderi silk with delicate zardozi and resham embroidery along the split neckline and sleeves. Lined with ultra-soft mulmul cotton and paired with tailored raw silk culottes.',
      gender: 'women',
      category_id: 'cat_women_traditional',
      subcategory: 'Festive & Traditional',
      regular_price: 12500,
      sale_price: 10500,
      cost_price: 5200,
      fabric: 'Pure Chanderi Silk with Mulmul Cotton Lining',
      fit: 'Relaxed Elegant Straight Cut',
      care_instructions: 'Dry clean only to protect hand embroidery.',
      occasion: 'Festive, Dinner & Eid',
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      rating: 5.0,
      review_count: 36,
      total_sales: 178,
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
      ],
      variants: [
        { size: 'XS', color_name: 'Dusty Rose', color_code: '#DCAE96', stock: 7 },
        { size: 'S', color_name: 'Dusty Rose', color_code: '#DCAE96', stock: 14 },
        { size: 'M', color_name: 'Dusty Rose', color_code: '#DCAE96', stock: 12 },
        { size: 'L', color_name: 'Dusty Rose', color_code: '#DCAE96', stock: 6 },
        { size: 'S', color_name: 'Sage Mist', color_code: '#9CAF88', stock: 8 },
        { size: 'M', color_name: 'Sage Mist', color_code: '#9CAF88', stock: 10 },
      ],
    },
    {
      id: 'prod_w03',
      sku: 'STY-W-AB-003',
      title: 'Contemporary Fluid Modest Abaya & Belt',
      slug: 'contemporary-fluid-modest-abaya-belt',
      description: 'Designed with minimalist architectural purity. Made from premium Japanese Nidha fabric with deep raglan sleeves, hidden magnetic snap closures, and a detachable tie belt for versatile draped or cinched styling.',
      gender: 'women',
      category_id: 'cat_women_modest',
      subcategory: 'Modest & Abayas',
      regular_price: 8900,
      sale_price: 7500,
      cost_price: 3600,
      fabric: 'Imported Japanese Nidha Crepe',
      fit: 'Flowing Modest Drape',
      care_instructions: 'Gentle hand wash cold or machine delicate cycle. Cool iron.',
      occasion: 'Everyday Luxury & Occasions',
      is_featured: 1,
      is_new_arrival: 0,
      is_best_seller: 1,
      rating: 4.8,
      review_count: 22,
      total_sales: 94,
      images: [
        'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80',
      ],
      variants: [
        { size: '52', color_name: 'Desert Sand', color_code: '#EDC9AF', stock: 6 },
        { size: '54', color_name: 'Desert Sand', color_code: '#EDC9AF', stock: 11 },
        { size: '56', color_name: 'Desert Sand', color_code: '#EDC9AF', stock: 9 },
        { size: '54', color_name: 'Midnight Black', color_code: '#101010', stock: 14 },
        { size: '56', color_name: 'Midnight Black', color_code: '#101010', stock: 12 },
      ],
    },
    {
      id: 'prod_w04',
      sku: 'STY-W-ST-004',
      title: 'Bespoke Double-Breasted Tailored Trouser Suit',
      slug: 'bespoke-double-breasted-tailored-trouser-suit',
      description: 'The epitome of contemporary power dressing. Includes a razor-sharp structured double-breasted jacket with peak lapels paired with high-waisted wide-leg pleated trousers. Tailored from a crease-resistant wool-blend crepe.',
      gender: 'women',
      category_id: 'cat_women_traditional',
      subcategory: 'Two-Piece & Three-Piece Suits',
      regular_price: 21500,
      sale_price: 18500,
      cost_price: 9800,
      fabric: '70% Wool, 28% Viscose, 2% Elastane',
      fit: 'Structured Tailored Fit',
      care_instructions: 'Professional Dry Clean Only.',
      occasion: 'Executive & Red Carpet',
      is_featured: 0,
      is_new_arrival: 1,
      is_best_seller: 0,
      rating: 4.9,
      review_count: 17,
      total_sales: 45,
      images: [
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80',
      ],
      variants: [
        { size: 'XS', color_name: 'Ivory Bone', color_code: '#FAF0E6', stock: 4 },
        { size: 'S', color_name: 'Ivory Bone', color_code: '#FAF0E6', stock: 8 },
        { size: 'M', color_name: 'Ivory Bone', color_code: '#FAF0E6', stock: 6 },
        { size: 'L', color_name: 'Ivory Bone', color_code: '#FAF0E6', stock: 3 },
      ],
    },
    {
      id: 'prod_k01',
      sku: 'STY-K-KT-001',
      title: "Boys' Chikan Embroidered Kurta Pajama Set",
      slug: 'boys-chikan-embroidered-kurta-pajama-set',
      description: 'Pure soft cotton kurta featuring delicate tonal chikan embroidery with button placket detailing, paired with comfortable drawstring cotton trousers. Soft on sensitive skin and effortlessly festive.',
      gender: 'kids',
      category_id: 'cat_kids_festive',
      subcategory: 'Traditional Clothing',
      regular_price: 4950,
      sale_price: 3950,
      cost_price: 1800,
      fabric: '100% Breathable Combed Cotton',
      fit: 'Comfortable Traditional Cut',
      care_instructions: 'Machine wash gentle. Warm iron.',
      occasion: 'Eid, Jumuah & Celebrations',
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      rating: 4.9,
      review_count: 18,
      total_sales: 88,
      images: [
        'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=80',
      ],
      variants: [
        { size: '3-4 Yrs', color_name: 'Pristine White', color_code: '#FFFFFF', stock: 8 },
        { size: '5-6 Yrs', color_name: 'Pristine White', color_code: '#FFFFFF', stock: 12 },
        { size: '7-8 Yrs', color_name: 'Pristine White', color_code: '#FFFFFF', stock: 10 },
        { size: '9-10 Yrs', color_name: 'Pristine White', color_code: '#FFFFFF', stock: 6 },
        { size: '5-6 Yrs', color_name: 'Powder Blue', color_code: '#B0E0E6', stock: 7 },
        { size: '7-8 Yrs', color_name: 'Powder Blue', color_code: '#B0E0E6', stock: 5 },
      ],
    },
    {
      id: 'prod_k02',
      sku: 'STY-K-DR-002',
      title: "Girls' Embroidered Organza Tiered Dress",
      slug: 'girls-embroidered-organza-tiered-dress',
      description: 'A whimsical fairytale tiered dress crafted from sheer organza layered over a soft breathable cotton satin lining. Features subtle floral embroidery, flutter sleeves, and a back sash bow.',
      gender: 'kids',
      category_id: 'cat_kids_festive',
      subcategory: 'Dresses',
      regular_price: 5850,
      sale_price: 4850,
      cost_price: 2200,
      fabric: 'Embroidered Organza with 100% Cotton Lining',
      fit: 'A-Line Flare',
      care_instructions: 'Hand wash cold or dry clean. Do not tumble dry.',
      occasion: 'Birthday, Weddings & Festive Parties',
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 0,
      rating: 5.0,
      review_count: 15,
      total_sales: 62,
      images: [
        'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80',
      ],
      variants: [
        { size: '3-4 Yrs', color_name: 'Blush Pink', color_code: '#FFD1DC', stock: 6 },
        { size: '5-6 Yrs', color_name: 'Blush Pink', color_code: '#FFD1DC', stock: 9 },
        { size: '7-8 Yrs', color_name: 'Blush Pink', color_code: '#FFD1DC', stock: 7 },
        { size: '5-6 Yrs', color_name: 'Vanilla Cream', color_code: '#FDFBF7', stock: 8 },
        { size: '7-8 Yrs', color_name: 'Vanilla Cream', color_code: '#FDFBF7', stock: 5 },
      ],
    },
    {
      id: 'prod_m05',
      sku: 'STY-M-JN-005',
      title: 'Selvedge Heritage Tapered Raw Denim',
      slug: 'selvedge-heritage-tapered-raw-denim',
      description: 'Constructed from 13.5 oz unwashed Japanese selvedge denim. Over time, each pair develops personalized fading and whiskering unique to the wearer. Finished with custom copper rivets and reinforced pocket bags.',
      gender: 'men',
      category_id: 'cat_men_formal',
      subcategory: 'Jeans & Trousers',
      regular_price: 7450,
      sale_price: null,
      cost_price: 3200,
      fabric: '100% Selvedge Cotton Denim (13.5 oz)',
      fit: 'Tapered Fit with Mid Rise',
      care_instructions: 'Wash inside-out in cold water after several wears. Hang dry.',
      occasion: 'Casual & Streetwear',
      is_featured: 0,
      is_new_arrival: 0,
      is_best_seller: 1,
      rating: 4.8,
      review_count: 24,
      total_sales: 120,
      images: [
        'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
      ],
      variants: [
        { size: '30/32', color_name: 'Deep Indigo', color_code: '#1F2F46', stock: 7 },
        { size: '32/32', color_name: 'Deep Indigo', color_code: '#1F2F46', stock: 15 },
        { size: '34/32', color_name: 'Deep Indigo', color_code: '#1F2F46', stock: 12 },
        { size: '36/32', color_name: 'Deep Indigo', color_code: '#1F2F46', stock: 4 },
      ],
    },
    {
      id: 'prod_w05',
      sku: 'STY-W-KN-005',
      title: 'Pure Mongolian Cashmere Mock-Neck Knit',
      slug: 'pure-mongolian-cashmere-mock-neck-knit',
      description: 'Spun from plush 2-ply Grade A Mongolian cashmere. Designed with dropped shoulders, a gentle mock-neck collar, and ribbed trims for featherweight warmth and quiet luxury.',
      gender: 'women',
      category_id: 'cat_women_dresses',
      subcategory: 'Tops & Shirts',
      regular_price: 11900,
      sale_price: 9500,
      cost_price: 4800,
      fabric: '100% Grade A Mongolian Cashmere',
      fit: 'Relaxed Slouchy Fit',
      care_instructions: 'Hand wash cold in cashmere wash. Lay flat on towel to dry.',
      occasion: 'Winter Luxury, Travel & Lounging',
      is_featured: 1,
      is_new_arrival: 1,
      is_best_seller: 1,
      rating: 4.9,
      review_count: 31,
      total_sales: 95,
      images: [
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80',
      ],
      variants: [
        { size: 'S', color_name: 'Camel Heather', color_code: '#C19A6B', stock: 8 },
        { size: 'M', color_name: 'Camel Heather', color_code: '#C19A6B', stock: 12 },
        { size: 'L', color_name: 'Camel Heather', color_code: '#C19A6B', stock: 6 },
        { size: 'S', color_name: 'Oatmeal', color_code: '#E3DAC9', stock: 7 },
        { size: 'M', color_name: 'Oatmeal', color_code: '#E3DAC9', stock: 10 },
      ],
    },
  ];

  const insertProd = db.prepare(`
    INSERT INTO products (
      id, sku, title, slug, description, gender, category_id, subcategory,
      regular_price, sale_price, cost_price, fabric, fit, care_instructions,
      occasion, is_featured, is_new_arrival, is_best_seller, status,
      rating, review_count, total_sales, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertImg = db.prepare(`
    INSERT INTO product_images (id, product_id, url, is_primary, display_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertVar = db.prepare(`
    INSERT INTO product_variants (id, product_id, size, color_name, color_code, sku, stock_quantity, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of products) {
    insertProd.run(
      p.id, p.sku, p.title, p.slug, p.description, p.gender, p.category_id, p.subcategory,
      p.regular_price, p.sale_price, p.cost_price, p.fabric, p.fit, p.care_instructions,
      p.occasion, p.is_featured, p.is_new_arrival, p.is_best_seller, 'published',
      p.rating, p.review_count, p.total_sales, now, now
    );

    p.images.forEach((url, idx) => {
      insertImg.run(`img_${p.id}_${idx}`, p.id, url, idx === 0 ? 1 : 0, idx);
    });

    p.variants.forEach((v, vIdx) => {
      const varSku = `${p.sku}-${v.size.replace(/[^A-Za-z0-9]/g, '')}-${v.color_name.substring(0, 3).toUpperCase()}`;
      insertVar.run(`var_${p.id}_${vIdx}`, p.id, v.size, v.color_name, v.color_code, varSku, v.stock, p.images[0]);
    });
  }

  const coupons = [
    {
      id: 'cp_01',
      code: 'STYLEORA10',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 4000,
      max_discount_amount: 2500,
      usage_limit: 500,
      expires_at: '2026-12-31T23:59:59Z',
      is_active: 1,
    },
    {
      id: 'cp_02',
      code: 'WELCOME500',
      discount_type: 'fixed',
      discount_value: 500,
      min_order_amount: 3500,
      max_discount_amount: 500,
      usage_limit: 1000,
      expires_at: '2026-12-31T23:59:59Z',
      is_active: 1,
    },
    {
      id: 'cp_03',
      code: 'EIDSPECIAL',
      discount_type: 'percentage',
      discount_value: 15,
      min_order_amount: 8000,
      max_discount_amount: 3000,
      usage_limit: 200,
      expires_at: '2026-12-31T23:59:59Z',
      is_active: 1,
    },
  ];

  const insertCpn = db.prepare(`
    INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, times_used, expires_at, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
  `);

  for (const c of coupons) {
    insertCpn.run(c.id, c.code, c.discount_type, c.discount_value, c.min_order_amount, c.max_discount_amount, c.usage_limit, c.expires_at, c.is_active, now);
  }

  const reviews = [
    {
      id: 'rev_01',
      product_id: 'prod_m01',
      user_id: custId,
      customer_name: 'Dr. Shahzad Mir',
      rating: 5,
      title: 'Exceptional drape and fabric quality',
      comment: 'The Egyptian cotton collar holds its shape remarkably well under a suit jacket or worn casually unbuttoned. Exactly the caliber of tailoring I expect from bespoke fashion houses.',
      is_verified_purchase: 1,
      created_at: '2026-10-15T10:30:00Z',
    },
    {
      id: 'rev_02',
      product_id: 'prod_w01',
      user_id: null,
      customer_name: 'Amina Tariq',
      rating: 5,
      title: 'Stunning silk dress for evening events',
      comment: 'Ordered the Champagne Gold for an anniversary gala in Lahore. The bias cut falls so naturally and the 22-momme weight feels rich and opaque. Fast COD delivery within 2 days!',
      is_verified_purchase: 1,
      created_at: '2026-10-18T14:15:00Z',
    },
    {
      id: 'rev_03',
      product_id: 'prod_w02',
      user_id: custId,
      customer_name: 'Fatima Z.',
      rating: 5,
      title: 'The hand embroidery is breathtaking',
      comment: 'The delicate zardozi work looks even more sophisticated in person than in the photos. Paired it with pearl earrings and received endless compliments.',
      is_verified_purchase: 1,
      created_at: '2026-10-20T16:45:00Z',
    },
    {
      id: 'rev_04',
      product_id: 'prod_m02',
      user_id: null,
      customer_name: 'Hamza Bilal',
      rating: 5,
      title: 'Masterful tailoring',
      comment: 'The natural shoulder and canvas finish of this Italian wool blazer rivals bespoke savile row pieces. Very happy with the fit.',
      is_verified_purchase: 1,
      created_at: '2026-10-22T11:20:00Z',
    },
  ];

  const insertRev = db.prepare(`
    INSERT INTO reviews (id, product_id, user_id, customer_name, rating, title, comment, is_verified_purchase, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const r of reviews) {
    insertRev.run(r.id, r.product_id, r.user_id, r.customer_name, r.rating, r.title, r.comment, r.is_verified_purchase, r.created_at);
  }

  const order1Id = 'ord_seed_01';
  db.prepare(`
    INSERT INTO orders (
      id, order_number, user_id, customer_name, customer_email, customer_phone,
      shipping_province, shipping_city, shipping_area, shipping_address,
      delivery_instructions, payment_method, payment_status, order_status,
      subtotal, shipping_fee, discount_amount, coupon_code, total_amount,
      courier_name, tracking_number, internal_notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    order1Id,
    'STY-2026-9821',
    custId,
    'Ali Reza',
    'customer@styleora.com',
    '03214567890',
    'Punjab',
    'Lahore',
    'DHA Phase 5',
    'Bungalow 18, Street 4, Sector G',
    'Please call before arrival',
    'cod',
    'paid',
    'delivered',
    9900,
    0,
    990,
    'STYLEORA10',
    8910,
    'TCS Express',
    'TCS-92817264',
    'First time VIP customer. Order delivered smoothly.',
    '2026-10-24T09:12:00Z',
    '2026-10-26T14:30:00Z'
  );

  db.prepare(`
    INSERT INTO order_items (
      id, order_id, product_id, variant_id, product_title, product_sku,
      size, color_name, unit_price, quantity, total_price, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'itm_01',
    order1Id,
    'prod_m01',
    'var_prod_m01_1',
    'Signature Egyptian Cotton Oxford Shirt',
    'STY-M-SH-001',
    'M',
    'Ivory Cream',
    4950,
    2,
    9900,
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80'
  );

  const order2Id = 'ord_seed_02';
  db.prepare(`
    INSERT INTO orders (
      id, order_number, user_id, customer_name, customer_email, customer_phone,
      shipping_province, shipping_city, shipping_area, shipping_address,
      delivery_instructions, payment_method, payment_status, order_status,
      subtotal, shipping_fee, discount_amount, coupon_code, total_amount,
      courier_name, tracking_number, internal_notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    order2Id,
    'STY-2026-9844',
    null,
    'Sara Khan',
    'sara.khan@gmail.com',
    '03009876543',
    'Sindh',
    'Karachi',
    'Clifton Block 4',
    'Apartment 6B, Seaview Luxury Towers',
    'Leave with building security if unavailable',
    'cod',
    'pending',
    'processing',
    14500,
    0,
    500,
    'WELCOME500',
    14000,
    'Leopards Courier',
    'LEO-5541892',
    'Customer confirmed via call. Dispatched to hub.',
    '2026-10-27T11:45:00Z',
    '2026-10-27T15:00:00Z'
  );

  db.prepare(`
    INSERT INTO order_items (
      id, order_id, product_id, variant_id, product_title, product_sku,
      size, color_name, unit_price, quantity, total_price, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'itm_02',
    order2Id,
    'prod_w01',
    'var_prod_w01_1',
    'Mulberry Silk Column Evening Dress',
    'STY-W-DR-001',
    'S',
    'Champagne Gold',
    14500,
    1,
    14500,
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80'
  );

  const settings = [
    { key: 'announcement_bar_text', value: 'Complimentary Express Delivery on orders over PKR 5,000 | Use code STYLEORA10 for 10% off' },
    { key: 'free_shipping_threshold', value: '5000' },
    { key: 'standard_shipping_fee', value: '250' },
    { key: 'hero_headline', value: 'Wear Your Confidence' },
    { key: 'hero_subheading', value: 'Impeccable tailoring, pure sustainable fibers, and modern silhouettes crafted for discerning lifestyles.' },
    { key: 'about_story', value: 'Founded in 2024, STYLEORA emerged from a singular conviction: that modern luxury should balance architectural restraint with opulent tactile craftsmanship. Every textile is ethically sourced, from hand-spun silks in Multan to combed Egyptian cottons, cut and finished by seasoned master artisans.' },
    { key: 'contact_phone', value: '+92 42 3578 9100' },
    { key: 'contact_email', value: 'concierge@styleora.com' },
    { key: 'contact_address', value: 'STYLEORA Atelier & Flagship, 42-C Gulberg III, MM Alam Road, Lahore, Pakistan' },
    { key: 'whatsapp_number', value: '+923001122334' },
  ];

  const insertSetting = db.prepare(`
    INSERT INTO site_settings (key, value)
    VALUES (?, ?)
  `);

  for (const s of settings) {
    insertSetting.run(s.key, s.value);
  }

  db.prepare(`
    INSERT INTO newsletter_subscribers (id, email, subscribed_at)
    VALUES (?, ?, ?)
  `).run('nl_01', 'ali.fashion@gmail.com', now);
}
