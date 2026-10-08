# Production readiness audit

This is a hard engineering audit of the current codebase. It is not a marketing checklist.

## Current verdict

The product is not production-ready. It is an MVP foundation with useful tenant, POS, inventory, subscription, storefront, and platform-admin primitives. It still needs security hardening, complete operational workflows, reliable deployment, and automated coverage before real customers should depend on it.

## Release blockers

| Priority | Area | Problem | Current action |
| --- | --- | --- | --- |
| P0 | Public onboarding | `POST /api/tenants` could create tenants and owner accounts without platform approval or rate limiting. | Fixed: public signup is disabled by default in production and production startup rejects `PUBLIC_SIGNUP_ENABLED=true`. |
| P0 | Abuse protection | Public login, signup, and storefront order endpoints need abuse protection. | Partially fixed: in-process rate limits now protect login, public signup, and storefront order placement. Open: replace with Redis-backed distributed limits and request logging before multi-instance production. |
| P0 | User/RBAC | Staff records and login accounts are separate; production account lifecycle needs recovery, MFA, email delivery, and policy review. | Partially fixed: Users & access screen, expiring single-use invitations, role/branch assignment, suspension with immediate API denial, and audit events. Open: email delivery, recovery, MFA, configurable permissions, and a full role/branch access audit. |
| P0 | POS financial correctness | No returns/refunds, cash closing, split tender, held orders, receipt numbering policy, or offline reconciliation. | Open: design and implement transactional POS lifecycle. |
| P0 | Deployment reliability | Local Windows builds can fail or hang in Next build around `.next/trace`; production deployment still needs real backup/restore, monitoring, logs, and rollback procedure. | Partially fixed: removed the web package's incompatible ESM setting after it caused a published storefront HTTP 500; the storefront now renders and all 40 live smoke checks pass. Open: containerized CI build and deployment runbook. A fresh production build was not run while the dev server owned `.next`. |
| P1 | Data completeness | Product edit/details, variants, branch transfer, stock count, batch/expiry, warranty/serial workflows are incomplete. | Open. |
| P1 | Storefront | Public ordering is basic and pay-on-delivery only; no customer accounts, payment gateway, delivery dispatch, or anti-spam controls. | Open. |
| P1 | Audit/compliance | Audit logs exist for some mutations only; retention policy, before/after diff, and export are missing. | Partially fixed: owner/admin Audit log UI with tenant-scoped cursor pages, category filters, and event details. Open: complete mutation coverage, retention policy, before/after diff, and export. |
| P1 | Reporting | Reports are basic and not exportable to CSV/PDF; no tax/profit/purchase/employee reporting. | Open. |
| P0 | Scale | Full-collection product, order, customer, supplier, and user lists will not support the stated 10,000-business/millions-of-orders target. | Open: server-side pagination, indexed search, bounded exports, load tests, and performance budgets. |
| P2 | UX architecture | Branch selection did not affect the server-rendered operational views. | Partially fixed: persistent branch preference now filters dashboard, orders, inventory, purchases, POS, reports, tables, and kitchen views. Orders and purchases filter in the API; tenant-wide catalogs/directories are still global by design. Branch permission behavior needs a full audit. |

## Next fixes

1. Replace in-process rate limits with Redis-backed distributed limits for auth, signup, and public storefront orders.
2. Replace open tenant signup with platform-admin-created invitations or a trial request approval queue.
3. Add email delivery, account recovery, MFA, and authorization matrix tests to the new Users & access flow.
4. Implement POS cash closing, returns/refunds, held orders, and split payment.
5. Add CI production build, migration status check, and smoke test job.

Latest local verification: typecheck, lint, four domain tests, four account/security tests, and 47 live smoke checks passed. Browser screenshot verification failed because both installed browsers crashed their GPU process; authenticated HTML responses and server-rendered branch selection were checked instead.
