# Requirement coverage audit

Scope: the active Next.js/NestJS/PostgreSQL application, not the older root `src/` prototype. This is an implementation inventory, not a claim of production certification. The source requirement is the multi-business Bangladesh SaaS report supplied by the product owner.

| Requirement area | Current state | Remaining work |
| --- | --- | --- |
| Tenant isolation, login, roles, branch access | API guards, separate business/platform login, owner/admin account management, expiring one-use invitations, role/branch assignment, suspension, and explicit platform-admin route access | Full security review, email delivery, account recovery, MFA, configurable permission administration, broader authorization tests, audit retention |
| Business types and module pricing | Shared configuration for ten business types; entitlements and manual subscription review | Self-service billing, gateway reconciliation, metering, invoice/tax documents, plan limits |
| POS and order history | Catalog search, photo tiles, discounts, VAT/service charge, cash/card/manual MFS records, due sale, branch stock deduction, browser POS terminal profile, printable 58mm/80mm receipt, auto-print/reprint after counter checkout, manager-approved full-order return ledger with stock disposition | Silent device-driver printing, hold/resume, split tender, partial returns, automatic gateway refunds, cash closing, offline conflict resolution, payment capture |
| Products and inventory | Product creation, image URL, branch balances, stock adjustment, low-stock view, movement ledger | Product editing, variants, stock count, branch transfers, batch/serial tracking, raw material/recipe deduction |
| Supplier and purchasing | Supplier directory and purchase receiving | Purchase order approvals, supplier liabilities, due-payment reconciliation, price history reports |
| Restaurant | Tables, dine-in order, kitchen queue/status, table settlement | Recipe/BOM, modifiers/combo meals, KOT printing, waiter assignment, split bill, delivery operations |
| Pharmacy | Medicine-oriented fields, prescription-required sale blocked until compliant workflow exists | Prescription upload/verification, batch and expiry control, dispensing records, pharmacist review, compliance validation |
| Grocery and retail | Shared catalog/POS/inventory configuration | Barcode/scale integration, weighted quantities, carton conversion, variant-wise stock, warranty and exchanges |
| Staff and customers | Directories, basic customer due balance | Attendance, payroll, loyalty, account login, order tracking, CRM campaigns |
| Storefront and builder | Published snapshot, drag-reorder sections, themes, catalog/branch stock sync, cart, pending pickup/delivery order | Custom domains, image/banner management, product detail pages, online payment, promotions, delivery dispatch, customer accounts, richer section controls |
| Platform administration | Tenant status/module controls, payment review | Support-access controls, usage analytics, revenue reporting, templates, trials and invoicing automation |
| Enterprise shell, navigation, search | Module-aware navigation, collapsible sidebar, persistent operational branch filter, workspace status, page/tool command palette, Users & access, and a paginated Audit log | Full global entity search, real notification feed, dedicated settings/permissions pages, consistent branch scoping for all relevant data |
| Deployment and operations | Docker recipe, Prisma migrations, health endpoint, local production build, CI build/test/migration workflow | Hosted CI run, real-environment container build, TLS/proxy, backups and restore test, monitoring, rate limits, secret rotation, full end-to-end/accessibility/cross-browser testing |

Verification performed locally across the project: strict typecheck, lint, a fresh production build, four domain unit tests, four account/security tests, four return/report tests, one rollback-only PostgreSQL return transaction test, migration status, and 49 live HTTP smoke checks. The return workflow is a manual accounting record, not an automatic payment-gateway refund. Browser visual verification was unavailable locally. The new CI workflow has not yet run on GitHub. These checks do not validate every transaction, device, payment, legal obligation, or visual state. Do not onboard real customers until the release blockers above are implemented and independently tested.

## Current market-readiness decision

The platform is an advanced MVP foundation, not yet a production-certified enterprise SaaS. It is strong enough to continue building as a multi-business product because tenancy, modules, subscriptions, storefront, POS, inventory, staff, suppliers, restaurant tables, and kitchen flow already exist. It is not ready for paid customer rollout until the remaining work above is closed, especially authentication hardening, partial returns, offline POS reconciliation, payment integrations, backups, monitoring, and end-to-end testing.

Recommended commercial sequence:

1. Harden SaaS core: RBAC screens, invitations, MFA/recovery, rate limits, audit retention, backups, monitoring, and production deployment runbooks.
2. Finish POS as a standalone product: silent printer bridge, hold/resume, returns/refunds, cash closing, split tender, Bangla/English receipt templates, and offline queue reconciliation.
3. Finish Inventory as a standalone product: edit flows, branch transfer, stock count, batch/expiry, variants, raw materials/BOM, and purchase price history.
4. Finish Staff as a standalone product: attendance, shift roster, payroll, role-linked user accounts, and approval controls.
5. Package vertical editions for Bangladesh: Restaurant first, Grocery/Retail second, Pharmacy only after prescription and batch/expiry compliance are production-tested.
