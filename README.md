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

### Payload upload storage (required for durable production uploads)

Payload stores gallery images, winner photos, CMS PDFs, and finance uploads locally during development:

- `media/` for gallery images, winner photos, CMS images, and CMS PDFs
- `donor-files/` and `expense-files/` for finance PDFs and Excel files

Those directories are intentionally ignored by Git and are not durable on ephemeral hosts. Production deployments should use Cloudflare R2:

1. Create a bucket and an Object Read & Write API token scoped to that bucket.
2. Add the four `R2_*` credentials from `.env.example` to the deployment environment.
3. Attach an HTTPS custom domain such as `media.example.com` to the bucket and set it as `R2_PUBLIC_URL`. Do not use an `r2.dev` URL in production.
4. Verify the connection before deploying:

```bash
npm run storage:verify
```

New uploads are sent to R2 while their existing Payload URLs stay unchanged. For files created locally before R2 was enabled, copy them once (the command never deletes local files):

```bash
npm run storage:migrate
```

When repairing a production bucket created with an earlier version of this project, first run `npm run storage:migrate -- --dry-run` with the production `DATABASE_URL` and R2 variables, then run `npm run storage:migrate`. This moves legacy object-key paths into the format used by the current Payload S3 adapter.

### Vercel production configuration

Gallery and expense pages read Payload at request time. In **Vercel → Project → Settings → Environment Variables**, add these values to the **Production** environment (and Preview too if previews use the production CMS):

```env
DATABASE_URL=postgresql://...                 # The deployed Payload PostgreSQL database
PAYLOAD_SECRET=<long stable random value>     # Must stay the same across deployments
AUTH_SECRET=<long stable random value>
NEXT_PUBLIC_APP_URL=https://your-domain.com
R2_ACCOUNT_ID=<Cloudflare account ID>
R2_ACCESS_KEY_ID=<R2 API token access key>
R2_SECRET_ACCESS_KEY=<R2 API token secret>
R2_BUCKET=<bucket name>
R2_PUBLIC_URL=https://media.your-domain.com   # Optional, public images only
```

Use an R2 API token with **Object Read & Write** access limited to this bucket. The `R2_*` variables are server-only: never use `NEXT_PUBLIC_` versions. Run the Payload database migrations against the same production `DATABASE_URL` before deploying; a local database is not available to Vercel.

Expense files are downloaded through `/api/expense-files/file/...`; the application reads them server-side with the R2 credentials. Do not set their database `url` values to an R2 S3 endpoint.
