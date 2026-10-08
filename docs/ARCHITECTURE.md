# BusinessOS Architecture

BusinessOS is structured as a multi-vertical SaaS platform, not a restaurant POS with extra screens.

## Layers

1. SaaS platform layer
   - Tenants, branches, users, roles, modules, subscriptions, billing, audit, notifications.

2. Business solution layer
   - POS, orders, products, inventory, suppliers, customers, staff, reports.

3. Storefront builder layer
   - Public catalog, cart, checkout, section builder, themes, publishing.

## Active Source Structure

- `packages/domain`: business types, module catalog, plan pricing, and pure policy helpers. Next compiles its TypeScript source as ESM; Nest consumes its CommonJS build.
- `apps/api/src/common`: authentication, tenant/branch/role/module guards, and Prisma access.
- `apps/api/src/modules`: controllers and services for operations, subscriptions, storefronts, and platform administration.
- `apps/api/prisma`: PostgreSQL schema and reviewed migrations.
- `apps/web/app`: routes and server-side data loading; `apps/web/components`: feature views and shared UI controls; `apps/web/lib`: typed API access.
- `apps/web/app/api`: same-origin login and backend proxy routes. The browser receives an HTTP-only session cookie; the API authorizes each request.

The root `src/` browser prototype is retained for reference and is not deployed.

## Data and Deployment

Tenant-owned rows carry a tenant key. Branch workflows check assignment and branch stock before mutation. Orders and purchase receipts update stock and movement records in database transactions. Storefront editing uses a draft with an explicit published snapshot; live product and branch-stock data come from the same catalog as POS.

The Docker recipe packages both applications and runs Prisma migrations before API startup. It is an example topology, not evidence of production certification. Operational and product gaps are tracked in [REQUIREMENT-COVERAGE.md](REQUIREMENT-COVERAGE.md).
