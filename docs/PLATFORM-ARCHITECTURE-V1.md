# BusinessOS Bangladesh: target platform architecture

Status: architecture baseline, 2026-10-08. This document describes the target system and the migration path from the current implementation. It does not claim that planned capabilities are live.

## 1. Product architecture

**Product promise:** one tenant workspace for daily commerce, with a common operating core and optional vertical workflows. A business may run one or more branches, a public storefront, and a site built from the same catalog. Platform administration is a separate control plane within the same product.

**Personas and primary jobs:** owner (setup, performance, subscription, access), manager (branch operations and approvals), cashier/sales staff (fast, reliable checkout), inventory/purchasing staff (stock and receiving), accountant (reconciliation), specialist (kitchen or pharmacist), and shopper (browse, order, track). Start each persona at a task-focused workspace with only authorized actions. Keep setup progressive; a new tenant should reach a first valid sale without configuring every module.

**Product surfaces:** tenant operations, platform administration, and public storefront. English and Bangla are complete interface locales, not a tenant name setting. Persist language preference per user, fall back to tenant preference, and format BDT, dates, phone numbers, and receipts for Bangladesh. Store timestamps in UTC and display `Asia/Dhaka`. Tax, pharmacy, and payment-provider details require Bangladesh-specific legal and commercial review before release.

**Experience rule:** one design system, routing system, identity system, and data model. Business type supplies a recommended starting profile; tenant settings and entitlements determine the actual experience. Product copy and UI must distinguish recorded cash/manual payment from verified electronic settlement.

## 2. System architecture

Keep the current pnpm monorepo: `apps/web` (Next.js 14), `apps/api` (NestJS 10), `packages/domain` (shared types, module catalog, pure policy), and `apps/api/prisma` (PostgreSQL schema and migrations). The root `src/` and `database-schema.sql` are historical prototypes, not runtime or migration sources.

Use a modular monolith while the domains share transactional data. Web server components call the API; browser mutations use the same-origin Next.js proxy and HTTP-only session cookie; the API is the authorization and business-rule boundary. Add a durable job queue and worker process for notifications, exports, image processing, webhooks, and reconciliation. Publish domain events through a transactional outbox, after the business transaction commits. External providers use adapters behind the API, never direct browser-to-database writes. Split a service only when operational load or ownership justifies the extra distributed consistency cost.

Request path: browser -> TLS edge -> Next.js -> authenticated API -> domain service -> PostgreSQL transaction. Public storefront traffic enters a separate public route policy, but uses the same catalog, pricing, stock, and order services. Cache only content that is safe to share; key tenant-specific cache entries by tenant and publication/version.

## 3. Domain architecture

**Shared aggregates:** Tenant/Branch/Identity, Catalog, Stock, Purchase, Sale/Order, Payment, Party (Customer/Supplier), Subscription/Entitlement, Storefront/Publication, and Audit. Orders have channel and fulfillment as independent concepts; a restaurant table order and an online pickup order still share the core order and payment ledger. Separate staff directory records from login accounts, with an optional explicit link when an employee also has access.

**Invariants:** a sale references one tenant and one branch; every item belongs to that tenant; accepted quantity cannot exceed sellable branch stock; each stock change has a movement and source reference; an order's paid, due, refunded, and net amounts reconcile to payment/return entries; money uses decimal arithmetic and explicit rounding; state transitions are validated server-side; retries cannot create duplicate sales or charges. Stock availability, order acceptance, payment capture, and subscription entitlement are distinct states.

**Vertical extensions:** restaurant adds table, ticket, station, recipe/modifier and service flows; pharmacy adds medicine, batch/expiry, prescription approval and dispensing evidence; grocery adds measured quantity, pack conversion and scale/barcode input; electronics adds serial/warranty; bakery/sweets add production batch and expiry; supplier-led businesses add procurement and payable workflows. Extensions attach to shared Product/Order/Stock IDs. Regulated or high-integrity fields get typed tables, constraints, and audit trails; JSON attributes are only for low-risk display/custom fields.

## 4. Database architecture

The source of truth is `apps/api/prisma/schema.prisma` plus reviewed migrations. Existing tables already cover tenant, branch, user, entitlements, subscription/manual payment, product, branch balance/movement, supplier/purchase, customer, order/item/payment, staff, restaurant tables/tickets, storefront, and audit. Monetary columns are decimal; inventory quantities are decimal. The root SQL draft must not drive production migrations.

**Target relational rules:** every tenant-owned row carries `tenantId`; branch-owned rows also carry `branchId`. Add composite tenant-scoped foreign keys or equivalent database constraints so an order cannot point to another tenant's customer/product/branch. Ensure `(tenantId, branchId, productId)` consistency for stock. Use tenant-scoped unique keys for SKU, order number, and business-facing codes. Keep immutable order item price/name snapshots. Introduce typed `Return`/`ReturnLine`, `PaymentAttempt`/`Settlement`, `StockLot` where required, `StockTransfer`, `CashSession`, `SubscriptionInvoice`, `EntitlementHistory`, `SiteRevision`, `DomainVerification`, and `OutboxEvent` incrementally as the workflows ship.

**Tenancy model:** shared PostgreSQL database and schema initially, with application-enforced tenant filters on every query and mutation. The current global tenant guard validates route IDs but does not scope every relation automatically. Add a request-scoped tenant/branch context and repository/query helpers, then test cross-tenant IDs for every nested resource. Evaluate PostgreSQL row-level security as defense in depth only after transaction-local context and connection-pool behavior are proven. Platform support access is explicit, limited, audited, and never implicit tenant membership.

**Migration discipline:** additive columns/tables -> backfill and reconcile -> dual-read/write only where necessary -> switch reads -> enforce `NOT NULL`, unique and foreign-key constraints -> remove old fields later. Run migrations against a production-sized clone, take a backup, and verify rollback/restore. Keep `Product.stock` aligned with the sum of branch balances until it can safely become a derived value. Reconcile historical balances and payment records before constraints are tightened. Index tenant + branch + cursor for operational lists; partition very large append-only ledgers only after measurement.

## 5. Module architecture

Separate three questions: **is the capability shipped?** (`moduleCatalog.available`), **has the tenant paid or received an entitlement?** (`TenantModule` plus subscription limits), and **may this user perform this action here?** (permission and branch scope). All three must pass server-side. The current catalog correctly marks pharmacy workflow, barcode/scale, CRM, multi-branch operations, and marketing unavailable; keep them unbillable and inaccessible until implemented and tested. Dependencies must be explicit (for example, website builder requires storefront; kitchen relies on orders). Feature rollout flags are operational controls and never substitutes for entitlement or permission.

Each module owns controllers, services, DTOs, migrations, events, permission definitions, navigation metadata, and tests within the existing monorepo. Shared aggregates remain owned by one core module. Extensions subscribe to domain events or call stable application services; they do not duplicate catalog, checkout, or stock logic. Module activation checks plan limits, business compatibility, dependencies, and implementation availability atomically.

## 6. Business-type configuration model

`packages/domain` already defines ten types: restaurant, cafe, cloudKitchen, pharmacy, grocery, superShop, bakery, retail, electronics, cosmetics. Map mini marts to grocery/superShop, sweet shops to bakery, accessories/lifestyle/general retail to retail, and supplier-based businesses to retail plus procurement settings. Add a first-class profile only when its data model or workflow genuinely differs, with a controlled enum/database migration. Do not create a new app or forked POS.

Configuration is versioned and validated: profile ID, capability presets, module recommendations, product schema, units, order state machine, dashboard widgets, receipt/storefront template, setup checklist, and policy defaults. Store per-tenant overrides separately from profile defaults, with a resolved configuration snapshot for each request. A profile change requires a compatibility check and reversible migration of affected data. Never enable a regulated workflow through a boolean alone; pharmacy dispensing requires a complete verified workflow and authorization.

## 7. RBAC model

Current roles are owner, admin, manager, cashier, inventoryManager, salesStaff, accountant, kitchenStaff, pharmacist, deliveryStaff, plus platformAdmin. Keep owner/admin roles as defaults, but move toward named permissions such as `sale.create`, `sale.return.approve`, `inventory.adjust`, `purchase.receive`, `report.view`, `site.publish`, `subscription.manage`, and `user.invite`. A role grants permissions; a branch assignment constrains data; module entitlement constrains capability. Deny by default. Backend checks are authoritative; navigation only reflects the decision.

| Principal | Default scope | Key authority |
| --- | --- | --- |
| Owner | Tenant and permitted branches | Business configuration, billing, access, approvals |
| Admin | Tenant or assigned branches | Operations, users, site; billing only if explicitly delegated |
| Manager | Assigned branches | Sales, receiving, returns and branch approvals |
| Cashier / sales staff | Assigned branch | Checkout and limited order/customer access |
| Inventory manager | Assigned branches | Catalog, stock, purchasing |
| Accountant | Explicit tenant/branch scope | Reconciliation and financial reports |
| Kitchen / pharmacist / delivery | Assigned branch and workflow | Only specialist actions; pharmacist approval is separate from sale |
| Platform admin | Platform control plane | Tenant lifecycle and payment review; support access is separately granted and logged |

The current route-role decorators are a useful baseline, but branch checks and read permissions are inconsistent across services. Put scope enforcement in a shared authorization service, audit each controller and nested mutation, and add an allow/deny matrix test per role, module, tenant, and branch. Invitations, suspension, session revocation, recovery, and MFA are part of account lifecycle; do not equate `StaffMember` with a login user.

## 8. Subscription model

Keep plans and module add-ons as one catalog with versioned prices in BDT. The current Starter/Business prices and manual platform-admin review are an initial billing workflow, not automated recurring billing. Model `PlanVersion`, `PriceVersion`, `Subscription`, period, trial/grace/past-due/cancel states, tenant limits, `Entitlement`, invoice, payment attempt, settlement, and immutable billing events. A price change applies to new periods according to an explicit policy; issued invoices do not change retrospectively.

Entitlements are calculated from a paid or approved subscription plus trial policy, module availability, dependencies, quantity limits, and expiry. Avoid updating a module flag and subscription amount without a corresponding billing event. Provider webhooks are authenticated, replay-safe, and idempotent. Manual bank/MFS submissions remain `pending` until verified by an authorized reviewer; a typed review records reference, evidence, reviewer, and timestamp. Grace behavior must specify read access, export access, storefront visibility, and mutation restrictions before launch.

## 9. Storefront architecture

There is one storefront per tenant today, with a published JSON snapshot, published slug, live catalog and branch stock, cart, and pending delivery/pickup ordering. Keep draft and published state distinct. Public storefront resolution checks published state, active tenant, subscription, entitlement, and verified slug/domain. Add custom domain ownership proof and TLS provisioning before routing traffic. Cache published layout by version; load price/availability through bounded tenant-scoped queries so checkout always revalidates stock, price, fulfillment, and customer data server-side.

Online order placement needs explicit idempotency and anti-abuse controls, address/zone eligibility, fulfillment quote, confirmation, and shopper status lookup with unguessable access. Do not mark manual bKash/Nagad/Rocket/card references as captured funds. Hosted payment adapters or verified manual review determine settlement status; refunds follow the original rail where supported. A pharmacy storefront must hide restricted items until legal and prescription processes are validated.

## 10. Website-builder architecture

Extend the existing drag-reorder editor, section DTO, and published snapshot. Define a versioned, allowlisted page schema: page -> ordered section instances -> typed settings/content bindings -> theme tokens. Sections render from a fixed component registry; user content never executes arbitrary HTML, JavaScript, or CSS. Use catalog/category/branch references rather than copying products into page JSON. Store draft revisions, author, timestamp, and a compact publish history; publish validates schema, assets, links, accessibility fields, and subscription permission, then atomically replaces the published revision. Rollback selects a prior revision and republishes it.

Support keyboard reorder alongside drag, responsive preview widths, undo, autosave with conflict detection, image upload to private object storage before publication, alt text, link validation, and a readable empty state. Site themes and templates are business-type suggestions, not separate rendering engines. The current editor has section ordering and basic theme controls; custom pages, assets, domain management, revisions, and richer responsive controls remain planned.

## 11. API architecture

Preserve NestJS resource modules and same-origin web proxy. Version new public and tenant contracts under `/api/v1` while maintaining existing routes during migration. Use DTO validation at ingress, typed response contracts, bounded cursor pagination, filtering/sort allowlists, and consistent problem responses with a request ID. Use idempotency keys for sale, purchase receiving, public checkout, payment capture, and webhook processing. Use optimistic version checks or guarded updates for conflicting state changes. Never trust `tenantId`, price, amount, branch, or status from the client without server-side verification.

Keep read models for dashboards/reports separate from transactional writes. Move full-collection reads and in-memory report aggregation to indexed queries or bounded materialized summaries. Publish events only after commit through the outbox. Document API permissions and tenant/branch scope beside every endpoint; generate OpenAPI from controllers and test the client contract in CI. Retain server-side render and loading/error/empty patterns already present in Next.js.

## 12. Security architecture

Authentication uses existing JWT validation and an HTTP-only, Secure, SameSite cookie at the web layer. Add short-lived access sessions with rotation/revocation, login recovery, optional/required MFA by role, and suspicious-login monitoring. Keep platform identities separate from tenant accounts. Review CSRF protection for cookie-authenticated mutation routes, proxy path allowlisting, CORS, content security policy, upload validation, SSRF-safe image fetching, stored-content sanitization, and safe domain verification.

Tenant isolation is enforced in authorization, service queries, database constraints, cache keys, object storage paths, background jobs, exports, and logs. Encrypt secrets and sensitive documents at rest, use TLS in transit, restrict DB credentials, and redact payment/prescription data from logs. Apply distributed rate limiting to login, invitation, checkout, public order lookup, and webhook endpoints. Audit access grants, financial mutations, pharmacy approvals, support access, and publication. Define retention/deletion policies and incident response with legal review. Threat-model POS devices, public ordering, provider callbacks, and the builder before release.

## 13. Scalability architecture

Start with stateless web/API replicas, managed PostgreSQL, Redis for distributed limits/queue/cache, and object storage/CDN for media. Scale on measured traffic; a modular monolith preserves local transactions. Use tenant/branch/cursor indexes, bounded queries and exports, connection-pool limits, read replicas only for tolerably stale reporting, and precomputed aggregates for heavy dashboards. Track p95 latency, error rate, DB saturation, queue lag, stock conflicts, checkout retries, and per-tenant hot spots. Load-test POS spikes and public campaigns at a stated tenant/order volume before promising a 10,000-business target.

For resilience, use idempotent consumers, dead-letter queues, retry budgets, backup plus point-in-time recovery, restore drills, and capacity headroom. Offline POS is a later capability: client-generated operation IDs, explicit inventory conflict policy, delayed-settlement display, and reconciliation before it is considered reliable.

## 14. Deployment architecture

Current Docker/Compose, PostgreSQL, health endpoint, Prisma migrations, and CI checks are a useful development baseline. Production target: TLS edge/WAF -> independently deployable Next.js and NestJS containers -> managed PostgreSQL; Redis/worker and object storage in private networking. Store secrets in a managed secret store. Apply reviewed migrations once per release, before new code receives traffic, with expand/contract compatibility. Use immutable images, staging parity, progressive rollout, smoke tests, monitoring/alerts, backup verification, and tested rollback. Separate production, staging, and test data and credentials.

Release gates include migration status, typecheck, lint, unit/integration/E2E tests, cross-tenant and cross-branch denial tests, payment and stock reconciliation, mobile/desktop and keyboard/screen-reader review, load test, security review, backup restore, and provider sandbox evidence. Target WCAG 2.2 AA for applicable UI and test actual Bangla rendering and receipt output. Define availability and recovery objectives with the business before committing to an SLA.

## 15. Development roadmap

| Phase | Outcome | Exit evidence |
| --- | --- | --- |
| 0. Baseline and contract | Inventory current routes, schema, migrations, roles, and user workflows; choose measured launch verticals and payment partners | Signed scope, data-flow map, endpoint permission matrix, release metrics |
| 1. Trust and correctness | Tenant/branch query constraints, composite integrity, authorization matrix, account recovery/MFA, idempotency, payment/return ledger, cash closing | Cross-tenant/branch tests, concurrency and reconciliation tests, migration/backfill checks |
| 2. Daily operations | Product edit/variants, stock count/transfer, purchase order/payable flows, pagination/search, exports, cashier workflow | End-to-end branch operations, bounded query/load results, audit coverage |
| 3. Commerce and billing | Storefront order lifecycle, verified payment adapters, subscription invoices/entitlements, builder revisions/assets/domains | Provider sandbox reconciliation, order retry tests, publication/rollback tests |
| 4. Vertical depth | Restaurant recipes/modifiers/KOT; pharmacy batch/expiry/prescription only after specialist and legal validation; grocery measure/scale; retail serial/warranty | Vertical acceptance suites, device tests, regulatory sign-off where applicable |
| 5. Scale and launch | Distributed limits/jobs, observability, backup/restore, load and security tests, complete English/Bangla and accessibility QA | Production readiness review with no unresolved launch blockers |

Ship in slices by one pilot business type and one branch workflow at a time. Do not advertise planned modules as usable or billable. Defer offline sales and automated refunds until their conflict and provider behavior are tested with real devices and sandbox credentials.

### Implementation status (updated 2026-10-10)

Phase 1 is in progress, not complete. The first slice adds a shared permission matrix for sensitive reads, branch-scoped POS availability without cost data, a sale-only product catalog, tenant-wide owner scope, and database-backed idempotency for POS and public storefront orders. Public customer creation now participates in the order transaction. Unit and rollback-only PostgreSQL tests cover authorization, retries, returns, and stock effects. The two new Prisma migrations have been applied to the local development database.

The next slice adds composite tenant foreign keys for required stock, purchase, order-branch, restaurant-table, and kitchen-ticket links. Migration `20261008120000_core_tenant_foreign_keys` checks existing data before replacing ten foreign keys; `20261010100000_restrict_tenant_key_updates` prevents dependent rows from cascading into another tenant when a referenced key changes. Both are applied locally, the Prisma Client is regenerated, and rollback-only tests cover cross-tenant inserts and reassignment attempts. Nullable links such as order customer/table and child item product still require a separate compatibility migration. Schedule constraint installation for a reviewed release window on large databases.

Before Phase 1 exit, complete account recovery/MFA, comprehensive route and branch authorization coverage, payment/return reconciliation, cash closing, composite tenant integrity, and concurrency/load evidence. Phases 2-5 remain planned. No live payment provider credentials are available, so automated settlement and provider sandbox verification cannot be claimed; transactional email is the only available messaging channel. Visual browser verification was unavailable in this environment and remains a release check.

## Current implementation and decisions still needed

Already present: shared domain catalog/config for ten profiles; tenant/branch/user schema; global auth, role, tenant, and module guards; POS with transactional stock deduction; purchasing and returns; restaurant tables/kitchen; manual subscription review; storefront draft/publish and public ordering; shared UI shell and primitives; CI/migration/deployment scaffolding. The audit and coverage documents contain narrower feature detail.

Before the first production release, decide the exact pilot verticals, first payment provider(s), whether public signup is controlled by approval or invitation, launch branch limit, tax/receipt policy after local review, data retention period, and measurable availability/recovery targets. These are product or compliance decisions; none requires a second application architecture.
