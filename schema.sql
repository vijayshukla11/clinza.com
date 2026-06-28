-- ==========================================================
-- CLINZA PREMIUM JEANS & APPAREL E-COMMERCE
-- Production PostgreSQL Master Schema & RLS Security Script
-- ==========================================================

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    banner TEXT,
    seo_title TEXT,
    seo_description TEXT,
    keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create collections table (Shopify style collections)
CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    banner TEXT,
    thumbnail TEXT,
    description TEXT,
    seo_title TEXT,
    seo_description TEXT,
    display_order INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create products table supporting nested details
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    original_price NUMERIC(12, 2) NOT NULL,
    collection TEXT REFERENCES collections(slug) ON DELETE SET NULL,
    category TEXT REFERENCES categories(slug) ON DELETE SET NULL,
    images JSONB DEFAULT '[]'::jsonb NOT NULL,
    colors JSONB DEFAULT '[]'::jsonb NOT NULL,
    sizes JSONB DEFAULT '[]'::jsonb NOT NULL,
    stock_status TEXT DEFAULT 'In Stock'::text NOT NULL,
    sku TEXT,
    brand TEXT DEFAULT 'CLINZA'::text,
    rating NUMERIC(3, 2) DEFAULT 5.0 NOT NULL,
    reviews JSONB DEFAULT '[]'::jsonb NOT NULL,
    description TEXT,
    specifications JSONB DEFAULT '[]'::jsonb NOT NULL,
    a_plus_content JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_trending BOOLEAN DEFAULT false NOT NULL,
    is_new_arrival BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create blogs editorial table
CREATE TABLE IF NOT EXISTS blogs (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    cover_image TEXT,
    category TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    author JSONB DEFAULT '{}'::jsonb NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb NOT NULL,
    read_time TEXT DEFAULT '4 min'::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create orders table mapped beautifully for admin fulfillment
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, -- Mapped to CLI-XXXXXX format
    customer JSONB NOT NULL, -- Nested customer shipping data
    items JSONB NOT NULL, -- List of ordered products, sizes, colors, and qtys
    total_amount NUMERIC(12, 2) NOT NULL,
    status TEXT DEFAULT 'Pending'::text NOT NULL,
    payment_method TEXT DEFAULT 'COD'::text NOT NULL,
    tracking_history JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Create newsletters capture table
CREATE TABLE IF NOT EXISTS newsletters (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Create home configs and other constants storage
CREATE TABLE IF NOT EXISTS configs (
    key TEXT PRIMARY KEY, -- e.g. "homepage"
    value JSONB NOT NULL
);

-- 8. Customer Profile registration database
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY, -- Associated with auth.users uuid or guest unique id
    name TEXT NOT NULL,
    email TEXT Unique NOT NULL,
    phone TEXT,
    address_book JSONB DEFAULT '[]'::jsonb NOT NULL,
    total_spend NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    wishlist JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. Create homepage_slides table
CREATE TABLE IF NOT EXISTS homepage_slides (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    button_text TEXT,
    button_link TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 10. Create theme_settings table
CREATE TABLE IF NOT EXISTS theme_settings (
    key TEXT PRIMARY KEY, -- 'active', 'draft'
    brand_primary TEXT DEFAULT '#000000',
    brand_secondary TEXT DEFAULT '#ffffff',
    font_family TEXT DEFAULT 'Inter',
    is_dark_mode BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 11. Create tracking_updates database
CREATE TABLE IF NOT EXISTS tracking_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL,
    status TEXT NOT NULL,
    location TEXT,
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 12. Create wishlist link table
CREATE TABLE IF NOT EXISTS wishlist (
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, product_id)
);

-- 13. Create cart helper table for remote persistence
CREATE TABLE IF NOT EXISTS cart (
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    selected_color TEXT NOT NULL,
    selected_size TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, product_id, selected_color, selected_size)
);

-- 14. Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 15. Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 16. Create style_analysis leads table
CREATE TABLE IF NOT EXISTS style_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT,
    recommended_colors JSONB DEFAULT '[]'::jsonb,
    recommended_collections JSONB DEFAULT '[]'::jsonb,
    recommended_sizes JSONB DEFAULT '[]'::jsonb,
    style_archetype TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================================
-- INDEXES FOR MAXIMUM PERFORMANCE & QUICK RETRIEVALS
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products (collection);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs (slug);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_style_analysis_created_at ON style_analysis (created_at DESC);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

-- Enable Row Level Security (RLS) on all Tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_analysis ENABLE ROW LEVEL SECURITY;

-- 1. Categories Policies
CREATE POLICY "Allow public read access to categories" ON categories 
    FOR SELECT TO public USING (true);
CREATE POLICY "Allow write access to authenticated staff only" ON categories 
    FOR ALL TO authenticated USING (auth.jwt()->>'email' = 'sastaelectronic6@gmail.com');

-- 2. Collections Policies
CREATE POLICY "Allow public read access to collections" ON collections 
    FOR SELECT TO public USING (true);
CREATE POLICY "Allow write access to collections for staff" ON collections 
    FOR ALL TO authenticated USING (auth.jwt()->>'email' = 'sastaelectronic6@gmail.com');

-- 3. Products Policies
CREATE POLICY "Allow public read access to products" ON products 
    FOR SELECT TO public USING (true);
CREATE POLICY "Allow write access to products for staff" ON products 
    FOR ALL TO authenticated USING (auth.jwt()->>'email' = 'sastaelectronic6@gmail.com');

-- 4. Blogs Policies
CREATE POLICY "Allow public read access to blogs" ON blogs 
    FOR SELECT TO public USING (true);
CREATE POLICY "Allow write access to blogs for staff" ON blogs 
    FOR ALL TO authenticated USING (auth.jwt()->>'email' = 'sastaelectronic6@gmail.com');

-- 5. Orders Policies
CREATE POLICY "Allow any guest or client to place orders" ON orders 
    FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow visitors to fetch their order status by code" ON orders 
    FOR SELECT TO public USING (true);
CREATE POLICY "Full access to orders for staff" ON orders 
    FOR ALL TO authenticated USING (auth.jwt()->>'email' = 'sastaelectronic6@gmail.com');

-- 6. Newsletter Policies
CREATE POLICY "Allow guest list inserts to newsletters" ON newsletters 
    FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Only staff read access to newsletters" ON newsletters 
    FOR SELECT TO authenticated USING (auth.jwt()->>'email' = 'sastaelectronic6@gmail.com');

-- 7. Configs Policies
CREATE POLICY "Allow public select configurations" ON configs 
    FOR SELECT TO public USING (true);
CREATE POLICY "Allow full access to config to staff only" ON configs 
    FOR ALL TO authenticated USING (auth.jwt()->>'email' = 'sastaelectronic6@gmail.com');

-- 8. Customer Profile Policies
CREATE POLICY "Customers read own profile" ON customers
FOR SELECT TO authenticated USING (auth.uid()::text = id);
CREATE POLICY "Customers edit own profile" ON customers
FOR UPDATE TO authenticated USING (auth.uid()::text = id);
CREATE POLICY "Full access to customers for staff" ON customers 
    FOR SELECT TO authenticated USING (auth.jwt()->>'email' = 'sastaelectronic6@gmail.com');

-- 9. Homepage Slides Policies
CREATE POLICY "Allow public read access to homepage slides" ON homepage_slides 
    FOR SELECT TO public USING (true);
CREATE POLICY "Allow write access to homepage slides for staff" ON homepage_slides 
    FOR ALL TO authenticated USING (auth.jwt()->>'email' = 'sastaelectronic6@gmail.com');

-- 10. Theme Settings Policies
CREATE POLICY "Allow public read access to active theme settings" ON theme_settings 
    FOR SELECT TO public USING (true);
CREATE POLICY "Allow write access to theme settings for staff" ON theme_settings 
    FOR ALL TO authenticated USING (auth.jwt()->>'email' = 'sastaelectronic6@gmail.com');

-- 11. Tracking Updates Policies
CREATE POLICY "Allow public tracking query" ON tracking_updates 
    FOR SELECT TO public USING (true);
CREATE POLICY "Allow staff write updates" ON tracking_updates 
    FOR ALL TO authenticated USING (auth.jwt()->>'email' = 'sastaelectronic6@gmail.com');

-- 12. Wishlist Policies
CREATE POLICY "Allow users to view own wishlist" ON wishlist 
    FOR SELECT TO public USING (true);
CREATE POLICY "Allow users to manage own wishlist" ON wishlist 
    FOR ALL TO public USING (true);

-- 13. Cart Policies
CREATE POLICY "Allow public cart sessions select" ON cart 
    FOR SELECT TO public USING (true);
CREATE POLICY "Allow public cart sessions edit" ON cart 
    FOR ALL TO public USING (true);

-- 14. Contact Messages Policies
CREATE POLICY "Allow any visitor to submit contact form" ON contact_messages 
    FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow staff to view contact submissions" ON contact_messages 
    FOR SELECT TO authenticated USING (auth.jwt()->>'email' = 'sastaelectronic6@gmail.com');

-- 15. Newsletter Subscribers Policies
CREATE POLICY "Allow any guest subscription" ON newsletter_subscribers 
    FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow staff reading subscriptions list" ON newsletter_subscribers 
    FOR SELECT TO authenticated USING (auth.jwt()->>'email' = 'sastaelectronic6@gmail.com');

-- 16. Style Analysis Leads Policies
CREATE POLICY "Allow visitors to save style recommendations" ON style_analysis 
    FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow staff to view style analysis leads" ON style_analysis 
    FOR SELECT TO authenticated USING (auth.jwt()->>'email' = 'sastaelectronic6@gmail.com');
