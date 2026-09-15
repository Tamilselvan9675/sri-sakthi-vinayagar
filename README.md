# Sakthi Vinayagar Temple Management Platform

A highly robust, production-ready, internationalized (i18n), modular-monolith web application built specifically to manage temple operations, festival logistics, event winners, public galleries, and structured financial contributions.

## 📖 Project Overview

This platform enables the Temple Administration to seamlessly broadcast dynamic, year-wise festival details, upcoming Poojas, winners of competitions, and media galleries to the public in both **Tamil and English**. Simultaneously, it houses a highly secure Admin Dashboard for Finance Managers and Administrators to track ad-hoc donations, calculate recurring member contributions, and maintain immutable audit logs of all financial transactions.

---

## 🏗 Architecture & Stack

### Technology Stack
- **Framework:** Next.js (App Router, Server Actions, Server Components)
- **Language:** Strict TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Styling:** Tailwind CSS + `shadcn/ui` + `next-themes` (Dark/Light mode)
- **Authentication:** Auth.js (NextAuth)
- **Forms & Validation:** React Hook Form + Zod
- **Financial Processing:** `decimal.js` (Zero floating-point inaccuracies)
- **Document Generation:** `@react-pdf/renderer`

### Modular Monolith Architecture
The codebase is structured defensively by domain to ensure maintainability:
- `/src/app/[locale]/` - Contains public-facing pages and locale-aware routing.
- `/src/app/[locale]/admin/` - Secure routes protected by Middleware and Server-Side role checks.
- `/src/features/` - Isolated domain business logic (e.g., `finance`, `auth`).
- `/src/lib/payments/` - Abstracted strategy patterns for payment gateways.

---

## 🔐 Roles and Permissions (RBAC)

The system leverages four distinct roles enforced via server-side checks and Next.js middleware:
1. **`SUPER_ADMIN`**: Unrestricted access to system configuration and all modules.
2. **`ADMIN`**: Can manage festivals, events, winners, and media.
3. **`FINANCE_MANAGER`**: Can verify manual UPI payments, log expenses, generate PDF receipts, and view contribution balances.
4. **`EDITOR`**: Restricted to basic content management (Poojas, Events, Gallery).

---

## 💰 Finance & Payment Architectures

### 1. Database Architecture (Financials)
The schema (`schema.prisma`) separates non-financial data from strictly auditable financial records.
- All monetary fields use `Decimal @db.Decimal(10,2)` mapped via `decimal.js` to prevent precision loss.
- **Audit Logs:** Any mutation to financial records writes to an immutable `AuditLog` table ensuring 100% transparency.

### 2. Payment Architecture
A decoupled `PaymentService` (`/src/lib/payments`) sits between the database and payment gateways.
- Uses the **Strategy Pattern** (e.g., `ManualUpiProvider`).
- Readily supports future integrations (Razorpay, Stripe) by simply extending the `PaymentProvider` interface.
- Standardizes webhook verifications and state transitions (`PENDING` → `COMPLETED`).

### 3. Finance & Contribution Architecture
Strictly separated from ad-hoc Temple `Donation`s, the `/features/finance` domain handles recurring community pledges.
- **`ContributionCalculator`**: A test-driven service evaluating if members are `PAID`, `PARTIAL`, or `OVERDUE`.
- **Compliance**: The engine actively rejects negative balances and interest generation to remain compliant and avoid accidental lending regulations.

### 4. WhatsApp Architecture
A fully abstracted `WhatsAppService` is staged for outbound communications.
- Integrates via `IWhatsAppProvider`.
- Ready to be wired into a CRON job to automatically dispatch Due Reminders and Payment Receipts.

---

## 🚀 Setup & Development

### 1. Environment Variables
Copy `.env.example` to `.env.local` and populate:
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/sakthi_vinayagar?schema=public"

# Auth.js
AUTH_SECRET="your_generated_secret_here" # Run: npx auth secret

# App Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Database Setup & Migrations
```bash
# Generate the Prisma Client (Outputs to /src/generated/prisma)
npx prisma generate

# Push the schema to your development database
npx prisma db push

# (Optional) Seed the database with default Admin user
npm run seed
```

### 3. Development Commands
```bash
# Start the development server
npm run dev

# Run TypeScript strict checks
npx tsc --noEmit

# Run ESLint
npx eslint src/
```

### 4. Testing
Run the Node.js domain test suites (e.g., verifying the finance state machine):
```bash
npx tsx src/scripts/test-finance.ts
npx tsx src/scripts/test-payments.ts
```

---

## 📦 Production Deployment

### 1. Production Build
Ensure all TypeScript and Zod schemas pass before building.
```bash
npm run build
```

### 2. Start Production Server
```bash
npm start
```

### Deployment Instructions (Vercel / VPS)
- Ensure the Node.js environment is `v18.17+`.
- Run `npx prisma generate` as a pre-build step.
- Ensure the `DATABASE_URL` is accessible from the production server.
- The `AUTH_SECRET` must be set in the production environment variables, otherwise Auth.js will throw a runtime error.
- Static assets and localized routes (`/en`, `/ta`) are pre-rendered where possible using `sitemap.ts` to maximize SEO.
