# Complete Route Structure - Frontend & Backend

## 🎯 FRONTEND ROUTES (TanStack Start)

### File Structure
```
apps/web/app/routes/
├── __root.tsx                          # Root layout
├── index.tsx                           # Platform homepage (banau.com)
│
├── (auth)/                             # Auth routes
│   ├── login.tsx                       # Login page
│   ├── signup.tsx                      # Signup page
│   ├── verify-email.tsx                # Email verification
│   ├── forgot-password.tsx             # Forgot password
│   └── reset-password.$token.tsx       # Reset password with token
│
├── (marketing)/                        # Marketing pages
│   ├── about.tsx                       # About us
│   ├── pricing.tsx                     # Pricing plans
│   ├── features.tsx                    # Features
│   ├── contact.tsx                     # Contact us
│   ├── blog/
│   │   ├── index.tsx                   # Blog listing
│   │   └── $slug.tsx                   # Blog post detail
│   ├── help/
│   │   ├── index.tsx                   # Help center
│   │   └── $slug.tsx                   # Help article
│   └── legal/
│       ├── terms.tsx                   # Terms of service
│       ├── privacy.tsx                 # Privacy policy
│       └── refund.tsx                  # Refund policy
│
├── dashboard/                          # Store owner dashboard (Protected)
│   ├── _layout.tsx                     # Dashboard layout
│   ├── index.tsx                       # Dashboard home
│   │
│   ├── products/
│   │   ├── index.tsx                   # Products list
│   │   ├── new.tsx                     # Create product
│   │   ├── $id/
│   │   │   ├── index.tsx               # View product
│   │   │   └── edit.tsx                # Edit product
│   │   └── import.tsx                  # Bulk import products
│   │
│   ├── orders/
│   │   ├── index.tsx                   # Orders list
│   │   ├── $id/
│   │   │   ├── index.tsx               # View order
│   │   │   └── edit.tsx                # Edit order status
│   │   └── export.tsx                  # Export orders
│   │
│   ├── customers/
│   │   ├── index.tsx                   # Customers list
│   │   ├── $id/
│   │   │   ├── index.tsx               # View customer
│   │   │   └── edit.tsx                # Edit customer
│   │   └── export.tsx                  # Export customers
│   │
│   ├── categories/
│   │   ├── index.tsx                   # Categories list
│   │   ├── new.tsx                     # Create category
│   │   └── $id.edit.tsx                # Edit category
│   │
│   ├── inventory/
│   │   ├── index.tsx                   # Inventory overview
│   │   ├── low-stock.tsx               # Low stock alerts
│   │   └── adjustments.tsx             # Stock adjustments
│   │
│   ├── analytics/
│   │   ├── index.tsx                   # Analytics overview
│   │   ├── sales.tsx                   # Sales analytics
│   │   ├── customers.tsx               # Customer analytics
│   │   ├── products.tsx                # Product analytics
│   │   └── traffic.tsx                 # Traffic analytics
│   │
│   ├── staff/
│   │   ├── index.tsx                   # Staff list
│   │   ├── new.tsx                     # Add staff member
│   │   └── $id.edit.tsx                # Edit staff permissions
│   │
│   ├── settings/
│   │   ├── index.tsx                   # Settings overview
│   │   ├── general.tsx                 # General settings
│   │   ├── branding.tsx                # Logo, colors, theme
│   │   ├── domain.tsx                  # Custom domain
│   │   ├── payments.tsx                # Payment settings (Stripe)
│   │   ├── shipping.tsx                # Shipping settings
│   │   ├── taxes.tsx                   # Tax settings
│   │   ├── notifications.tsx           # Email notifications
│   │   └── billing.tsx                 # Subscription & billing
│   │
│   └── account/
│       ├── profile.tsx                 # Owner profile
│       ├── password.tsx                # Change password
│       └── notifications.tsx           # Notification preferences
│
├── admin/                              # Platform admin (Super Admin Only)
│   ├── _layout.tsx                     # Admin layout
│   ├── index.tsx                       # Admin dashboard
│   │
│   ├── tenants/
│   │   ├── index.tsx                   # All tenants
│   │   ├── $id/
│   │   │   ├── index.tsx               # View tenant
│   │   │   └── edit.tsx                # Edit tenant
│   │   └── suspended.tsx               # Suspended tenants
│   │
│   ├── users/
│   │   ├── index.tsx                   # All users
│   │   ├── $id.tsx                     # View user
│   │   └── roles.tsx                   # Role management
│   │
│   ├── analytics/
│   │   ├── index.tsx                   # Platform analytics
│   │   ├── revenue.tsx                 # Revenue analytics
│   │   ├── growth.tsx                  # Growth metrics
│   │   └── churn.tsx                   # Churn analysis
│   │
│   └── settings/
│       ├── plans.tsx                   # Manage plans/pricing
│       ├── features.tsx                # Feature flags
│       └── system.tsx                  # System settings
│
└── s/                                  # Tenant storefronts (Public)
    └── $subdomain/
        ├── _layout.tsx                 # Storefront layout
        ├── index.tsx                   # Store homepage
        │
        ├── shop/
        │   ├── index.tsx               # All products
        │   └── $slug.tsx               # Product detail
        │
        ├── categories/
        │   └── $slug.tsx               # Category products
        │
        ├── cart.tsx                    # Shopping cart
        │
        ├── checkout/
        │   ├── index.tsx               # Checkout form
        │   ├── success.tsx             # Order success
        │   └── failed.tsx              # Payment failed
        │
        ├── account/                    # Customer account (Protected)
        │   ├── login.tsx               # Customer login
        │   ├── register.tsx            # Customer registration
        │   ├── index.tsx               # Account overview
        │   │
        │   ├── orders/
        │   │   ├── index.tsx           # Orders history
        │   │   └── $id.tsx             # Order details
        │   │
        │   ├── addresses/
        │   │   ├── index.tsx           # Saved addresses
        │   │   ├── new.tsx             # Add address
        │   │   └── $id.edit.tsx        # Edit address
        │   │
        │   ├── profile.tsx             # Customer profile
        │   └── password.tsx            # Change password
        │
        ├── pages/
        │   └── $slug.tsx               # Custom pages
        │
        ├── search.tsx                  # Search results
        ├── about.tsx                   # Store about page
        └── contact.tsx                 # Store contact page
```

---

## 🎯 BACKEND ROUTES (NestJS)

### Module Structure
```
apps/api/src/
├── auth/
│   └── auth.controller.ts
├── tenant/
│   └── tenant.controller.ts
├── product/
│   └── product.controller.ts
├── order/
│   └── order.controller.ts
├── customer/
│   └── customer.controller.ts
├── category/
│   └── category.controller.ts
├── staff/
│   └── staff.controller.ts
├── setting/
│   └── setting.controller.ts
├── analytics/
│   └── analytics.controller.ts
├── payment/
│   └── payment.controller.ts
└── admin/
    └── admin.controller.ts
```

### Complete API Endpoints

#### 1. **Authentication** (`/api/auth`)
```typescript
// Public
POST   /api/auth/register              # Register new user
POST   /api/auth/login                 # Login user
POST   /api/auth/refresh               # Refresh access token
POST   /api/auth/logout                # Logout user
POST   /api/auth/forgot-password       # Request password reset
POST   /api/auth/reset-password        # Reset password
POST   /api/auth/verify-email          # Verify email with token
GET    /api/auth/verify-email?token=X  # Verify email (query param)

// Protected
GET    /api/auth/me                    # Get current user
PUT    /api/auth/me                    # Update current user
PUT    /api/auth/password              # Change password
```

#### 2. **Tenant Management** (`/api/tenant`)
```typescript
// Protected (Owner)
GET    /api/tenant                     # Get user's tenant
POST   /api/tenant                     # Create tenant
PUT    /api/tenant                     # Update tenant
DELETE /api/tenant                     # Delete tenant
GET    /api/tenant/check/:subdomain    # Check subdomain availability
PUT    /api/tenant/publish             # Publish/unpublish store
GET    /api/tenant/stats               # Get tenant statistics
```

#### 3. **Tenant Settings** (`/api/tenant/setting`)
```typescript
// Protected (Owner)
GET    /api/tenant/setting             # Get settings
POST   /api/tenant/setting             # Create settings
PUT    /api/tenant/setting             # Update settings
GET    /api/tenant/setting/asset       # Get logo/favicon
```

#### 4. **Products** (`/api/products`)
```typescript
// Protected (Owner/Staff)
GET    /api/products                   # List products
GET    /api/products/:id               # Get product
POST   /api/products                   # Create product
PUT    /api/products/:id               # Update product
DELETE /api/products/:id               # Delete product
POST   /api/products/bulk              # Bulk import
GET    /api/products/export            # Export products

// Product Variants
POST   /api/products/:id/variants      # Add variant
PUT    /api/products/:id/variants/:vid # Update variant
DELETE /api/products/:id/variants/:vid # Delete variant

// Inventory
PUT    /api/products/:id/stock         # Update stock
GET    /api/products/low-stock         # Get low stock products

// Public (Storefront)
GET    /api/public/:subdomain/products         # List store products
GET    /api/public/:subdomain/products/:slug   # Get product by slug
GET    /api/public/:subdomain/products/search  # Search products
```

#### 5. **Categories** (`/api/categories`)
```typescript
// Protected (Owner/Staff)
GET    /api/categories                 # List categories
GET    /api/categories/:id             # Get category
POST   /api/categories                 # Create category
PUT    /api/categories/:id             # Update category
DELETE /api/categories/:id             # Delete category

// Public (Storefront)
GET    /api/public/:subdomain/categories       # List store categories
GET    /api/public/:subdomain/categories/:slug # Get category products
```

#### 6. **Orders** (`/api/orders`)
```typescript
// Protected (Owner/Staff)
GET    /api/orders                     # List orders
GET    /api/orders/:id                 # Get order
PUT    /api/orders/:id/status          # Update order status
PUT    /api/orders/:id/tracking        # Update tracking info
POST   /api/orders/:id/refund          # Process refund
GET    /api/orders/export              # Export orders

// Public (Customer - Protected)
GET    /api/orders/my-orders            # Customer's orders
GET    /api/orders/my-orders/:id       # Customer's order detail

// Public (Checkout)
POST   /api/orders/create-payment-intent # Create Stripe payment intent
POST   /api/orders/confirm              # Confirm order after payment
```

#### 7. **Customers** (`/api/customers`)
```typescript
// Protected (Owner/Staff)
GET    /api/customers                  # List customers
GET    /api/customers/:id              # Get customer
PUT    /api/customers/:id              # Update customer
DELETE /api/customers/:id              # Delete customer
GET    /api/customers/export           # Export customers
GET    /api/customers/:id/orders       # Customer's orders
POST   /api/customers/:id/note         # Add note to customer

// Public (Customer Account)
POST   /api/customers/register         # Customer registration
POST   /api/customers/login            # Customer login
GET    /api/customers/profile          # Get profile
PUT    /api/customers/profile          # Update profile
PUT    /api/customers/password         # Change password
```

#### 8. **Addresses** (`/api/addresses`)
```typescript
// Protected (Customer)
GET    /api/addresses                  # List customer addresses
GET    /api/addresses/:id              # Get address
POST   /api/addresses                  # Create address
PUT    /api/addresses/:id              # Update address
DELETE /api/addresses/:id              # Delete address
PUT    /api/addresses/:id/default      # Set as default
```

#### 9. **Staff Management** (`/api/staff`)
```typescript
// Protected (Owner only)
GET    /api/staff                      # List staff members
GET    /api/staff/:id                  # Get staff member
POST   /api/staff/invite               # Invite staff member
PUT    /api/staff/:id/permissions      # Update permissions
DELETE /api/staff/:id                  # Remove staff member
GET    /api/staff/:id/activity         # Staff activity log
```

#### 10. **Analytics** (`/api/analytics`)
```typescript
// Protected (Owner/Staff with permission)
GET    /api/analytics/overview         # Dashboard overview
GET    /api/analytics/sales            # Sales analytics
GET    /api/analytics/revenue          # Revenue analytics
GET    /api/analytics/customers        # Customer analytics
GET    /api/analytics/products         # Product performance
GET    /api/analytics/traffic          # Traffic analytics
GET    /api/analytics/conversion       # Conversion rates
```

#### 11. **Payment** (`/api/payment`)
```typescript
// Protected (Owner)
POST   /api/payment/connect-stripe     # Connect Stripe account
GET    /api/payment/stripe-status      # Get Stripe connection status
POST   /api/payment/disconnect-stripe  # Disconnect Stripe

// Webhooks
POST   /api/payment/webhook/stripe     # Stripe webhook handler
```

#### 12. **Admin** (`/api/admin`) - Super Admin Only
```typescript
// Tenant Management
GET    /api/admin/tenants              # List all tenants
GET    /api/admin/tenants/:id          # Get tenant
PUT    /api/admin/tenants/:id          # Update tenant
DELETE /api/admin/tenants/:id          # Delete tenant
PUT    /api/admin/tenants/:id/suspend  # Suspend tenant
PUT    /api/admin/tenants/:id/activate # Activate tenant

// User Management
GET    /api/admin/users                # List all users
GET    /api/admin/users/:id            # Get user
PUT    /api/admin/users/:id            # Update user
DELETE /api/admin/users/:id            # Delete user
PUT    /api/admin/users/:id/role       # Change user role

// Platform Analytics
GET    /api/admin/analytics/overview   # Platform overview
GET    /api/admin/analytics/revenue    # Platform revenue
GET    /api/admin/analytics/growth     # Growth metrics
GET    /api/admin/analytics/churn      # Churn analysis

// Settings
GET    /api/admin/settings/plans       # Get pricing plans
PUT    /api/admin/settings/plans       # Update pricing plans
GET    /api/admin/settings/features    # Get feature flags
PUT    /api/admin/settings/features    # Update feature flags
```

#### 13. **Upload** (`/api/upload`)
```typescript
// Protected
POST   /api/upload/image               # Upload single image
POST   /api/upload/images              # Upload multiple images
DELETE /api/upload/:id                 # Delete uploaded file
```

#### 14. **Notifications** (`/api/notifications`)
```typescript
// Protected
GET    /api/notifications              # List notifications
PUT    /api/notifications/:id/read     # Mark as read
PUT    /api/notifications/read-all     # Mark all as read
DELETE /api/notifications/:id          # Delete notification
```

---

## 📊 Route Summary

### Frontend Routes Count:
| Section | Count |
|---------|-------|
| Auth | 5 |
| Marketing | 12 |
| Dashboard | 35 |
| Admin | 10 |
| Storefront | 15 |
| **Total** | **77** |

### Backend Routes Count:
| Module | Count |
|--------|-------|
| Auth | 9 |
| Tenant | 7 |
| Products | 15 |
| Categories | 8 |
| Orders | 11 |
| Customers | 10 |
| Addresses | 6 |
| Staff | 6 |
| Analytics | 7 |
| Payment | 4 |
| Admin | 15 |
| Upload | 3 |
| Notifications | 5 |
| **Total** | **106** |

---

## 🎯 Implementation Priority

### Phase 1 - MVP (Weeks 1-4)
**Frontend:**
- ✅ Login/Signup
- ✅ Dashboard home
- ✅ Products CRUD
- ✅ Tenant settings
- ✅ Storefront homepage
- ✅ Product listing/detail
- ✅ Cart
- ✅ Checkout

**Backend:**
- ✅ Auth endpoints (8)
- ✅ Tenant endpoints (5)
- ✅ Product endpoints (6)
- ✅ Settings endpoints (3)
- ✅ Order endpoints (4)
- ✅ Payment endpoints (2)

### Phase 2 - Core Features (Weeks 5-8)
**Frontend:**
- Orders management
- Customers management
- Categories
- Inventory
- Basic analytics

**Backend:**
- Customer endpoints (8)
- Category endpoints (6)
- Analytics endpoints (4)
- Staff endpoints (4)

### Phase 3 - Advanced (Weeks 9-12)
**Frontend:**
- Staff management
- Advanced analytics
- Admin panel
- Customer accounts
- Notifications

**Backend:**
- Admin endpoints (15)
- Notifications (5)
- Upload endpoints (3)
- Advanced analytics (3)

---

## 🔐 Route Protection

### Public Routes:
- Platform homepage
- Marketing pages
- Storefront (browsing)
- Login/Signup

### Protected Routes:
| Role | Access |
|------|--------|
| **SUPER_ADMIN** | /admin/*, all /api/admin/* |
| **TENANT_OWNER** | /dashboard/*, all /api/* (own tenant) |
| **TENANT_STAFF** | /dashboard/* (limited), /api/* (based on permissions) |
| **CUSTOMER** | /s/:subdomain/account/*, /api/orders/my-orders |

---

## 📁 Files to Create

### Frontend (77 files):
```bash
# Create all route files
mkdir -p apps/web/app/routes/{auth,marketing,dashboard,admin,s}
# ... (use the structure above)
```

### Backend (13 controllers):
```bash
# Create all controllers
mkdir -p apps/api/src/{auth,tenant,product,order,customer,category,staff,setting,analytics,payment,admin,upload,notification}
# ... (use the structure above)
```

This is your complete roadmap! 🚀