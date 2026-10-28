import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from './db';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  authenticate,
  optionalAuthenticate,
  requireAdmin,
  type AuthenticatedRequest,
} from './auth';
import { validatePakistanPhone, validateEmail, validateCheckoutForm } from '../src/utils/validation';
import { calculateOrderTotals } from '../src/utils/pricing';

export const apiRouter = Router();

// ==========================================
// 1. STORE SETTINGS & METRICS
// ==========================================

apiRouter.get('/settings', (_req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM site_settings').all() as Array<{ key: string; value: string }>;
    const settings: Record<string, any> = {};
    for (const r of rows) {
      if (r.key.includes('threshold') || r.key.includes('fee')) {
        settings[r.key] = Number(r.value);
      } else {
        settings[r.key] = r.value;
      }
    }
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/settings', requireAdmin, (req, res) => {
  try {
    const updates = req.body;
    const stmt = db.prepare(`
      INSERT INTO site_settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    for (const [key, val] of Object.entries(updates)) {
      stmt.run(key, String(val));
    }
    res.json({ success: true, message: 'Store settings updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. AUTHENTICATION & CUSTOMER ACCOUNT
// ==========================================

apiRouter.post('/auth/register', (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid full name' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    let formattedPhone = '';
    if (phone) {
      const phoneVal = validatePakistanPhone(phone);
      if (!phoneVal.isValid) {
        return res.status(400).json({ error: phoneVal.error });
      }
      formattedPhone = phoneVal.formatted;
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const { hash, salt } = hashPassword(password);
    const userId = `usr_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, salt, name, phone, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'customer', ?)
    `).run(userId, email.toLowerCase().trim(), hash, salt, name.trim(), formattedPhone, now);

    const token = generateToken({
      userId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role: 'customer',
    });

    res.json({
      token,
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        phone: formattedPhone,
        role: 'customer',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    const valid = verifyPassword(password, user.password_hash, user.salt);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/auth/me', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?').get(req.user!.userId) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/user/profile', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const { name, phone } = req.body;
    let formattedPhone = phone;
    if (phone) {
      const phoneVal = validatePakistanPhone(phone);
      if (!phoneVal.isValid) {
        return res.status(400).json({ error: phoneVal.error });
      }
      formattedPhone = phoneVal.formatted;
    }

    db.prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?')
      .run(name || null, formattedPhone || null, req.user!.userId);

    const updated = db.prepare('SELECT id, email, name, phone, role FROM users WHERE id = ?').get(req.user!.userId);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Addresses
apiRouter.get('/user/addresses', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const rows = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC').all(req.user!.userId);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/user/addresses', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const { full_name, phone, province, city, area, address, is_default } = req.body;
    const phoneVal = validatePakistanPhone(phone);
    if (!phoneVal.isValid) {
      return res.status(400).json({ error: phoneVal.error });
    }

    const addrId = `addr_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const now = new Date().toISOString();

    if (is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user!.userId);
    }

    db.prepare(`
      INSERT INTO addresses (id, user_id, full_name, phone, province, city, area, address, is_default, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(addrId, req.user!.userId, full_name, phoneVal.formatted, province, city, area, address, is_default ? 1 : 0, now);

    res.json({ id: addrId, message: 'Address saved' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. CATEGORIES
// ==========================================

apiRouter.get('/categories', (_req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY display_order ASC, name ASC').all();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/categories', requireAdmin, (req, res) => {
  try {
    const { name, gender, description, image_url, is_featured, display_order } = req.body;
    if (!name || !gender) {
      return res.status(400).json({ error: 'Category name and gender are required' });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `cat_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`;

    db.prepare(`
      INSERT INTO categories (id, name, slug, gender, description, image_url, is_featured, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, slug, gender, description || '', image_url || '', is_featured ? 1 : 0, display_order || 0);

    res.json({ id, slug, message: 'Category created' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/categories/:id', requireAdmin, (req, res) => {
  try {
    const { name, gender, description, image_url, is_featured, display_order } = req.body;
    db.prepare(`
      UPDATE categories SET
        name = COALESCE(?, name),
        gender = COALESCE(?, gender),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        is_featured = COALESCE(?, is_featured),
        display_order = COALESCE(?, display_order)
      WHERE id = ?
    `).run(name, gender, description, image_url, is_featured, display_order, req.params.id);

    res.json({ success: true, message: 'Category updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/admin/categories/:id', requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. PRODUCTS & CATALOG
// ==========================================

apiRouter.get('/products', (req, res) => {
  try {
    const {
      gender,
      category,
      subcategory,
      search,
      sort,
      minPrice,
      maxPrice,
      featured,
      newArrivals,
      bestSellers,
      size,
      color,
      limit = '24',
      page = '1',
    } = req.query;

    let sql = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'published'
    `;
    const params: any[] = [];

    if (gender && gender !== 'all') {
      sql += " AND (p.gender = ? OR p.gender = 'unisex')";
      params.push(gender);
    }

    if (category) {
      sql += ' AND (c.slug = ? OR p.category_id = ?)';
      params.push(category, category);
    }

    if (subcategory) {
      sql += ' AND p.subcategory = ?';
      params.push(subcategory);
    }

    if (featured === 'true' || featured === '1') {
      sql += ' AND p.is_featured = 1';
    }

    if (newArrivals === 'true' || newArrivals === '1') {
      sql += ' AND p.is_new_arrival = 1';
    }

    if (bestSellers === 'true' || bestSellers === '1') {
      sql += ' AND p.is_best_seller = 1';
    }

    if (minPrice) {
      sql += ' AND COALESCE(p.sale_price, p.regular_price) >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      sql += ' AND COALESCE(p.sale_price, p.regular_price) <= ?';
      params.push(Number(maxPrice));
    }

    if (search) {
      const q = `%${String(search).trim()}%`;
      sql += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.sku LIKE ? OR p.fabric LIKE ?)';
      params.push(q, q, q, q);
    }

    if (size) {
      sql += ' AND p.id IN (SELECT product_id FROM product_variants WHERE size = ? AND stock_quantity > 0)';
      params.push(size);
    }

    if (color) {
      sql += ' AND p.id IN (SELECT product_id FROM product_variants WHERE color_name LIKE ? AND stock_quantity > 0)';
      params.push(`%${color}%`);
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        sql += ' ORDER BY COALESCE(p.sale_price, p.regular_price) ASC';
        break;
      case 'price-desc':
        sql += ' ORDER BY COALESCE(p.sale_price, p.regular_price) DESC';
        break;
      case 'popularity':
      case 'best-selling':
        sql += ' ORDER BY p.total_sales DESC, p.rating DESC';
        break;
      case 'rating':
        sql += ' ORDER BY p.rating DESC, p.review_count DESC';
        break;
      case 'newest':
      default:
        sql += ' ORDER BY p.created_at DESC';
        break;
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 24);
    const offset = (pageNum - 1) * limitNum;

    // Total count query
    const countSql = `SELECT COUNT(*) as total FROM (${sql})`;
    const countRow = db.prepare(countSql).get(...params) as { total: number };
    const total = countRow ? countRow.total : 0;

    sql += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const products = db.prepare(sql).all(...params) as any[];

    // Fetch images and variant colors for product card presentation
    const getImages = db.prepare('SELECT url, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC');
    const getVariants = db.prepare('SELECT size, color_name, color_code, stock_quantity FROM product_variants WHERE product_id = ?');

    const enriched = products.map((prod) => {
      const images = getImages.all(prod.id) as any[];
      const variants = getVariants.all(prod.id) as any[];
      return {
        ...prod,
        images,
        variants,
        primary_image: images[0]?.url || 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
        available_colors: Array.from(new Set(variants.map((v) => JSON.stringify({ name: v.color_name, code: v.color_code })))).map((s) => JSON.parse(s)),
        available_sizes: Array.from(new Set(variants.map((v) => v.size))),
        in_stock: variants.some((v) => v.stock_quantity > 0),
      };
    });

    res.json({
      products: enriched,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Single Product Details
apiRouter.get('/products/:slugOrId', (req, res) => {
  try {
    const slugOrId = req.params.slugOrId;
    const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? OR p.id = ?
    `).get(slugOrId, slugOrId) as any;

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const images = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC').all(product.id) as any[];
    const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ? ORDER BY size ASC').all(product.id) as any[];
    const reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC').all(product.id) as any[];

    // Related products in the same category
    const related = db.prepare(`
      SELECT p.*, (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      WHERE p.category_id = ? AND p.id != ? AND p.status = 'published'
      LIMIT 4
    `).all(product.category_id, product.id);

    res.json({
      ...product,
      images,
      variants,
      reviews,
      related,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. ADMIN PRODUCT MANAGEMENT
// ==========================================

apiRouter.get('/admin/products', requireAdmin, (req, res) => {
  try {
    const { search, category, status } = req.query;
    let sql = `
      SELECT p.*, c.name as category_name,
             (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id) as total_stock,
             (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      sql += ' AND (p.title LIKE ? OR p.sku LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      sql += ' AND p.category_id = ?';
      params.push(category);
    }
    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY p.created_at DESC';
    const products = db.prepare(sql).all(...params);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/products', requireAdmin, (req, res) => {
  try {
    const {
      title,
      sku,
      description,
      gender,
      category_id,
      subcategory,
      regular_price,
      sale_price,
      cost_price,
      fabric,
      fit,
      care_instructions,
      occasion,
      is_featured,
      is_new_arrival,
      is_best_seller,
      status = 'published',
      images = [],
      variants = [],
    } = req.body;

    if (!title || !sku || !regular_price || !category_id) {
      return res.status(400).json({ error: 'Title, SKU, Price, and Category are required' });
    }

    const id = `prod_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + id.substring(5, 9);
    const now = new Date().toISOString();

    db.exec('BEGIN TRANSACTION;');

    db.prepare(`
      INSERT INTO products (
        id, sku, title, slug, description, gender, category_id, subcategory,
        regular_price, sale_price, cost_price, fabric, fit, care_instructions,
        occasion, is_featured, is_new_arrival, is_best_seller, status,
        rating, review_count, total_sales, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 0, 0, ?, ?)
    `).run(
      id, sku, title, slug, description || '', gender || 'unisex', category_id, subcategory || '',
      Number(regular_price), sale_price ? Number(sale_price) : null, Number(cost_price || 0),
      fabric || '', fit || '', care_instructions || '', occasion || '',
      is_featured ? 1 : 0, is_new_arrival ? 1 : 0, is_best_seller ? 1 : 0, status,
      now, now
    );

    // Images
    const insertImg = db.prepare('INSERT INTO product_images (id, product_id, url, is_primary, display_order) VALUES (?, ?, ?, ?, ?)');
    images.forEach((imgUrl: string, idx: number) => {
      insertImg.run(`img_${id}_${idx}`, id, imgUrl, idx === 0 ? 1 : 0, idx);
    });

    // Variants
    const insertVar = db.prepare('INSERT INTO product_variants (id, product_id, size, color_name, color_code, sku, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    variants.forEach((v: any, idx: number) => {
      const varId = `var_${id}_${idx}`;
      const varSku = v.sku || `${sku}-${v.size}-${(v.color_name || 'DEF').substring(0, 3).toUpperCase()}`;
      insertVar.run(varId, id, v.size, v.color_name || 'Standard', v.color_code || '#1A1A1A', varSku, Number(v.stock_quantity || 0), images[0] || '');
    });

    db.exec('COMMIT;');
    res.json({ id, slug, message: 'Product created successfully' });
  } catch (err: any) {
    try { db.exec('ROLLBACK;'); } catch {}
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/products/:id', requireAdmin, (req, res) => {
  try {
    const id = req.params.id;
    const {
      title,
      sku,
      description,
      gender,
      category_id,
      subcategory,
      regular_price,
      sale_price,
      cost_price,
      fabric,
      fit,
      care_instructions,
      occasion,
      is_featured,
      is_new_arrival,
      is_best_seller,
      status,
    } = req.body;

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE products SET
        title = COALESCE(?, title),
        sku = COALESCE(?, sku),
        description = COALESCE(?, description),
        gender = COALESCE(?, gender),
        category_id = COALESCE(?, category_id),
        subcategory = COALESCE(?, subcategory),
        regular_price = COALESCE(?, regular_price),
        sale_price = ?,
        cost_price = COALESCE(?, cost_price),
        fabric = COALESCE(?, fabric),
        fit = COALESCE(?, fit),
        care_instructions = COALESCE(?, care_instructions),
        occasion = COALESCE(?, occasion),
        is_featured = COALESCE(?, is_featured),
        is_new_arrival = COALESCE(?, is_new_arrival),
        is_best_seller = COALESCE(?, is_best_seller),
        status = COALESCE(?, status),
        updated_at = ?
      WHERE id = ?
    `).run(
      title, sku, description, gender, category_id, subcategory,
      regular_price !== undefined ? Number(regular_price) : null,
      sale_price !== undefined ? (sale_price ? Number(sale_price) : null) : null,
      cost_price !== undefined ? Number(cost_price) : null,
      fabric, fit, care_instructions, occasion,
      is_featured !== undefined ? (is_featured ? 1 : 0) : null,
      is_new_arrival !== undefined ? (is_new_arrival ? 1 : 0) : null,
      is_best_seller !== undefined ? (is_best_seller ? 1 : 0) : null,
      status, now, id
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/admin/products/:id', requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. INVENTORY MANAGEMENT
// ==========================================

apiRouter.get('/admin/inventory', requireAdmin, (req, res) => {
  try {
    const { lowStock } = req.query;
    let sql = `
      SELECT v.*, p.title as product_title, p.sku as product_sku, p.regular_price,
             (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image_url
      FROM product_variants v
      JOIN products p ON v.product_id = p.id
    `;
    if (lowStock === 'true' || lowStock === '1') {
      sql += ' WHERE v.stock_quantity <= 5';
    }
    sql += ' ORDER BY v.stock_quantity ASC';
    const variants = db.prepare(sql).all();
    res.json(variants);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/inventory/adjust', requireAdmin, (req, res) => {
  try {
    const { variant_id, new_quantity, reason } = req.body;
    if (!variant_id || new_quantity === undefined || new_quantity < 0) {
      return res.status(400).json({ error: 'Valid variant ID and positive quantity required' });
    }

    const variant = db.prepare('SELECT stock_quantity FROM product_variants WHERE id = ?').get(variant_id) as any;
    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    const previousStock = variant.stock_quantity;
    const change = Number(new_quantity) - previousStock;
    const now = new Date().toISOString();

    db.exec('BEGIN TRANSACTION;');

    db.prepare('UPDATE product_variants SET stock_quantity = ? WHERE id = ?').run(Number(new_quantity), variant_id);

    db.prepare(`
      INSERT INTO inventory_logs (id, variant_id, previous_stock, new_stock, change_amount, reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `inv_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`,
      variant_id, previousStock, Number(new_quantity), change, reason || 'Admin manual adjustment', now
    );

    db.exec('COMMIT;');
    res.json({ success: true, previousStock, newStock: Number(new_quantity) });
  } catch (err: any) {
    try { db.exec('ROLLBACK;'); } catch {}
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. COUPONS
// ==========================================

apiRouter.post('/coupons/validate', (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Please enter a coupon code' });
    }

    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(code.toUpperCase().trim()) as any;
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ error: 'This coupon code has expired' });
    }

    if (coupon.usage_limit > 0 && coupon.times_used >= coupon.usage_limit) {
      return res.status(400).json({ error: 'This coupon usage limit has been reached' });
    }

    const orderSubtotal = Number(subtotal || 0);
    if (orderSubtotal < coupon.min_order_amount) {
      return res.status(400).json({
        error: `Coupon requires a minimum order amount of PKR ${coupon.min_order_amount.toLocaleString()}`,
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((orderSubtotal * coupon.discount_value) / 100);
      if (coupon.max_discount_amount > 0) {
        discount = Math.min(discount, coupon.max_discount_amount);
      }
    } else {
      discount = Math.min(orderSubtotal, coupon.discount_value);
    }

    res.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: discount,
      message: `Coupon applied! You saved PKR ${discount.toLocaleString()}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/admin/coupons', requireAdmin, (_req, res) => {
  try {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
    res.json(coupons);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/admin/coupons', requireAdmin, (req, res) => {
  try {
    const { code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, expires_at } = req.body;
    if (!code || !discount_type || !discount_value) {
      return res.status(400).json({ error: 'Code, type, and discount value are required' });
    }

    const id = `cpn_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO coupons (id, code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, expires_at, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      id, code.toUpperCase().trim(), discount_type, Number(discount_value),
      Number(min_order_amount || 0), Number(max_discount_amount || 0),
      Number(usage_limit || 100), expires_at || null, now
    );

    res.json({ id, message: 'Coupon created successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/admin/coupons/:id', requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. ORDERS & CHECKOUT (TRANSACTION SAFE)
// ==========================================

apiRouter.post('/orders', optionalAuthenticate, (req: AuthenticatedRequest, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      province,
      city,
      area,
      address,
      deliveryInstructions,
      paymentMethod = 'cod',
      items,
      couponCode,
    } = req.body;

    // 1. Validate Form
    const validation = validateCheckoutForm({
      fullName,
      email,
      phone,
      province,
      city,
      area,
      address,
      paymentMethod,
    });

    if (!validation.isValid) {
      return res.status(400).json({ error: 'Please correct checkout errors', details: validation.errors });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty. Please add items to checkout.' });
    }

    // 2. Server-side revalidation of stock and prices
    const preparedItems: any[] = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      if (!item.variantId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: 'Invalid items in cart' });
      }

      const variant = db.prepare(`
        SELECT v.*, p.title as product_title, p.sku as product_sku, p.regular_price, p.sale_price,
               (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image_url
        FROM product_variants v
        JOIN products p ON v.product_id = p.id
        WHERE v.id = ?
      `).get(item.variantId) as any;

      if (!variant) {
        return res.status(400).json({ error: `Selected item variant not found` });
      }

      if (variant.stock_quantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${variant.product_title}" (${variant.size} - ${variant.color_name}). Only ${variant.stock_quantity} left in stock.`,
        });
      }

      const unitPrice = variant.sale_price !== null && variant.sale_price !== undefined ? variant.sale_price : variant.regular_price;
      const lineTotal = unitPrice * item.quantity;
      calculatedSubtotal += lineTotal;

      preparedItems.push({
        variant,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      });
    }

    // 3. Revalidate Coupon on server
    let discountAmount = 0;
    let validatedCoupon: any = null;

    if (couponCode) {
      const cpn = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(couponCode.toUpperCase().trim()) as any;
      if (cpn && (!cpn.expires_at || new Date(cpn.expires_at) >= new Date()) && calculatedSubtotal >= cpn.min_order_amount) {
        validatedCoupon = cpn;
        if (cpn.discount_type === 'percentage') {
          discountAmount = Math.round((calculatedSubtotal * cpn.discount_value) / 100);
          if (cpn.max_discount_amount > 0) {
            discountAmount = Math.min(discountAmount, cpn.max_discount_amount);
          }
        } else {
          discountAmount = Math.min(calculatedSubtotal, cpn.discount_value);
        }
      }
    }

    // 4. Calculate Shipping Fee based on site settings
    const freeShippingRow = db.prepare("SELECT value FROM site_settings WHERE key = 'free_shipping_threshold'").get() as any;
    const standardFeeRow = db.prepare("SELECT value FROM site_settings WHERE key = 'standard_shipping_fee'").get() as any;
    const freeThreshold = Number(freeShippingRow?.value || 5000);
    const standardFee = Number(standardFeeRow?.value || 250);

    const shippingFee = calculatedSubtotal >= freeThreshold ? 0 : standardFee;
    const totalAmount = calculatedSubtotal - discountAmount + shippingFee;

    // 5. Generate unique human-readable order number (e.g. STY-2026-8924)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `STY-2026-${randomSuffix}`;
    const orderId = `ord_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const now = new Date().toISOString();
    const userId = req.user?.userId || null;
    const phoneVal = validatePakistanPhone(phone);

    // 6. Execute atomic database transaction
    db.exec('BEGIN TRANSACTION;');

    db.prepare(`
      INSERT INTO orders (
        id, order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_province, shipping_city, shipping_area, shipping_address,
        delivery_instructions, payment_method, payment_status, order_status,
        subtotal, shipping_fee, discount_amount, coupon_code, total_amount,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId, orderNumber, userId, fullName.trim(), email.toLowerCase().trim(), phoneVal.formatted,
      province, city.trim(), area.trim(), address.trim(),
      deliveryInstructions || null, paymentMethod,
      calculatedSubtotal, shippingFee, discountAmount, validatedCoupon ? validatedCoupon.code : null, totalAmount,
      now, now
    );

    const insertItem = db.prepare(`
      INSERT INTO order_items (
        id, order_id, product_id, variant_id, product_title, product_sku,
        size, color_name, unit_price, quantity, total_price, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateVariantStock = db.prepare('UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?');
    const updateProductSales = db.prepare('UPDATE products SET total_sales = total_sales + ? WHERE id = ?');
    const insertInvLog = db.prepare(`
      INSERT INTO inventory_logs (id, variant_id, previous_stock, new_stock, change_amount, reason, order_id, created_at)
      VALUES (?, ?, ?, ?, ?, 'order_placement', ?, ?)
    `);

    for (const prep of preparedItems) {
      const itemId = `itm_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`;
      insertItem.run(
        itemId, orderId, prep.variant.product_id, prep.variant.id,
        prep.variant.product_title, prep.variant.sku, prep.variant.size, prep.variant.color_name,
        prep.unitPrice, prep.quantity, prep.lineTotal, prep.variant.image_url || ''
      );

      // Decrement stock
      updateVariantStock.run(prep.quantity, prep.variant.id);
      updateProductSales.run(prep.quantity, prep.variant.product_id);

      // Inventory log
      insertInvLog.run(
        `inv_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`,
        prep.variant.id, prep.variant.stock_quantity, prep.variant.stock_quantity - prep.quantity, -prep.quantity,
        orderId, now
      );
    }

    if (validatedCoupon) {
      db.prepare('UPDATE coupons SET times_used = times_used + 1 WHERE id = ?').run(validatedCoupon.id);
    }

    db.exec('COMMIT;');

    res.json({
      success: true,
      orderId,
      orderNumber,
      totalAmount,
      subtotal: calculatedSubtotal,
      shippingFee,
      discountAmount,
      customerName: fullName,
      customerEmail: email,
      customerPhone: phoneVal.formatted,
      message: 'Order placed successfully! We will contact you to verify before dispatch.',
    });
  } catch (err: any) {
    try { db.exec('ROLLBACK;'); } catch {}
    res.status(500).json({ error: err.message });
  }
});

// Public Order Tracking
apiRouter.get('/orders/track/:orderNumber', (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { phone } = req.query;

    let query = 'SELECT * FROM orders WHERE order_number = ?';
    const params: any[] = [orderNumber.toUpperCase().trim()];

    if (phone) {
      const phoneVal = validatePakistanPhone(String(phone));
      if (phoneVal.isValid) {
        query += ' AND customer_phone = ?';
        params.push(phoneVal.formatted);
      }
    }

    const order = db.prepare(query).get(...params) as any;
    if (!order) {
      return res.status(404).json({ error: 'Order not found. Please verify your order number and phone.' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    res.json({ ...order, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Authenticated Customer Order History
apiRouter.get('/user/orders', authenticate, (req: AuthenticatedRequest, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user!.userId) as any[];
    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    const enriched = orders.map((o) => ({
      ...o,
      items: getItems.all(o.id),
    }));
    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Cancel Request
apiRouter.post('/orders/:id/cancel', optionalAuthenticate, (req: AuthenticatedRequest, res) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Authorization check: either admin or order owner
    if (order.user_id && req.user?.userId !== order.user_id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to cancel this order' });
    }

    if (order.order_status === 'shipped' || order.order_status === 'delivered') {
      return res.status(400).json({ error: 'Orders that have already been shipped cannot be cancelled directly. Please initiate an exchange or return request.' });
    }

    if (order.order_status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' });
    }

    const now = new Date().toISOString();

    db.exec('BEGIN TRANSACTION;');

    db.prepare(`
      UPDATE orders SET
        order_status = 'cancelled',
        cancellation_reason = ?,
        updated_at = ?
      WHERE id = ?
    `).run(reason || 'Customer requested cancellation', now, orderId);

    // Restock variants safely
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId) as any[];
    const updateStock = db.prepare('UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?');
    const insertInvLog = db.prepare(`
      INSERT INTO inventory_logs (id, variant_id, previous_stock, new_stock, change_amount, reason, order_id, created_at)
      VALUES (?, ?, ?, ?, ?, 'order_cancellation', ?, ?)
    `);

    for (const itm of items) {
      const v = db.prepare('SELECT stock_quantity FROM product_variants WHERE id = ?').get(itm.variant_id) as any;
      if (v) {
        updateStock.run(itm.quantity, itm.variant_id);
        insertInvLog.run(
          `inv_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`,
          itm.variant_id, v.stock_quantity, v.stock_quantity + itm.quantity, itm.quantity,
          orderId, now
        );
      }
    }

    db.exec('COMMIT;');
    res.json({ success: true, message: 'Order has been cancelled and inventory restored.' });
  } catch (err: any) {
    try { db.exec('ROLLBACK;'); } catch {}
    res.status(500).json({ error: err.message });
  }
});

// Customer Return Request
apiRouter.post('/orders/:id/return', optionalAuthenticate, (req, res) => {
  try {
    const orderId = req.params.id;
    const { returnReason } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.order_status !== 'delivered') {
      return res.status(400).json({ error: 'Returns can only be requested for delivered orders within 14 days.' });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE orders SET
        return_status = 'requested',
        return_reason = ?,
        updated_at = ?
      WHERE id = ?
    `).run(returnReason || 'Exchange/Return requested by customer', now, orderId);

    res.json({ success: true, message: 'Return request submitted. Our concierge team will contact you within 24 hours.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. ADMIN ORDER MANAGEMENT
// ==========================================

apiRouter.get('/admin/orders', requireAdmin, (req, res) => {
  try {
    const { status, search, paymentMethod } = req.query;
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ' AND order_status = ?';
      params.push(status);
    }
    if (paymentMethod && paymentMethod !== 'all') {
      sql += ' AND payment_method = ?';
      params.push(paymentMethod);
    }
    if (search) {
      sql += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR customer_email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';
    const orders = db.prepare(sql).all(...params) as any[];
    const getItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');

    const enriched = orders.map((o) => ({
      ...o,
      items: getItems.all(o.id),
    }));

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/admin/orders/:id/status', requireAdmin, (req, res) => {
  try {
    const orderId = req.params.id;
    const { order_status, payment_status, courier_name, tracking_number, internal_notes, return_status } = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE orders SET
        order_status = COALESCE(?, order_status),
        payment_status = COALESCE(?, payment_status),
        courier_name = COALESCE(?, courier_name),
        tracking_number = COALESCE(?, tracking_number),
        internal_notes = COALESCE(?, internal_notes),
        return_status = COALESCE(?, return_status),
        updated_at = ?
      WHERE id = ?
    `).run(order_status, payment_status, courier_name, tracking_number, internal_notes, return_status, now, orderId);

    res.json({ success: true, message: 'Order status updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. REVIEWS & TESTIMONIALS
// ==========================================

apiRouter.post('/reviews', optionalAuthenticate, (req: AuthenticatedRequest, res) => {
  try {
    const { product_id, customer_name, rating, title, comment } = req.body;
    if (!product_id || !customer_name || !rating || !comment) {
      return res.status(400).json({ error: 'Please provide all review fields' });
    }

    const revId = `rev_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO reviews (id, product_id, user_id, customer_name, rating, title, comment, is_verified_purchase, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(revId, product_id, req.user?.userId || null, customer_name, Number(rating), title || '', comment, now);

    // Recalculate product rating
    const stats = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as cnt FROM reviews WHERE product_id = ?').get(product_id) as any;
    db.prepare('UPDATE products SET rating = ?, review_count = ? WHERE id = ?')
      .run(stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : 5.0, stats.cnt, product_id);

    res.json({ success: true, id: revId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 11. NEWSLETTER & CONTACT
// ==========================================

apiRouter.post('/newsletter', (req, res) => {
  try {
    const { email } = req.body;
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM newsletter_subscribers WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.json({ success: true, message: 'You are already subscribed to the STYLEORA Gazette.' });
    }

    db.prepare('INSERT INTO newsletter_subscribers (id, email, subscribed_at) VALUES (?, ?, ?)')
      .run(`nl_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`, cleanEmail, new Date().toISOString());

    res.json({
      success: true,
      message: 'Welcome to the STYLEORA Atelier Gazette. Use code STYLEORA10 for 10% off your first order.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/admin/newsletter', requireAdmin, (_req, res) => {
  try {
    const list = db.prepare('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC').all();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/contact', (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    db.prepare(`
      INSERT INTO contact_messages (id, name, email, phone, subject, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'new', ?)
    `).run(
      `msg_${crypto.randomUUID().replace(/-/g, '').substring(0, 10)}`,
      name, email, phone || '', subject || 'General Inquiry', message, new Date().toISOString()
    );

    res.json({ success: true, message: 'Thank you for contacting STYLEORA Concierge. We will reply within 24 hours.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/admin/contact-messages', requireAdmin, (_req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 12. ADMIN ANALYTICS & REPORTS
// ==========================================

apiRouter.get('/admin/reports', requireAdmin, (_req, res) => {
  try {
    const totalOrdersRow = db.prepare('SELECT COUNT(*) as count FROM orders').get() as any;
    const totalRevenueRow = db.prepare("SELECT SUM(total_amount) as sum FROM orders WHERE order_status != 'cancelled'").get() as any;
    const pendingOrdersRow = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'pending'").get() as any;
    const processingOrdersRow = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'processing'").get() as any;
    const deliveredOrdersRow = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'delivered'").get() as any;
    const cancelledOrdersRow = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'cancelled'").get() as any;
    const totalProductsRow = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
    const lowStockRow = db.prepare('SELECT COUNT(*) as count FROM product_variants WHERE stock_quantity <= 5').get() as any;

    const topSelling = db.prepare(`
      SELECT p.id, p.title, p.sku, p.total_sales, p.regular_price,
             (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image_url
      FROM products p
      ORDER BY p.total_sales DESC
      LIMIT 5
    `).all();

    const revenueByCategory = db.prepare(`
      SELECT c.name as category_name, SUM(oi.total_price) as category_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_status != 'cancelled'
      GROUP BY c.id
    `).all();

    const recentOrders = db.prepare(`
      SELECT id, order_number, customer_name, total_amount, order_status, payment_method, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 8
    `).all();

    res.json({
      metrics: {
        totalOrders: totalOrdersRow.count,
        totalRevenue: totalRevenueRow.sum || 0,
        pendingOrders: pendingOrdersRow.count,
        processingOrders: processingOrdersRow.count,
        deliveredOrders: deliveredOrdersRow.count,
        cancelledOrders: cancelledOrdersRow.count,
        totalProducts: totalProductsRow.count,
        lowStockItems: lowStockRow.count,
      },
      topSelling,
      revenueByCategory,
      recentOrders,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
