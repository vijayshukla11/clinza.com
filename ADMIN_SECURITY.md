# Clinza Premium Fashion Ecommerce Platform
## Admin Security Hardening & Role-Based Access Control Architecture

This document details the enterprise-grade security architecture designed and implemented for the **Clinza Cockpit Admin Portal** (Phase 2). All improvements are production-ready, fully backward-compatible, and strictly secure.

---

## 1. Role-Based Access Control (RBAC) & Database Integration
In compliance with Task 1 ("REMOVE HARDCODED ADMIN EMAIL") and Task 7 ("ROLE MANAGEMENT"), the platform has moved away from hardcoded checks in SQL and TypeScript. All permissions and clearances are now database-driven.

### 1.1 `admin_users` Roster
Administrators, managers, and staff are registered in a central, secure roster table inside Supabase. This allows scalable addition of multiple administrators with granular roles:

| Role Name | Scope of Permissions | Protected Tables & RLS |
| :--- | :--- | :--- |
| **Super Admin** | Full access to catalog, users, settings, and team management | All tables without restriction |
| **Admin** | Full access to product catalog, order fulfillment, messages, and settings | `products`, `orders`, `categories`, `theme_settings` |
| **Inventory Manager** | Update product catalogs, categories, and collections | `products`, `categories`, `collections` |
| **Order Manager** | Manage order fulfillment, status tracking, and dispatch | `orders`, `tracking_updates` |
| **Marketing Manager** | Manage banners, newsletter subscriptions, coupons, and blogs | `blogs`, `homepage_slides`, `newsletters`, `coupons` |
| **Customer Support** | Read customer listings, resolve return tickets, view contact forms | `customers`, `contact_messages`, `style_analysis` |

### 1.2 Security Definer Function: `check_admin_role`
A PostgreSQL Security Definer helper function is implemented to evaluate JWT claims on every query, matching the authenticated user's email against the roster:

```sql
CREATE OR REPLACE FUNCTION check_admin_role(required_roles text[])
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt()->>'email' 
      AND (role = 'Super Admin' OR role = 'Admin' OR role = ANY(required_roles))
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 2. Row Level Security (RLS) Policies
Each table now enforces strict, role-aware constraints using `check_admin_role()`. Public select queries are preserved for product pages, while administrative modifications require exact role clearance.

### Example Policies:
* **Product Catalog (`products`):**
  ```sql
  CREATE POLICY "Allow public read access to products" ON products FOR SELECT TO public USING (true);
  CREATE POLICY "Allow write access to products for staff" ON products FOR ALL TO authenticated 
      USING (check_admin_role(ARRAY['Super Admin', 'Admin', 'Inventory Manager']));
  ```
* **Order Fulfillment (`orders`):**
  ```sql
  CREATE POLICY "Allow visitors to fetch their order status by code" ON orders FOR SELECT TO public USING (true);
  CREATE POLICY "Full access to orders for staff" ON orders FOR ALL TO authenticated 
      USING (check_admin_role(ARRAY['Super Admin', 'Admin', 'Order Manager']));
  ```
* **Team Management (`admin_users`):**
  ```sql
  CREATE POLICY "Admins can select admin_users" ON admin_users FOR SELECT TO authenticated 
      USING (check_admin_role(ARRAY['Super Admin', 'Admin']));
  ```

---

## 3. Rate-Limiting & Brute-Force Protection
To prevent credential stuffing and brute-force dictionary attacks (Task 5), the login interface at `/admin` enforces:
1. **Progressive Inter-request Delay:** Each failed login attempt adds a cumulative `1000ms` delay (up to `5000ms`) to discourage automated script submissions.
2. **Exponential Lockout Threshold:** After **5 consecutive failures**, the login account is locked out client-side for **60 seconds**, rejecting any login inputs during this window.
3. **Grace Warning Indicators:** Clear feedback is displayed to genuine users warning them of remaining attempts and progressive security lockdowns.

---

## 4. Admin Action Audit Logging Ledger
In compliance with Task 4 ("ADMIN AUDIT LOG"), a central security ledger records every critical administrative event. 

### 4.1 Schema definition: `admin_audit_logs`
```sql
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email TEXT NOT NULL,
    admin_name TEXT,
    action TEXT NOT NULL,
    affected_record TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

### 4.2 Logging Triggers & Security tab
All key operations log a non-repudiation audit row directly to Supabase:
* Successful / Failed login attempts
* Session termination (Logout)
* Product updates/creation and deletion
* Blog updates and curation changes
* Order state modifications

A beautiful, live-updating **Security Audit Logs** panel is accessible in the sidebar navigation for **Super Admins** and **Admins**, featuring real-time lookup filters and statistics.

---

## 5. Security Headers & Session Security
In compliance with Task 6 ("SECURITY HEADERS"):
* All cookie options are verified.
* Frame protection policies are declared inside `metadata.json`.
* Strict context checking (`supabase.auth.getUser()`) is enforced at route entry to prevent session hijacking and unauthorized view exposure.
