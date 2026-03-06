'ENDOFFILE'
# Banau Monorepo

Banau is a modern, multi-tenant SaaS e-commerce platform built with Turborepo, NestJS, Vite + React, Prisma, and PostgreSQL. Each tenant gets their own subdomain-based storefront, a full-featured merchant dashboard, staff management, and Stripe-powered payments — all from a single codebase.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [Backend API Routes](#backend-api-routes)
  - [Auth](#auth)
  - [User](#user)
  - [Tenant](#tenant)
  - [Tenant Settings](#tenant-settings)
  - [Products](#products)
  - [Customers](#customers)
  - [Orders & Payments](#orders--payments)
  - [Staff Management](#staff-management)
  - [Public Storefront Products](#public-storefront-products)
  - [Admin](#admin)
- [Frontend Routes](#frontend-routes)
  - [Auth Pages](#auth-pages)
  - [Merchant Dashboard](#merchant-dashboard)
  - [Super Admin Panel](#super-admin-panel)
  - [Public Storefront](#public-storefront)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Testing, Linting & Formatting](#testing-linting--formatting)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Image Storage (Cloudinary)](#image-storage-cloudinary)
- [Custom Domain & CORS](#custom-domain--cors)
- [Packages](#packages)
- [Useful Links](#useful-links)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Backend | NestJS (Node.js) |
| Frontend | Vite + React + TanStack Router |
| Database ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (access + refresh tokens, HTTP-only cookies) |
| Payments | Stripe (Payment Intents + Checkout Sessions + Webhooks) |
| Image Storage | Cloudinary |
| Shared Types | `@repo/shared` (DTOs shared between backend & frontend) |
| Caching | Redis |
| Email | Nodemailer / SMTP |
| Containerisation | Docker + Docker Compose |

---

## Project Structure

\`\`\`
apps/
  backend/          # NestJS API (monolithic, multi-tenant)
  frontend/         # Vite + React (subdomain-aware storefront + dashboards)
packages/
  db/               # Prisma schema, migrations, and generated client
  shared/           # Shared DTOs and types used by both apps
\`\`\`

---

## Data Models

The following Prisma models power the platform:

| Model | Description |
|---|---|
| `User` | Platform user — roles: SUPER_ADMIN, TENANT_OWNER, TENANT_STAFF, CUSTOMER |
| `Token` | Refresh, email-verification, and password-reset tokens |
| `Tenant` | A merchant store (subdomain, plan, status, published flag) |
| `TenantStaff` | Staff member linked to a tenant with granular per-permission flags |
| `Setting` | Tenant branding & theme (colours, landing page copy, logo, favicon) |
| `Asset` | Cloudinary-stored files (logos, favicons, product images, banners) |
| `Customer` | Storefront customer linked to a tenant |
| `Product` | Tenant product with inventory, SEO, pricing, and variant support |
| `ProductVariant` | Up to 3-level variant options (e.g. Size / Colour / Material) |
| `Order` | Customer order with shipping info, tracking, and Stripe payment data |
| `OrderItem` | Line items for an order, optionally tied to a product variant |

**Enums:** `UserRole` · `TenantStatus` · `Plan` (FREE / BASIC / PREMIUM / ENTERPRISE) · `OrderStatus` (PENDING / PAID / PROCESSING / SHIPPED / DELIVERED / CANCELLED / REFUNDED / FAILED) · `ProductStatus` (DRAFT / ACTIVE / ARCHIVED) · `AssetType` · `TokenType`

---

## Backend API Routes

Base URL: `https://<your-api-domain>`

All protected routes require a valid JWT access token (sent automatically via HTTP-only cookie set at login).

---

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new tenant-owner account |
| `POST` | `/auth/login` | Public | Log in — sets access & refresh cookies |
| `PUT` | `/auth/verify` | Public | Verify email with OTP code |
| `GET` | `/auth/verify-email?token=&id=` | Public | Verify email via magic link |
| `POST` | `/auth/logout` | JWT | Clear auth cookies |
| `POST` | `/auth/refresh` | Refresh token | Rotate access & refresh tokens |

---

### User

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/user/me` | JWT | Get the currently logged-in user's profile |

---

### Tenant

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/tenant` | JWT | Create a new tenant store |
| `GET` | `/tenant` | JWT | Get the owner's tenant details |
| `PATCH` | `/tenant` | JWT | Update tenant name / subdomain / email |
| `DELETE` | `/tenant` | JWT | Delete the tenant store |
| `PUT` | `/tenant/publish` | JWT | Publish / unpublish the storefront |
| `GET` | `/tenant/:subdomain` | Public | Get tenant details by subdomain (used by storefront) |

---

### Tenant Settings

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/tenant/setting` | JWT | Get tenant branding settings |
| `POST` | `/tenant/setting` | JWT | Create settings (logo + favicon upload) |
| `PUT` | `/tenant/setting` | JWT | Update settings (logo + favicon upload) |
| `GET` | `/tenant/setting/asset` | JWT | Get all uploaded assets for the tenant |

---

### Products

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/product` | JWT | List all products (paginated) |
| `POST` | `/product` | JWT | Create a product (with image upload) |
| `GET` | `/product/low-stock?threshold=` | JWT | List products below stock threshold |
| `GET` | `/product/export?format=csv\|xlsx` | JWT | Export products to CSV or XLSX |
| `GET` | `/product/:id` | JWT | Get a product by ID |
| `PUT` | `/product/:id` | JWT | Update a product (with image upload) |
| `DELETE` | `/product/:id` | JWT | Delete a product |
| `POST` | `/product/bulk` | JWT | Bulk import products from a CSV/XLSX file |
| `POST` | `/product/:id/variants` | JWT | Add a variant to a product |
| `PUT` | `/product/:id/variants/:variantId` | JWT | Update a variant |
| `DELETE` | `/product/:id/variants/:variantId` | JWT | Delete a variant |
| `PUT` | `/product/:id/stock` | JWT | Update product stock level |

---

### Customers

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/customers` | JWT | List all customers (paginated) |
| `POST` | `/customers` | JWT | Create a customer manually |
| `GET` | `/customers/export?format=csv\|xlsx` | JWT | Export customers to CSV or XLSX |
| `GET` | `/customers/me` | JWT | Storefront: get own customer profile |
| `PUT` | `/customers/me` | JWT | Storefront: update own customer profile |
| `GET` | `/customers/me/orders` | JWT | Storefront: list own orders |
| `GET` | `/customers/:id` | JWT | Get customer by ID |
| `GET` | `/customers/:id/orders` | JWT | Get orders for a specific customer |
| `PUT` | `/customers/:id` | JWT | Update a customer |
| `DELETE` | `/customers/:id` | JWT | Delete a customer |
| `POST` | `/customers/register` | Public | Storefront: customer self-registration |
| `POST` | `/customers/login` | Public | Storefront: customer login |
| `POST` | `/customers/logout` | Public | Storefront: customer logout |

---

### Orders & Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/order` | JWT | List all orders for the tenant (paginated) |
| `GET` | `/order/export?format=csv\|xlsx` | JWT | Export orders to CSV or XLSX |
| `GET` | `/order/:id` | JWT | Get order by ID |
| `PUT` | `/order/:id/status` | JWT | Update order status |
| `PUT` | `/order/:id/tracking` | JWT | Add tracking number & carrier |
| `POST` | `/order/:id/refund` | JWT | Refund an order |
| `DELETE` | `/order/:id` | JWT | Delete an order |
| `GET` | `/order/my-orders` | JWT | Storefront: list own orders |
| `GET` | `/order/my-orders/:id` | JWT | Storefront: get a specific own order |
| `POST` | `/order/create-payment-intent` | Public | Create a Stripe Payment Intent |
| `POST` | `/order/confirm` | Public | Confirm and place an order |
| `POST` | `/order/create-checkout-session` | Public | Create a Stripe Checkout Session |
| `POST` | `/order/webhook` | Public (Stripe) | Handle incoming Stripe webhook events |

---

### Staff Management

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/staff-management` | JWT + Owner | List all staff members (paginated) |
| `POST` | `/staff-management` | JWT + Owner | Create a staff member directly |
| `GET` | `/staff-management/export?format=csv\|xlsx` | JWT + Owner | Export staff list to CSV or XLSX |
| `POST` | `/staff-management/invite` | JWT + Owner | Send email invitation to a staff member |
| `POST` | `/staff-management/accept-invite` | Public | Accept a staff invitation via token |
| `GET` | `/staff-management/:id` | JWT + Owner | Get staff member by ID |
| `GET` | `/staff-management/:id/activity` | JWT + Owner | Get activity log for a staff member |
| `PUT` | `/staff-management/:id` | JWT + Owner | Update staff permissions |
| `DELETE` | `/staff-management/:id` | JWT + Owner | Remove a staff member |

---

### Public Storefront Products

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/public/:subdomain/products` | Public | List store products (filter, sort, paginate) |
| `GET` | `/public/:subdomain/products/search?q=` | Public | Search products by keyword |
| `GET` | `/public/:subdomain/products/:slug` | Public | Get a single product by slug |

---

### Admin

> Requires `SUPER_ADMIN` role.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/users` | JWT + Admin | List all platform users (paginated) |
| `GET` | `/admin/user/:id` | JWT + Admin | Get a platform user by ID |
| `GET` | `/admin/tenants` | JWT + Admin | List all tenants (paginated) |
| `GET` | `/admin/tenants/:id` | JWT + Admin | Get a tenant by ID |

---

## Frontend Routes

### Auth Pages

| Path | Description |
|---|---|
| `/login` | User login |
| `/register` | New account registration |
| `/verify` | Email OTP verification after registration |
| `/forget-password` | Request a password reset email |
| `/reset-password/$token` | Set a new password via reset token |
| `/accept-invite` | Accept a staff team invitation |

---

### Merchant Dashboard

Base path: `/dashboard` — requires an authenticated `TENANT_OWNER` or `TENANT_STAFF` user.

| Path | Description |
|---|---|
| `/dashboard` | Overview / home |
| `/dashboard/products` | Product list |
| `/dashboard/products/new` | Create a new product |
| `/dashboard/products/$id` | Edit a product |
| `/dashboard/orders` | Order list |
| `/dashboard/orders/$id` | Order detail & status management |
| `/dashboard/customers` | Customer list |
| `/dashboard/customers/new` | Add a customer manually |
| `/dashboard/customers/$id` | Customer detail |
| `/dashboard/staff` | Staff member list |
| `/dashboard/staff/new` | Add a staff member directly |
| `/dashboard/staff/invite` | Invite a staff member by email |
| `/dashboard/staff/$id` | Staff detail & permission management |
| `/dashboard/categories` | Category list |
| `/dashboard/categories/new` | Create a category |
| `/dashboard/categories/$id` | Edit a category |
| `/dashboard/inventory` | Inventory overview |
| `/dashboard/inventory/low-stock` | Low-stock alerts |
| `/dashboard/inventory/adjustments` | Manual stock adjustments |
| `/dashboard/analytics` | Analytics overview |
| `/dashboard/analytics/sales` | Sales analytics |
| `/dashboard/analytics/products` | Product performance |
| `/dashboard/analytics/customers` | Customer analytics |
| `/dashboard/analytics/traffic` | Store traffic |
| `/dashboard/settings` | Settings overview |
| `/dashboard/settings/general` | General store settings |
| `/dashboard/settings/branding` | Branding (logo, colours, favicon) |
| `/dashboard/settings/domain` | Custom domain configuration |
| `/dashboard/settings/billing` | Billing & subscription plan |
| `/dashboard/settings/notifications` | Notification preferences |
| `/dashboard/settings/payments` | Payment gateway configuration |
| `/dashboard/settings/shipping` | Shipping rules |
| `/dashboard/settings/taxes` | Tax configuration |
| `/dashboard/tenants` | Tenant overview |
| `/dashboard/account/profile` | Account profile |
| `/dashboard/account/password` | Change password |
| `/dashboard/account/notifications` | Account notification settings |

---

### Super Admin Panel

Base path: `/admin` — requires `SUPER_ADMIN` role.

| Path | Description |
|---|---|
| `/admin` | Admin dashboard overview |
| `/admin/analytics` | Platform-wide analytics overview |
| `/admin/analytics/growth` | Growth metrics |
| `/admin/analytics/revenue` | Revenue metrics |
| `/admin/tenants` | All tenants list |
| `/admin/tenants/$id` | Tenant detail |
| `/admin/users` | All users list |
| `/admin/users/$id` | User detail |
| `/admin/users/roles` | User role management |
| `/admin/setting/features` | Feature flags |
| `/admin/setting/plans` | Plan management |
| `/admin/setting/system` | System settings |

---

### Public Storefront

Base path: `/s/$subdomain` — publicly accessible, per-tenant storefront.

| Path | Description |
|---|---|
| `/s/$subdomain` | Store home / landing page |
| `/s/$subdomain/products` | Product listing |
| `/s/$subdomain/products/$slug` | Product detail page |
| `/s/$subdomain/categories/$slug` | Category product listing |
| `/s/$subdomain/search` | Search results |
| `/s/$subdomain/cart` | Shopping cart |
| `/s/$subdomain/checkout` | Checkout (Stripe) |
| `/s/$subdomain/checkout/success` | Order success page |
| `/s/$subdomain/checkout/failed` | Payment failed page |
| `/s/$subdomain/about` | Store about page |
| `/s/$subdomain/contact` | Contact page |
| `/s/$subdomain/account` | Customer account area |
| `/s/$subdomain/account/login` | Customer login |
| `/s/$subdomain/account/register` | Customer registration |
| `/s/$subdomain/account/profile` | Customer profile |
| `/s/$subdomain/account/orders` | Customer order history |
| `/s/$subdomain/account/orders/$id` | Customer order detail |
| `/s/$subdomain/account/addresses` | Saved addresses list |
| `/s/$subdomain/account/addresses/new` | Add a new address |
| `/s/$subdomain/account/addresses/$id.edit` | Edit a saved address |

---

## Getting Started

1. **Clone the repository:**

   \`\`\`bash
   git clone <your-repo>
   cd banau
   \`\`\`

2. **Install dependencies:**

   \`\`\`bash
   pnpm install
   \`\`\`

3. **Set up your database:**
   - Create a PostgreSQL database (Neon, Supabase, local Docker, etc.)
   - Copy your connection string.
   - Update `DATABASE_URL` in `packages/db/.env`.

4. **Run migrations / push schema:**
   \`\`\`bash
   pnpm --filter @repo/db db:push
   \`\`\`

5. **Configure environment variables** (see [Environment Variables](#environment-variables)).

---

## Development

- **Start all apps:**
  \`\`\`bash
  pnpm dev
  \`\`\`
- **Start only backend:**
  \`\`\`bash
  pnpm --filter backend dev
  # or
  cd apps/backend && pnpm dev
  \`\`\`
- **Start only frontend:**
  \`\`\`bash
  pnpm --filter frontend dev
  # or
  cd apps/frontend && pnpm dev
  \`\`\`

---

## Building for Production

\`\`\`bash
pnpm build
\`\`\`

---

## Testing, Linting & Formatting

- **Test (frontend):**
  \`\`\`bash
  pnpm --filter frontend test
  \`\`\`
- **Lint:**
  \`\`\`bash
  pnpm lint
  \`\`\`
- **Format:**
  \`\`\`bash
  pnpm format
  \`\`\`

---

## Deployment

### Docker

A `docker-compose.yml` is provided at the root. See [DEPLOYMENT-DOCKER.md](DEPLOYMENT-DOCKER.md) for a full guide.

\`\`\`bash
docker compose up --build
\`\`\`

### Vercel

See [DEPLOYMENT.md](DEPLOYMENT.md) for a step-by-step guide covering environment variables, custom domains, and CORS configuration for Vercel.

### Render (Backend)

The NestJS backend can also be deployed to [Render](https://render.com/). See [apps/backend/RENDER.md](apps/backend/RENDER.md) for Render-specific instructions.

---

## Environment Variables

### Backend (`apps/backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_EXPIRES_IN` | Access token expiry (e.g. `15m`) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (e.g. `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password |
| `FRONTEND_URL` | Frontend origin for CORS & email links |

### Frontend (`apps/frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_APP_TITLE` | App title shown in the browser tab |

### Database package (`packages/db/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |

---

## Image Storage (Cloudinary)

Banau uses [Cloudinary](https://cloudinary.com/) for all media uploads — product images, tenant logos, and favicons. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in the backend `.env`. **Never commit real secrets to version control.**

---

## Custom Domain & CORS

- Add your root domain and wildcard subdomain (`*.yourdomain.com`) in your hosting provider.
- Update allowed CORS origins in `apps/backend/src/main.ts` to match your frontend domain(s).
- See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed configuration steps.

---

## Packages

| Package | Description |
|---|---|
| `@repo/db` | Prisma schema, migrations, and generated Prisma client |
| `@repo/shared` | Shared DTOs, validation schemas, and TypeScript types used by both backend and frontend |

---

## Useful Links

- [DEPLOYMENT.md](DEPLOYMENT.md) — Vercel deployment guide
- [DEPLOYMENT-DOCKER.md](DEPLOYMENT-DOCKER.md) — Docker deployment guide
- [apps/backend/RENDER.md](apps/backend/RENDER.md) — Render deployment guide
- [Prisma](https://www.prisma.io/)
- [NestJS](https://nestjs.com/)
- [Vite](https://vitejs.dev/)
- [TanStack Router](https://tanstack.com/router)
- [Turborepo](https://turbo.build/)
- [Stripe](https://stripe.com/docs)
- [Cloudinary](https://cloudinary.com/documentation)


---