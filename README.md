# BusinessOS Bangladesh

Multi-tenant commerce operations software for Bangladesh. The active application is a pnpm monorepo: Next.js in `apps/web`, NestJS in `apps/api`, PostgreSQL/Prisma in `apps/api/prisma`, and business/module configuration in `packages/domain`. The root `src/` is an older browser prototype and is not the deployable application.

## Implemented

- Tenant login, roles, branch-aware API access, owner/admin user invitations and suspension, module entitlements, subscription review, and platform administration.
- Planned modules are visible but cannot be activated or billed; existing demo entitlements are reconciled by migration.
- Restaurant, pharmacy, grocery, and other business-type configuration from the shared domain package.
- POS checkout with catalog photos, barcode-ready search, local payment-method records, due sales, tax/service charge, transactional branch stock deduction, and browser-printable receipts.
- Product creation, stock adjustments, customer/supplier/staff directories, purchase receiving, stock movement ledger, order history, and sales reports.
- Restaurant tables, dine-in orders, kitchen tickets, status transitions, and table settlement.
- Persisted drag-and-drop storefront section editor; public product catalog, branch stock, cart, and pending pay-on-delivery/pickup ordering.
- PostgreSQL migrations, audit entries and an owner/admin audit viewer, health endpoint, and a production build that starts from the emitted NestJS artifact.

## Local setup

Use Node.js 20+, pnpm 9, and a **local PostgreSQL** database. Set `DATABASE_URL`, `JWT_SECRET`, and `WEB_ORIGIN=http://localhost:3100` in `apps/api/.env` (see `apps/api/.env.example`). The web server uses `API_URL=http://localhost:4000` by default.

```powershell
pnpm install --frozen-lockfile
pnpm --filter @businessos/api prisma:generate
pnpm --filter @businessos/api exec prisma migrate deploy
pnpm dev
```

Open `http://localhost:3100`; API health is at `http://localhost:4000/api/health`.

`pnpm dev` does not regenerate Prisma Client on every restart because Windows can keep Prisma's query engine DLL locked while a previous Node process is shutting down. Run `pnpm prisma:generate` only after `pnpm install` or after changing `apps/api/prisma/schema.prisma`, and make sure the API dev server is stopped first.

The demo seed **deletes existing tenant data** and is blocked unless `ALLOW_DESTRUCTIVE_DEMO_SEED=1` is explicitly set in a non-production environment. Do not run it against a working database. `prisma:seed-demo-owners` is a separate non-destructive repair command for existing ABC demo tenants. The platform-admin seed requires explicit credentials. Never ship demo accounts or seed passwords into production.

## Verification

```powershell
pnpm typecheck
pnpm build
pnpm test:unit
pnpm --filter @businessos/api exec prisma migrate status
$env:SMOKE_EMAIL="owner@abcrestaurant.bd"; $env:SMOKE_PASSWORD="<local-demo-password>"; pnpm test:smoke
```

The read-only smoke script verifies protected API/web routes, cross-tenant/branch denial, invalid-order handling, and public product photos. A separate local manual workflow exercised a POS sale, public pending order, purchase receipt with stock reconciliation, table order, kitchen transitions, and table settlement. This is **not** a comprehensive automated test suite.

## Deployment

`Dockerfile` and `compose.deploy.yml` package the current app and apply migrations on API startup. Copy `.env.deploy.example` to a private `.env.deploy`, replace every secret, and run:

```powershell
docker compose --env-file .env.deploy -f compose.deploy.yml up --build -d
```

The containers bind to loopback; put a TLS reverse proxy in front of the web service. Configure backups, alerting, log aggregation, secret rotation, SMTP/SMS, and payment integrations for the target environment. Test restore and rollout/rollback procedures before using real customer data.
The API refuses production startup with an example/short JWT secret or a non-HTTPS `WEB_ORIGIN`.

## Not yet production-complete

The original requirement covers considerably more than the implemented workflows. The following remain open and must not be represented as working: payment-gateway capture/reconciliation and recurring billing, returns/refunds, native silent printer integration, offline POS synchronization, pharmacy prescription and batch-level dispensing controls, recipe/BOM costing, grocery scale integration, branch transfers, customer accounts/order tracking, delivery dispatch, and full accessibility/cross-browser visual QA. Distributed public order/login rate limiting, automated integration/e2e tests, and security review are required before public launch. The current code is a functional foundation, **not a fully certified or error-free production platform**.

See [the requirement coverage audit](docs/REQUIREMENT-COVERAGE.md), [production audit](docs/PRODUCTION-AUDIT.md), and [quality/design review](docs/QUALITY-AND-DESIGN-REVIEW.md) for feature-by-feature status and release blockers.
